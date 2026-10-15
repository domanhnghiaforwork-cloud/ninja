import Phaser from 'phaser';
import {
  MAP_M0,
  MAP_M1,
  MAP_PROTOTYPE_WIDTH,
  MAP_PROTOTYPE_HEIGHT,
  MAP_VERTICAL_SLICE_WIDTH,
  MAP_VERTICAL_SLICE_HEIGHT,
  PLAYER_RADIUS,
  TICK_RATE,
  REMOTE_INTERPOLATION_MS,
  PROTOCOL_VERSION,
  MAP_REVISION_M0,
  MAP_REVISION_M1,
  PlayerSimulationState,
  InputFrame,
  stepMovement,
  directionToVector,
  BUTTON_LIGHT,
  BUTTON_SKILL1,
  BUTTON_SKILL2,
  BUTTON_DODGE,
  BUTTON_GUARD,
  hasLineOfSight,
  RemoteSnapshot,
  interpolateRemotePosition,
  RectAABB
} from '@ninja/shared';
import { InputManager } from '../input/InputManager';
import { AnimationLoader } from '../animation/AnimationLoader';
import { VFXManager } from '../vfx/VFXManager';
import { AudioManager } from '../audio/AudioManager';
import { BattleHUD } from '../ui/BattleHUD';
import { ProfilerOverlay } from '../ui/ProfilerOverlay';

interface VisualActor {
  state: PlayerSimulationState;
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  facingArrow: Phaser.GameObjects.Line;
  shadow: Phaser.GameObjects.Ellipse;
  shieldGraphic: Phaser.GameObjects.Arc;
}

interface ActiveProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: 'light' | 'skill1' | 'skill2';
  graphic: Phaser.GameObjects.Arc;
  lifetime: number;
}

