import { Room, Client } from 'colyseus';
import {
  TICK_RATE,
  PATCH_RATE,
  RECONNECT_GRACE_SECONDS,
  BATTLE_DURATION_SECONDS,
  MAP_M0,
  MAP_PROTOTYPE_WIDTH,
  MAP_PROTOTYPE_HEIGHT,
  PLAYER_RADIUS,
  PlayerSimulationState,
  InputFrame,
  stepMovement,
  directionToVector,
  BUTTON_LIGHT,
  BUTTON_SKILL1,
  BUTTON_SKILL2,
  BUTTON_DODGE,
  BUTTON_GUARD,
  RoomPhase,
  DuelRoomState,
  validateInputFrame,
  verifyClientHandshake,
  PROTOCOL_VERSION,
  MAP_REVISION_M0,
  SKILL_ROSTER,
  UNIVERSAL_COMBAT,
  ActiveProjectile,
  ActiveClone,
  findEarliestTOI,
  isInFrontArc,
  hasLineOfSight
} from '@ninja/shared';
import { AdmissionManager } from '../admission/AdmissionManager.js';

export class DuelRoom extends Room<any> {
  override maxClients = 2;
  override autoDispose = true;

  private admission = AdmissionManager.getInstance();
  private inviteCode = '';
  private currentTick = 0;
  private roundTimerTicks = BATTLE_DURATION_SECONDS * TICK_RATE;
  private countdownTicks = 3 * TICK_RATE;

  private pendingInputs: Map<string, InputFrame[]> = new Map();
  private projectiles: ActiveProjectile[] = [];
  private clones: ActiveClone[] = [];
  private parryWindowTicks: Map<string, number> = new Map();
  private lastGuardPressed: Map<string, boolean> = new Map();
  private readyStates: Map<string, boolean> = new Map();

  override onCreate(options: any) {
    this.inviteCode = options.inviteCode || 'UNKNOWN';
    this.admission.registerRoom(this.roomId, this.inviteCode);

    // Initial state
    this.setState({
      roomId: this.roomId,
      inviteCode: this.inviteCode,
      phase: 'waiting',
      countdownSeconds: 3,
      roundTimerSeconds: BATTLE_DURATION_SECONDS,
      serverTick: 0,
      winnerId: null,
      finishReason: null,
      players: {}
    });

    // Handle client messages
    this.onMessage('select_fighter', (client, message: { fighter: 'fighter_a' | 'fighter_b' }) => {
      if (this.state.phase !== 'waiting') return;
      const player = this.state.players[client.sessionId];
      if (player && (message.fighter === 'fighter_a' || message.fighter === 'fighter_b')) {
        player.fighter = message.fighter;
        this.broadcast('fighter_updated', { sessionId: client.sessionId, fighter: message.fighter });
      }
    });

    this.onMessage('ready', (client) => {
      if (this.state.phase !== 'waiting') return;
      const isReady = !this.readyStates.get(client.sessionId);
      this.readyStates.set(client.sessionId, isReady);
      this.broadcast('ready_updated', { sessionId: client.sessionId, isReady });

      // If 2 clients and both are ready, start countdown!
      if (this.clients.length === 2) {
        const allReady = Array.from(this.readyStates.values()).every(Boolean);
        if (allReady) {
          this.startCountdown();
        }
      }
    });

    this.onMessage('handshake', (client, message: { protocolVersion: number; mapRevision: string }) => {
      const result = verifyClientHandshake(message);
      if (!result.valid) {
        client.send('handshake_rejected', { error: result.error });
        client.leave(4001);
      } else {
        client.send('handshake_accepted', {
          protocolVersion: PROTOCOL_VERSION,
          mapRevision: MAP_REVISION_M0
        });
      }
    });

    this.onMessage('input', (client, rawInput: any) => {
      if (this.state.phase !== 'playing') return;

      const player = this.state.players[client.sessionId];
      if (!player || !player.connected) return;

      // TC-06: Authoritative input validation
      // Rejects injected x/y/hp/damage, NaN/Infinity, out-of-range bitmask, stale/future ticks
      const validation = validateInputFrame(rawInput, this.currentTick, 60);
      if (!validation.valid || !validation.sanitized) {
        return;
      }

      // Rate limit inputs (cap max 60 inputs per second per client)
      let buffer = this.pendingInputs.get(client.sessionId);
      if (!buffer) {
        buffer = [];
        this.pendingInputs.set(client.sessionId, buffer);
      }
      if (buffer.length < 5) {
        buffer.push(validation.sanitized);
      }
    });

    this.onMessage('rematch', (_client) => {
      if (this.state.phase === 'finished') {
        this.resetMatch();
      }
    });

    // 30Hz Authoritative Fixed Timestep Simulation Loop
    this.setSimulationInterval((dt) => this.simulationStep(dt / 1000), 1000 / TICK_RATE);

    // 20Hz State Synchronization
    this.setPatchRate(1000 / PATCH_RATE);
  }

  override onAuth(_client: Client, options: any): boolean {
    // 1. Reconnect authentication
    if (options.isReconnect && options.guestId && options.secret) {
      const valid = this.admission.validateReconnectSecret(this.roomId, options.guestId, options.secret);
      if (!valid) throw new Error('Invalid or expired reconnect credentials');
      return true;
    }

    // 2. Initial join admission ticket validation
    const ticket = options.ticket;
    const admissionResult = this.admission.validateAndConsumeTicket(this.roomId, ticket);

    if (!admissionResult.valid) {
      throw new Error(`Admission rejected: ${admissionResult.error}`);
    }

    return true;
  }

  override onJoin(client: Client, options: any) {
    const isFirst = Object.keys(this.state.players).length === 0;
    const guestId = options.guestId || `guest_${client.sessionId.slice(0, 6)}`;
    const fighter = isFirst ? 'fighter_a' : 'fighter_b';
    const spawn = isFirst ? MAP_M0.spawns.fighter_a : MAP_M0.spawns.fighter_b;

    const playerState: PlayerSimulationState = {
      id: guestId,
      sessionId: client.sessionId,
      fighter,
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      facing: isFirst ? 'E' : 'W',
      action: 'idle',
      actionTicksRemaining: 0,
      hp: 1000,
      maxHp: 1000,
      chakra: 100,
      maxChakra: 100,
      stamina: 100,
      maxStamina: 100,
      guardRemainingStamina: 100,
      isGuarding: false,
      isParrying: false,
      connected: true,
      reconnectGraceTicks: 0,
      skill1CooldownTicks: 0,
      skill2CooldownTicks: 0,
      score: 0
    };

    this.state.players[client.sessionId] = playerState;
    this.readyStates.set(client.sessionId, false);

    // Issue ephemeral reconnect secret
    const secret = this.admission.issueReconnectSecret(this.roomId, guestId);
    client.send('admission_confirmed', {
      guestId,
      reconnectSecret: secret,
      assignedFighter: fighter
    });
  }

  override onLeave(client: Client, code?: number) {
    const consented = code === 1000;
    const player = this.state.players[client.sessionId];
    if (!player) return;

    if (this.state.phase === 'playing' && !consented) {
      // Decision D07: Disconnected fighter continues in round, stands stationary and damageable!
      player.connected = false;
      player.vx = 0;
      player.vy = 0;
      player.reconnectGraceTicks = RECONNECT_GRACE_SECONDS * TICK_RATE; // 15 seconds grace

      this.broadcast('player_disconnected', {
        sessionId: client.sessionId,
        graceSeconds: RECONNECT_GRACE_SECONDS
      });
    } else {
      // If during waiting or countdown, reset ready and countdown
      delete this.state.players[client.sessionId];
      this.readyStates.delete(client.sessionId);

      if (this.state.phase === 'countdown') {
        this.state.phase = 'waiting';
        this.countdownTicks = 3 * TICK_RATE;
        this.state.countdownSeconds = 3;
        this.broadcast('countdown_cancelled', { reason: 'Player left during countdown' });
      }
    }
  }