export class BattleScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private currentTick = 0;
  private accumulator = 0;
  private readonly fixedStep = 1 / TICK_RATE;

  private mapData = MAP_M1;
  private mapWidth = MAP_VERTICAL_SLICE_WIDTH;
  private mapHeight = MAP_VERTICAL_SLICE_HEIGHT;

  private playerA!: VisualActor;
  private playerB!: VisualActor;
  private projectiles: ActiveProjectile[] = [];

  // Core managers
  private vfxManager!: VFXManager;
  private audioManager = AudioManager.getInstance();
  private hud!: BattleHUD;
  private profiler!: ProfilerOverlay;

  private roundTimeRemaining = 180;

  // Online netcode state
  private mode: 'offline' | 'online' = 'offline';
  private room: any = null;
  private mySessionId = '';
  private pendingInputs: InputFrame[] = [];
  private remoteSnapshots: RemoteSnapshot[] = [];
  private serverTick = 0;
  private reconciliationCorrections = 0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { mode?: 'offline' | 'online'; room?: any; mapId?: 'm0' | 'm1' }) {
    this.mode = data.mode || 'offline';
    this.room = data.room || null;
    this.pendingInputs = [];
    this.remoteSnapshots = [];
    this.reconciliationCorrections = 0;

    if (data.mapId === 'm0') {
      this.mapData = MAP_M0;
      this.mapWidth = MAP_PROTOTYPE_WIDTH;
      this.mapHeight = MAP_PROTOTYPE_HEIGHT;
    } else {
      this.mapData = MAP_M1;
      this.mapWidth = MAP_VERTICAL_SLICE_WIDTH;
      this.mapHeight = MAP_VERTICAL_SLICE_HEIGHT;
    }
  }

  create() {
    // 1. Initialize systems
    this.inputManager = new InputManager(this);
    this.vfxManager = new VFXManager(this);
    AnimationLoader.init(this);

    // Audio unlock on first canvas click
    this.input.on('pointerdown', () => {
      this.audioManager.unlock();
    });

    // 2. Set camera bounds to match tactical arena
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // 3. Render Tactical Map
    this.renderMap();

    // 4. Initialize Fighters with 8-direction sprite atlases
    const spawnA = this.mapData.spawns.fighter_a;
    const spawnB = this.mapData.spawns.fighter_b;
    this.playerA = this.createActor('player_a', 'fighter_a', spawnA.x, spawnA.y);
    this.playerB = this.createActor('player_b', 'fighter_b', spawnB.x, spawnB.y);

    // 5. Camera follow local player
    this.cameras.main.startFollow(this.playerA.container, true, 0.1, 0.1);

    // 6. Create HUD & Profiler
    this.hud = new BattleHUD(this, (preset) => {
      this.vfxManager.setQuality(preset);
    });
    this.profiler = new ProfilerOverlay(this);

    // 7. Setup Round Timer for offline or sync from server
    if (this.mode === 'offline') {
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (this.roundTimeRemaining > 0) {
            this.roundTimeRemaining--;
            if (this.roundTimeRemaining === 3 || this.roundTimeRemaining === 2 || this.roundTimeRemaining === 1) {
              this.audioManager.playSound('countdown');
            }
          }
        },
        loop: true
      });
    } else if (this.room) {
      this.setupOnlineListeners();
    }
  }

  private setupOnlineListeners() {
    this.mySessionId = this.room.sessionId;

    // Handshake verification
    this.room.send('handshake', {
      protocolVersion: PROTOCOL_VERSION,
      mapRevision: this.mapData.revision
    });

    // Authoritative state sync & reconciliation
    this.room.onStateChange((state: any) => {
      this.serverTick = state.serverTick;
      this.roundTimeRemaining = state.roundTimerSeconds;

      const myState = state.players[this.mySessionId];
      const opponentSessionId = Object.keys(state.players || {}).find((s) => s !== this.mySessionId);
      const opponentState = opponentSessionId ? state.players[opponentSessionId] : null;

      // Local player reconciliation
      if (myState) {
        this.playerA.state.hp = myState.hp;
        this.playerA.state.chakra = myState.chakra;
        this.playerA.state.stamina = myState.stamina;
        this.playerA.state.action = myState.action;
        this.playerA.state.isGuarding = myState.isGuarding;
        this.playerA.state.skill1CooldownTicks = myState.skill1CooldownTicks;
        this.playerA.state.skill2CooldownTicks = myState.skill2CooldownTicks;

        const drift = Math.hypot(this.playerA.state.x - myState.x, this.playerA.state.y - myState.y);
        if (drift > 1.0) {
          this.reconciliationCorrections++;
          this.playerA.state.x = myState.x;
          this.playerA.state.y = myState.y;

          for (const input of this.pendingInputs) {
            if (input.tick > this.serverTick) {
              stepMovement(this.playerA.state, input, this.fixedStep, this.mapWidth, this.mapHeight, this.mapData.obstacles);
            }
          }
        }

        this.pendingInputs = this.pendingInputs.filter((inp) => inp.tick > this.serverTick);
        if (this.pendingInputs.length > 120) {
          this.pendingInputs = this.pendingInputs.slice(-120);
        }
      }

      // Remote player snapshot buffering
      if (opponentState) {
        this.remoteSnapshots.push({
          tick: state.serverTick,
          time: Date.now(),
          x: opponentState.x,
          y: opponentState.y,
          facing: opponentState.facing,
          action: opponentState.action,
          hp: opponentState.hp
        });
        if (this.remoteSnapshots.length > 60) {
          this.remoteSnapshots.shift();
        }

        this.playerB.state.hp = opponentState.hp;
        this.playerB.state.chakra = opponentState.chakra;
        this.playerB.state.stamina = opponentState.stamina;
        this.playerB.state.isGuarding = opponentState.isGuarding;
      }
    });

    this.room.onMessage('round_ended', (data: any) => {
      const isWinner = data.winnerId === this.playerA.state.id;
      this.add
        .text(512, 384, `${isWinner ? 'VICTORY' : 'DEFEAT'}\n(${data.reason})`, {
          fontSize: '48px',
          fontStyle: 'bold',
          color: isWinner ? '#22c55e' : '#ef4444',
          align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(20000);
    });
  }

  private renderMap() {
    const bg = this.add.graphics();

    // Arena Floor
    bg.fillStyle(0x090d16, 1);
    bg.fillRect(0, 0, this.mapWidth, this.mapHeight);

    // Tactical Grid pattern (64x64)
    bg.lineStyle(1, 0x1e293b, 0.45);
    for (let x = 0; x <= this.mapWidth; x += 64) {
      bg.lineBetween(x, 0, x, this.mapHeight);
    }
    for (let y = 0; y <= this.mapHeight; y += 64) {
      bg.lineBetween(0, y, this.mapWidth, y);
    }

    // Lane indicators for M1 (North, Center, South lanes)
    bg.lineStyle(2, 0x0284c7, 0.25);
    bg.strokeCircle(this.mapWidth / 2, this.mapHeight / 2, 220);
    bg.strokeCircle(this.mapWidth / 2, this.mapHeight / 2, 80);

    // Outer Boundary Wall
    bg.lineStyle(8, 0x334155, 1);
    bg.strokeRect(4, 4, this.mapWidth - 8, this.mapHeight - 8);

    // Obstacles with 3/4 depth layers (Drop shadow + base wall + roof rim)
    for (const obs of this.mapData.obstacles) {
      // 1. Drop Shadow
      const shadow = this.add.rectangle(
        obs.x + obs.width / 2 + 6,
        obs.y + obs.height / 2 + 10,
        obs.width,
        obs.height,
        0x000000,
        0.55
      );
      shadow.setDepth(1);

      // 2. Base Pillar (Colliding body)
      const wall = this.add.rectangle(
        obs.x + obs.width / 2,
        obs.y + obs.height / 2,
        obs.width,
        obs.height,
        0x1e293b,
        1
      );
      wall.setStrokeStyle(2, 0x64748b, 1);
      wall.setDepth(obs.y + obs.height);

      // 3. Top Roof / Rim for 3/4 perspective elevation
      const roof = this.add.rectangle(
        obs.x + obs.width / 2,
        obs.y + obs.height / 2 - 8,
        obs.width - 6,
        obs.height - 16,
        0x334155,
        1
      );
      roof.setDepth(obs.y + obs.height + 1);

      // Obstacle Label
      this.add
        .text(
          obs.x + obs.width / 2,
          obs.y + obs.height / 2 - 8,
          obs.id.replace('obs_', '').toUpperCase(),
          {
            fontSize: '11px',
            color: '#94a3b8'
          }
        )
        .setOrigin(0.5)
        .setDepth(obs.y + obs.height + 2);
    }
  }

  private createActor(id: string, fighter: 'fighter_a' | 'fighter_b', x: number, y: number): VisualActor {
    const container = this.add.container(x, y);

    // Foot shadow
    const shadow = this.add.ellipse(0, 4, PLAYER_RADIUS * 2, 14, 0x000000, 0.45);

    // 8-direction Animated Sprite
    const sprite = this.add.sprite(0, -18, `${fighter}_atlas`, `${fighter}_idle_E_0`);
    sprite.setOrigin(0.5, 0.65);

    // Aim/Facing Arrow
    const facingArrow = this.add.line(0, -10, 0, 0, 26, 0, 0xfacc15, 0.85);
    facingArrow.setLineWidth(2);

    // Guard shield ring
    const shieldGraphic = this.add.arc(0, -10, PLAYER_RADIUS + 8, 0, 360, false, 0x38bdf8, 0.3);
    shieldGraphic.setStrokeStyle(2, 0x38bdf8, 0.9);
    shieldGraphic.setVisible(false);

    container.add([shadow, sprite, facingArrow, shieldGraphic]);

    const state: PlayerSimulationState = {
      id,
      sessionId: id,
      fighter,
      x,
      y,
      vx: 0,
      vy: 0,
      facing: id === 'player_a' ? 'E' : 'W',
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

    return {
      state,
      container,
      sprite,
      facingArrow,
      shadow,
      shieldGraphic
    };
  }

  override update(time: number, delta: number) {
    this.accumulator += delta / 1000;

    while (this.accumulator >= this.fixedStep) {
      this.simulationStep(this.fixedStep);
      this.accumulator -= this.fixedStep;
      this.currentTick++;
    }

    this.renderUpdate(time, delta);
  }

  private simulationStep(dt: number) {
    const inputA = this.inputManager.getInput(this.currentTick, this.playerA.state.x, this.playerA.state.y);

    if (this.mode === 'online' && this.room) {
      this.room.send('input', inputA);
      this.pendingInputs.push(inputA);
      stepMovement(this.playerA.state, inputA, dt, this.mapWidth, this.mapHeight, this.mapData.obstacles);
    } else {
      // Offline mode
      // Guard / Parry
      if ((inputA.buttons & BUTTON_GUARD) !== 0) {
        if (!this.playerA.state.isGuarding) {
          this.playerA.state.action = 'parry';
          this.playerA.state.isParrying = true;
          this.playerA.state.isGuarding = true;
          this.playerA.state.actionTicksRemaining = 4; // 4-tick parry window
          this.audioManager.playSound('guard_block');
        } else if (this.playerA.state.actionTicksRemaining > 0) {
          this.playerA.state.actionTicksRemaining--;
          if (this.playerA.state.actionTicksRemaining <= 0) {
            this.playerA.state.action = 'guard';
            this.playerA.state.isParrying = false;
          }
        }
      } else {
        if (this.playerA.state.isGuarding) {
          this.playerA.state.action = 'idle';
          this.playerA.state.isGuarding = false;
          this.playerA.state.isParrying = false;
        }
      }

      // Dodge
      if (this.inputManager.isJustPressed('Space') && this.playerA.state.action !== 'dodge') {
        this.playerA.state.action = 'dodge';
        this.playerA.state.actionTicksRemaining = 10;
        this.audioManager.playSound('dodge');
      }
      if (this.playerA.state.action === 'dodge') {
        this.playerA.state.actionTicksRemaining--;
        if (this.playerA.state.actionTicksRemaining <= 0) {
          this.playerA.state.action = 'idle';
        }
      }

      // Attack
      if (this.inputManager.isJustPressed('J') && this.playerA.state.action !== 'guard') {
        this.playerA.state.action = 'active';
        this.playerA.state.actionTicksRemaining = 8;
        this.spawnProjectile(this.playerA.state, 'light');
        this.audioManager.playSound('light_hit');
      }

      // Skill 1 (K)
      if (this.inputManager.isJustPressed('K') && this.playerA.state.skill1CooldownTicks <= 0) {
        this.playerA.state.skill1CooldownTicks = 90; // 3 sec CD
        this.playerA.state.chakra = Math.max(0, this.playerA.state.chakra - 30);
        if (this.playerA.state.fighter === 'fighter_a') {
          // Clone Feint
          this.vfxManager.spawnCloneSmoke(this.playerA.state.x, this.playerA.state.y);
          this.audioManager.playSound('wind_shuriken');
        } else {
          // Fireball
          this.spawnProjectile(this.playerA.state, 'skill1');
          this.audioManager.playSound('fireball_blast');
        }
      }

      // Skill 2 (L)
      if (this.inputManager.isJustPressed('L') && this.playerA.state.skill2CooldownTicks <= 0) {
        this.playerA.state.skill2CooldownTicks = 150; // 5 sec CD
        this.playerA.state.chakra = Math.max(0, this.playerA.state.chakra - 45);
        if (this.playerA.state.fighter === 'fighter_a') {
          // Wind Shuriken
          this.spawnProjectile(this.playerA.state, 'skill2');
          this.audioManager.playSound('wind_shuriken');
        } else {
          // Lightning Counter Stance
          this.vfxManager.spawnLightningStrike(this.playerA.state.x, this.playerA.state.y);
          this.audioManager.playSound('lightning_counter');
        }
      }

      // Tick cooldowns
      if (this.playerA.state.skill1CooldownTicks > 0) this.playerA.state.skill1CooldownTicks--;
      if (this.playerA.state.skill2CooldownTicks > 0) this.playerA.state.skill2CooldownTicks--;

      // Step movement
      stepMovement(this.playerA.state, inputA, dt, this.mapWidth, this.mapHeight, this.mapData.obstacles);

      // AI for Player B
      this.stepPlayerBAI(dt);

      // Step Projectiles
      this.stepProjectiles(dt);
    }
  }

  private stepPlayerBAI(dt: number) {
    const pA = this.playerA.state;
    const pB = this.playerB.state;

    const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
    let dx = 0;
    let dy = 0;

    if (dist > 350) {
      dx = Math.sign(pA.x - pB.x);
      dy = Math.sign(pA.y - pB.y);
    } else if (dist < 180) {
      dx = -Math.sign(pA.x - pB.x);
      dy = -Math.sign(pA.y - pB.y);
    } else {
      dx = -Math.sign(pA.y - pB.y);
      dy = Math.sign(pA.x - pB.x);
    }

    const inputB = {
      tick: this.currentTick,
      dx,
      dy,
      aimAngle: Math.atan2(pA.y - pB.y, pA.x - pB.x),
      aimDirection: pB.facing,
      buttons: 0
    };

    if (this.currentTick % 90 === 0 && dist < 450) {
      const hasLOS = hasLineOfSight(pB.x, pB.y, pA.x, pA.y, this.mapData.obstacles);
      if (hasLOS) {
        this.spawnProjectile(pB, 'light');
        this.audioManager.playSound('light_hit');
      }
    }

    stepMovement(pB, inputB, dt, this.mapWidth, this.mapHeight, this.mapData.obstacles);
  }

  private spawnProjectile(shooter: PlayerSimulationState, type: 'light' | 'skill1' | 'skill2') {
    const vec = directionToVector(shooter.facing);
    const speed = type === 'light' ? 450 : type === 'skill1' ? 400 : 500;
    const radius = type === 'light' ? 6 : type === 'skill1' ? 14 : 16;
    const color = shooter.fighter === 'fighter_a' ? 0x38bdf8 : 0xf97316;

    const graphic = this.add.arc(shooter.x, shooter.y - 12, radius, 0, 360, false, color, 0.95);
    graphic.setStrokeStyle(2, 0xffffff, 0.9);

    this.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      ownerId: shooter.id,
      x: shooter.x + vec.x * (PLAYER_RADIUS + 4),
      y: shooter.y - 12 + vec.y * (PLAYER_RADIUS + 4),
      vx: vec.x * speed,
      vy: vec.y * speed,
      radius,
      damage: type === 'light' ? 40 : type === 'skill1' ? 95 : 120,
      type,
      graphic,
      lifetime: 90
    });
  }

  private stepProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime--;

      p.graphic.setPosition(p.x, p.y);
      p.graphic.setDepth(p.y + 10);

      // Bounds check
      if (p.x < 0 || p.x > this.mapWidth || p.y < 0 || p.y > this.mapHeight || p.lifetime <= 0) {
        p.graphic.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Obstacle collision
      let hitWall = false;
      for (const obs of this.mapData.obstacles) {
        if (obs.blocks_projectile && p.x >= obs.x && p.x <= obs.x + obs.width && p.y >= obs.y && p.y <= obs.y + obs.height) {
          hitWall = true;
          this.vfxManager.spawnWindImpact(p.x, p.y);
          this.audioManager.playSound('guard_block');
          break;
        }
      }
      if (hitWall) {
        p.graphic.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Target collision
      const target = p.ownerId === 'player_a' ? this.playerB : this.playerA;
      const dist = Math.hypot(p.x - target.state.x, p.y - (target.state.y - 10));

      if (dist < p.radius + PLAYER_RADIUS) {
        if (target.state.isParrying) {
          // Parry!
          this.vfxManager.spawnParryFlash(p.x, p.y);
          this.audioManager.playSound('parry');
        } else if (target.state.isGuarding) {
          // Guard block
          target.state.hp = Math.max(0, target.state.hp - p.damage * 0.25);
          target.state.stamina = Math.max(0, target.state.stamina - 18);
          this.vfxManager.spawnGuardBlock(p.x, p.y);
          this.audioManager.playSound('guard_block');
        } else {
          // Clean Hit
          target.state.hp = Math.max(0, target.state.hp - p.damage);
          if (p.type === 'skill1') {
            this.vfxManager.spawnFireballExplosion(p.x, p.y);
            this.audioManager.playSound('fireball_blast');
          } else {
            this.vfxManager.spawnWindImpact(p.x, p.y);
            this.audioManager.playSound('heavy_hit');
          }
        }

        p.graphic.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private renderUpdate(time: number, delta: number) {
    // Interpolate remote player
    if (this.mode === 'online' && this.remoteSnapshots.length > 0) {
      const renderTime = Date.now() - REMOTE_INTERPOLATION_MS;
      const interp = interpolateRemotePosition(this.remoteSnapshots, renderTime);
      if (interp) {
        this.playerB.state.x = interp.x;
        this.playerB.state.y = interp.y;
        this.playerB.state.facing = interp.facing;
        this.playerB.state.action = interp.action;
        this.playerB.state.hp = interp.hp;
      }
    }

    this.updateActorVisual(this.playerA);
    this.updateActorVisual(this.playerB);

    // Update HUD
    this.hud.updateState(
      this.playerA.state,
      this.playerB.state,
      this.roundTimeRemaining,
      this.mapData.obstacles,
      this.mapWidth,
      this.mapHeight
    );

    // Update Profiler
    this.profiler.update(
      time,
      delta,
      this.currentTick - this.serverTick,
      this.projectiles.length,
      this.vfxManager.getQuality()
    );
  }

  private updateActorVisual(actor: VisualActor) {
    const { state, container, sprite, facingArrow, shieldGraphic } = actor;

    container.setPosition(state.x, state.y);

    // Foot-depth sorting: entities lower on screen render over higher ones
    container.setDepth(state.y);

    // Facing arrow direction
    const vec = directionToVector(state.facing);
    facingArrow.setTo(0, 0, vec.x * 24, vec.y * 24);

    // Shield graphic
    shieldGraphic.setVisible(state.isGuarding);

    // Play 8-direction sprite animation clip
    AnimationLoader.play(sprite, state.fighter, state.action, state.facing);
  }
}