  override onDispose() {
    this.admission.unregisterRoom(this.roomId);
  }

  private startCountdown() {
    this.state.phase = 'countdown';
    this.countdownTicks = 3 * TICK_RATE;
  }

  private resetMatch() {
    this.state.phase = 'waiting';
    this.state.winnerId = null;
    this.state.finishReason = null;
    this.roundTimerTicks = BATTLE_DURATION_SECONDS * TICK_RATE;
    this.state.roundTimerSeconds = BATTLE_DURATION_SECONDS;
    this.projectiles = [];
    this.clones = [];
    this.parryWindowTicks.clear();
    this.lastGuardPressed.clear();

    // Reset spawns & resources
    const sessions = Object.keys(this.state.players);
    if (sessions[0]) {
      const p1 = this.state.players[sessions[0]];
      p1.x = MAP_M0.spawns.fighter_a.x;
      p1.y = MAP_M0.spawns.fighter_a.y;
      p1.hp = 1000;
      p1.chakra = 100;
      p1.stamina = 100;
      p1.action = 'idle';
      p1.actionTicksRemaining = 0;
      p1.isGuarding = false;
      p1.isParrying = false;
      p1.skill1CooldownTicks = 0;
      p1.skill2CooldownTicks = 0;
    }
    if (sessions[1]) {
      const p2 = this.state.players[sessions[1]];
      p2.x = MAP_M0.spawns.fighter_b.x;
      p2.y = MAP_M0.spawns.fighter_b.y;
      p2.hp = 1000;
      p2.chakra = 100;
      p2.stamina = 100;
      p2.action = 'idle';
      p2.actionTicksRemaining = 0;
      p2.isGuarding = false;
      p2.isParrying = false;
      p2.skill1CooldownTicks = 0;
      p2.skill2CooldownTicks = 0;
    }

    for (const s of sessions) {
      this.readyStates.set(s, false);
    }
    this.broadcast('match_reset', {});
  }

  private simulationStep(dt: number) {
    this.currentTick++;
    this.state.serverTick = this.currentTick;

    if (this.state.phase === 'countdown') {
      this.countdownTicks--;
      this.state.countdownSeconds = Math.ceil(this.countdownTicks / TICK_RATE);
      if (this.countdownTicks <= 0) {
        this.state.phase = 'playing';
        this.broadcast('round_start', {});
      }
      return;
    }

    if (this.state.phase !== 'playing') {
      return;
    }

    // Decrement round timer
    this.roundTimerTicks--;
    this.state.roundTimerSeconds = Math.max(0, Math.ceil(this.roundTimerTicks / TICK_RATE));

    if (this.roundTimerTicks <= 0) {
      this.evaluateTimerOutcome();
      return;
    }

    // 1. Process Player Disconnect Grace (D07)
    const sessions = Object.keys(this.state.players);
    const allDisconnected = sessions.length === 2 && sessions.every(s => !this.state.players[s].connected);

    for (const session of sessions) {
      const p = this.state.players[session];
      if (!p.connected && p.reconnectGraceTicks > 0) {
        p.reconnectGraceTicks--;
        if (p.reconnectGraceTicks <= 0) {
          if (allDisconnected) {
            this.state.winnerId = null;
            this.finishRound('double_disconnect_timeout');
            return;
          }
          const opponentSession = sessions.find(s => s !== session);
          if (opponentSession) {
            this.state.winnerId = this.state.players[opponentSession].id;
          }
          this.finishRound('disconnect_forfeit');
          return;
        }
      }
    }

    // 2. Process Player Inputs, FSM & Movement
    for (const session of Object.keys(this.state.players)) {
      const p = this.state.players[session];
      if (!p.connected) {
        p.vx = 0;
        p.vy = 0;
        continue;
      }

      // Decrement skill cooldowns
      if (p.skill1CooldownTicks > 0) p.skill1CooldownTicks--;
      if (p.skill2CooldownTicks > 0) p.skill2CooldownTicks--;

      // Decrement action states (hitstun, guard_break, dodge)
      if (['hitstun', 'guard_break'].includes(p.action)) {
        p.actionTicksRemaining--;
        if (p.actionTicksRemaining <= 0) {
          p.action = 'idle';
        }
        p.vx = 0;
        p.vy = 0;
        continue; // Cannot move or act during hitstun/guard_break
      }

      const buffer = this.pendingInputs.get(session);
      const input = (buffer && buffer.shift()) || {
        tick: this.currentTick,
        dx: 0,
        dy: 0,
        aimAngle: 0,
        aimDirection: p.facing,
        buttons: 0
      };

      // Guard / Parry Edge Detection
      const guardHeld = (input.buttons & BUTTON_GUARD) !== 0;
      const wasGuardHeld = this.lastGuardPressed.get(session) || false;
      this.lastGuardPressed.set(session, guardHeld);

      if (guardHeld && !wasGuardHeld) {
        // Guard press edge -> Enter Parry Window (4 ticks)
        p.action = 'parry';
        p.isParrying = true;
        p.isGuarding = false;
        this.parryWindowTicks.set(session, UNIVERSAL_COMBAT.parry.windowTicks);
      } else if (guardHeld) {
        let parryRem = this.parryWindowTicks.get(session) || 0;
        if (parryRem > 0) {
          parryRem--;
          this.parryWindowTicks.set(session, parryRem);
          if (parryRem <= 0) {
            // Parry window expired -> transition to regular Guard
            p.action = 'guard';
            p.isParrying = false;
            p.isGuarding = true;
          }
        }
      } else {
        // Guard released
        if (p.action === 'guard' || p.action === 'parry') {
          p.action = 'idle';
        }
        p.isGuarding = false;
        p.isParrying = false;
        this.parryWindowTicks.delete(session);
      }

      // Dodge (Space)
      if ((input.buttons & BUTTON_DODGE) !== 0 && p.action !== 'dodge' && p.stamina >= UNIVERSAL_COMBAT.dodge.staminaCost) {
        p.action = 'dodge';
        p.actionTicksRemaining = UNIVERSAL_COMBAT.dodge.moveTicks;
        p.stamina -= UNIVERSAL_COMBAT.dodge.staminaCost;
      }
      if (p.action === 'dodge') {
        p.actionTicksRemaining--;
        if (p.actionTicksRemaining <= 0) p.action = 'idle';
      }

      // Light Attack (J)
      if ((input.buttons & BUTTON_LIGHT) !== 0 && p.action === 'idle') {
        this.executeLightAttack(p);
      }

      // Skill 1 (K)
      if ((input.buttons & BUTTON_SKILL1) !== 0 && p.action === 'idle') {
        if (p.fighter === 'fighter_a') {
          this.castFighterAClone(p);
        } else {
          this.castFighterBFireball(p);
        }
      }

      // Skill 2 (L)
      if ((input.buttons & BUTTON_SKILL2) !== 0 && p.action === 'idle') {
        if (p.fighter === 'fighter_a') {
          this.castFighterAWindShuriken(p);
        } else {
          this.castFighterBLightningCounter(p);
        }
      }

      // Passive Resource Regen
      if (p.hp > 0) {
        p.chakra = Math.min(p.maxChakra, p.chakra + UNIVERSAL_COMBAT.regen.chakraPerTick);
        if (!p.isGuarding) {
          p.stamina = Math.min(p.maxStamina, p.stamina + UNIVERSAL_COMBAT.regen.staminaPerTick);
        }
      }

      stepMovement(p, input, dt, MAP_PROTOTYPE_WIDTH, MAP_PROTOTYPE_HEIGHT, MAP_M0.obstacles);
    }

    // 3. Step Clones
    this.stepClones();

    // 4. Step Projectiles & Swept Collisions
    this.stepServerProjectiles(dt);

    // 5. Check Victory Conditions (KO)
    this.evaluateKO();
  }

  private executeLightAttack(attacker: PlayerSimulationState) {
    const spec = UNIVERSAL_COMBAT.light;
    for (const session of Object.keys(this.state.players)) {
      const target = this.state.players[session];
      if (target.id === attacker.id || target.hp <= 0) continue;

      const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
      if (dist <= spec.range + PLAYER_RADIUS) {
        const inArc = isInFrontArc(attacker.x, attacker.y, attacker.facing, target.x, target.y, spec.frontArcDegrees);
        if (inArc) {
          this.applyDamageToTarget(target, attacker, spec.damage, false, attacker.x, attacker.y);
        }
      }
    }
  }

  private castFighterAClone(caster: PlayerSimulationState) {
    const spec = SKILL_ROSTER.fighter_a_clone_feint;
    if (caster.chakra < spec.chakraCost || caster.skill1CooldownTicks > 0) return;

    caster.chakra -= spec.chakraCost;
    caster.skill1CooldownTicks = spec.cooldownTicks;

    const vec = directionToVector(caster.facing);
    const spawnX = Math.max(PLAYER_RADIUS, Math.min(MAP_PROTOTYPE_WIDTH - PLAYER_RADIUS, caster.x + vec.x * 50));
    const spawnY = Math.max(PLAYER_RADIUS, Math.min(MAP_PROTOTYPE_HEIGHT - PLAYER_RADIUS, caster.y + vec.y * 50));

    // Max 1 active clone per caster
    this.clones = this.clones.filter(c => c.ownerId !== caster.id);
    this.clones.push({
      id: `clone_${this.currentTick}_${caster.id}`,
      ownerId: caster.id,
      x: spawnX,
      y: spawnY,
      facing: caster.facing,
      hp: 1,
      lifetimeTicks: spec.lifetimeTicks
    });
  }

  private castFighterAWindShuriken(caster: PlayerSimulationState) {
    const spec = SKILL_ROSTER.fighter_a_wind_shuriken;
    if (caster.chakra < spec.chakraCost || caster.skill2CooldownTicks > 0) return;

    caster.chakra -= spec.chakraCost;
    caster.skill2CooldownTicks = spec.cooldownTicks;

    const vec = directionToVector(caster.facing);
    this.projectiles.push({
      id: `proj_wind_${this.currentTick}`,
      skillId: spec.id,
      ownerId: caster.id,
      x: caster.x + vec.x * (PLAYER_RADIUS + 8),
      y: caster.y - 10 + vec.y * (PLAYER_RADIUS + 8),
      oldX: caster.x + vec.x * (PLAYER_RADIUS + 8),
      oldY: caster.y - 10 + vec.y * (PLAYER_RADIUS + 8),
      vx: vec.x * spec.speed,
      vy: vec.y * spec.speed,
      radius: spec.radius,
      damage: spec.damage,
      type: 'projectile',
      lifetimeTicks: spec.lifetimeTicks,
      hitTargetIds: []
    });
  }

  private castFighterBFireball(caster: PlayerSimulationState) {
    const spec = SKILL_ROSTER.fighter_b_fireball;
    if (caster.chakra < spec.chakraCost || caster.skill1CooldownTicks > 0) return;

    caster.chakra -= spec.chakraCost;
    caster.skill1CooldownTicks = spec.cooldownTicks;

    const vec = directionToVector(caster.facing);
    this.projectiles.push({
      id: `proj_fire_${this.currentTick}`,
      skillId: spec.id,
      ownerId: caster.id,
      x: caster.x + vec.x * (PLAYER_RADIUS + 8),
      y: caster.y - 10 + vec.y * (PLAYER_RADIUS + 8),
      oldX: caster.x + vec.x * (PLAYER_RADIUS + 8),
      oldY: caster.y - 10 + vec.y * (PLAYER_RADIUS + 8),
      vx: vec.x * spec.speed,
      vy: vec.y * spec.speed,
      radius: spec.radius,
      damage: spec.damage,
      type: 'projectile_aoe',
      impactRadius: spec.impactRadius,
      lifetimeTicks: spec.lifetimeTicks,
      hitTargetIds: []
    });
  }

  private castFighterBLightningCounter(caster: PlayerSimulationState) {
    const spec = SKILL_ROSTER.fighter_b_lightning_counter;
    if (caster.chakra < spec.chakraCost || caster.skill2CooldownTicks > 0) return;

    caster.chakra -= spec.chakraCost;
    caster.skill2CooldownTicks = spec.cooldownTicks;
    caster.action = 'parry';
    caster.isParrying = true;
    this.parryWindowTicks.set(caster.sessionId, spec.timelineTicks.active);
  }

  private stepClones() {
    for (let i = this.clones.length - 1; i >= 0; i--) {
      const c = this.clones[i];
      c.lifetimeTicks--;
      if (c.lifetimeTicks <= 0 || c.hp <= 0) {
        this.clones.splice(i, 1);
      }
    }
  }

  private stepServerProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.oldX = p.x;
      p.oldY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetimeTicks--;

      if (p.x < 0 || p.x > MAP_PROTOTYPE_WIDTH || p.y < 0 || p.y > MAP_PROTOTYPE_HEIGHT || p.lifetimeTicks <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Collect candidate targets (opponents and clones)
      const targets: { id: string; x: number; y: number; radius: number; isClone?: boolean }[] = [];
      for (const s of Object.keys(this.state.players)) {
        const actor = this.state.players[s];
        if (actor.id !== p.ownerId && actor.hp > 0) {
          targets.push({ id: actor.id, x: actor.x, y: actor.y - 10, radius: PLAYER_RADIUS });
        }
      }
      for (const c of this.clones) {
        if (c.ownerId !== p.ownerId && c.hp > 0) {
          targets.push({ id: c.id, x: c.x, y: c.y - 10, radius: PLAYER_RADIUS, isClone: true });
        }
      }

      // Earliest-TOI swept collision check
      const hit = findEarliestTOI(p.oldX, p.oldY, p.x, p.y, p.radius, MAP_M0.obstacles, targets);

      if (hit) {
        p.x = hit.x;
        p.y = hit.y;

        if (hit.type === 'wall') {
          // Fireball AoE on wall impact
          if (p.type === 'projectile_aoe' && p.impactRadius) {
            this.applyAoEExplosion(p, hit.x, hit.y, p.impactRadius, p.damage);
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (hit.type === 'clone') {
          const cloneIdx = this.clones.findIndex(c => c.id === hit.targetId);
          if (cloneIdx >= 0) {
            this.clones.splice(cloneIdx, 1); // 1-hit destroy
          }
          if (p.type === 'projectile_aoe' && p.impactRadius) {
            this.applyAoEExplosion(p, hit.x, hit.y, p.impactRadius, p.damage);
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (hit.type === 'actor') {
          const target = Object.values(this.state.players).find(pl => (pl as any).id === hit.targetId) as PlayerSimulationState;
          const attacker = Object.values(this.state.players).find(pl => (pl as any).id === p.ownerId) as PlayerSimulationState;

          if (target && attacker) {
            this.applyDamageToTarget(target, attacker, p.damage, true, p.oldX, p.oldY);
          }

          if (p.type === 'projectile_aoe' && p.impactRadius) {
            this.applyAoEExplosion(p, hit.x, hit.y, p.impactRadius, p.damage);
          }
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  private applyDamageToTarget(
    target: PlayerSimulationState,
    attacker: PlayerSimulationState,
    damage: number,
    isProjectile: boolean,
    sourceX: number,
    sourceY: number
  ) {
    // 1. Dodge i-frame check (invulnerable during first 4 ticks)
    if (target.action === 'dodge' && target.actionTicksRemaining > 6) {
      return; // Evaded!
    }

    const inFront = isInFrontArc(target.x, target.y, target.facing, sourceX, sourceY, UNIVERSAL_COMBAT.guard.frontArcDegrees);

    // 2. Parry check (front 120° arc during parry window)
    if (target.isParrying && inFront) {
      // Counter Jutsu: if target is Fighter B executing lightning counter, counter-attack!
      if (target.fighter === 'fighter_b') {
        const spec = SKILL_ROSTER.fighter_b_lightning_counter;
        const dist = Math.hypot(attacker.x - target.x, attacker.y - target.y);
        const hasLOS = hasLineOfSight(target.x, target.y, attacker.x, attacker.y, MAP_M0.obstacles);
        if (dist <= (spec.counterRange || 180) && hasLOS) {
          attacker.hp = Math.max(0, attacker.hp - spec.damage);
          attacker.action = 'hitstun';
          attacker.actionTicksRemaining = 12;
        }
      }
      return; // Hit consumed, 0 damage taken
    }

    // 3. Guard check (front 120° arc)
    if (target.isGuarding && inFront) {
      const staminaCost = UNIVERSAL_COMBAT.guard.staminaCostPerHit;
      if (target.stamina >= staminaCost) {
        target.stamina -= staminaCost;
        target.hp = Math.max(0, target.hp - Math.floor(damage * UNIVERSAL_COMBAT.guard.damageFractionReceived));
      } else {
        // Guard Break! Full damage taken, stamina set to 0, 20 ticks hitstun
        target.stamina = 0;
        target.hp = Math.max(0, target.hp - damage);
        target.action = 'guard_break';
        target.actionTicksRemaining = UNIVERSAL_COMBAT.guard.breakHitstunTicks;
        target.isGuarding = false;
      }
      return;
    }

    // 4. Direct Hit
    target.hp = Math.max(0, target.hp - damage);
    target.action = 'hitstun';
    target.actionTicksRemaining = UNIVERSAL_COMBAT.light.hitstunTicks;
  }

  private applyAoEExplosion(p: ActiveProjectile, boomX: number, boomY: number, radius: number, damage: number) {
    for (const session of Object.keys(this.state.players)) {
      const target = this.state.players[session];
      if (target.id === p.ownerId || target.hp <= 0) continue;

      const dist = Math.hypot(target.x - boomX, target.y - boomY);
      if (dist <= radius + PLAYER_RADIUS) {
        const hasLOS = hasLineOfSight(boomX, boomY, target.x, target.y, MAP_M0.obstacles);
        if (hasLOS) {
          target.hp = Math.max(0, target.hp - Math.floor(damage * 0.6));
        }
      }
    }
  }

  private evaluateKO() {
    const players = Object.values(this.state.players) as PlayerSimulationState[];
    if (players.length === 2 && players[0] && players[1]) {
      if (players[0].hp <= 0 && players[1].hp <= 0) {
        this.state.winnerId = null; // Double KO -> Draw
        this.finishRound('double_ko');
      } else if (players[0].hp <= 0) {
        this.state.winnerId = players[1].id;
        this.finishRound('ko');
      } else if (players[1].hp <= 0) {
        this.state.winnerId = players[0].id;
        this.finishRound('ko');
      }
    }
  }

  private evaluateTimerOutcome() {
    const players = Object.values(this.state.players) as PlayerSimulationState[];
    if (players.length === 2 && players[0] && players[1]) {
      if (players[0].hp > players[1].hp) {
        this.state.winnerId = players[0].id;
      } else if (players[1].hp > players[0].hp) {
        this.state.winnerId = players[1].id;
      } else {
        this.state.winnerId = null; // Draw
      }
    }
    this.finishRound('time_limit');
  }

  private finishRound(reason: string) {
    this.state.phase = 'finished';
    this.state.finishReason = reason;
    this.broadcast('round_ended', {
      winnerId: this.state.winnerId,
      reason
    });
  }
}
