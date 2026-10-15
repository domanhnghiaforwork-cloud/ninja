import Phaser from 'phaser';
import { PlayerSimulationState, MAP_VERTICAL_SLICE_WIDTH, MAP_VERTICAL_SLICE_HEIGHT, MapObstacle, hasLineOfSight } from '@ninja/shared';
import { AudioManager } from '../audio/AudioManager';

export class BattleHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private audioManager = AudioManager.getInstance();

  // Top header text
  private timerText!: Phaser.GameObjects.Text;
  private roundTime = 180;

  // Player A bars
  private p1HpBar!: Phaser.GameObjects.Rectangle;
  private p1ChakraBar!: Phaser.GameObjects.Rectangle;
  private p1StaminaBar!: Phaser.GameObjects.Rectangle;
  private p1ActionText!: Phaser.GameObjects.Text;

  // Player B bars
  private p2HpBar!: Phaser.GameObjects.Rectangle;
  private p2ChakraBar!: Phaser.GameObjects.Rectangle;
  private p2StaminaBar!: Phaser.GameObjects.Rectangle;
  private p2ActionText!: Phaser.GameObjects.Text;

  // Skill Cooldowns
  private skill1CdText!: Phaser.GameObjects.Text;
  private skill2CdText!: Phaser.GameObjects.Text;

  // Minimap graphics
  private minimapGraphics!: Phaser.GameObjects.Graphics;

  // Controls guide overlay
  private controlsModal!: Phaser.GameObjects.Container;
  private isControlsVisible = false;

  // Buttons
  private muteButtonText!: Phaser.GameObjects.Text;
  private fxButtonText!: Phaser.GameObjects.Text;
  private onQualityToggle?: (preset: 'low' | 'high') => void;
  private currentQuality: 'low' | 'high' = 'high';

  constructor(scene: Phaser.Scene, onQualityToggle?: (preset: 'low' | 'high') => void) {
    this.scene = scene;
    this.onQualityToggle = onQualityToggle;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(10000);

    this.buildHUD();
    this.buildControlsModal();
  }

  private buildHUD(): void {
    // 1. Top Bar Background
    const topBar = this.scene.add.graphics();
    topBar.fillStyle(0x090d16, 0.92);
    topBar.fillRect(0, 0, 1024, 68);
    topBar.lineStyle(1, 0x1e293b, 1);
    topBar.lineBetween(0, 68, 1024, 68);
    this.container.add(topBar);

    // 2. Player 1 Status (Left)
    const p1Title = this.scene.add.text(24, 8, 'FIGHTER A (YOU)', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f97316'
    });
    this.container.add(p1Title);

    // P1 HP Bar
    const p1HpBg = this.scene.add.rectangle(24, 26, 220, 14, 0x1e293b).setOrigin(0, 0);
    this.p1HpBar = this.scene.add.rectangle(24, 26, 220, 14, 0x22c55e).setOrigin(0, 0);
    this.container.add([p1HpBg, this.p1HpBar]);

    // P1 Chakra & Stamina (stacked small bars)
    const p1ChakraBg = this.scene.add.rectangle(24, 43, 105, 6, 0x1e293b).setOrigin(0, 0);
    this.p1ChakraBar = this.scene.add.rectangle(24, 43, 105, 6, 0x38bdf8).setOrigin(0, 0);
    const p1StaminaBg = this.scene.add.rectangle(139, 43, 105, 6, 0x1e293b).setOrigin(0, 0);
    this.p1StaminaBar = this.scene.add.rectangle(139, 43, 105, 6, 0xeab308).setOrigin(0, 0);
    this.container.add([p1ChakraBg, this.p1ChakraBar, p1StaminaBg, this.p1StaminaBar]);

    this.p1ActionText = this.scene.add.text(24, 52, 'STATE: IDLE', {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'monospace'
    });
    this.container.add(this.p1ActionText);

    // 3. Player 2 Status (Right)
    const p2Title = this.scene.add.text(1000, 8, 'FIGHTER B (OPPONENT)', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#818cf8'
    }).setOrigin(1, 0);
    this.container.add(p2Title);

    // P2 HP Bar
    const p2HpBg = this.scene.add.rectangle(1000 - 220, 26, 220, 14, 0x1e293b).setOrigin(0, 0);
    this.p2HpBar = this.scene.add.rectangle(1000 - 220, 26, 220, 14, 0x22c55e).setOrigin(0, 0);
    this.container.add([p2HpBg, this.p2HpBar]);

    // P2 Chakra & Stamina
    const p2ChakraBg = this.scene.add.rectangle(1000 - 220, 43, 105, 6, 0x1e293b).setOrigin(0, 0);
    this.p2ChakraBar = this.scene.add.rectangle(1000 - 220, 43, 105, 6, 0x38bdf8).setOrigin(0, 0);
    const p2StaminaBg = this.scene.add.rectangle(1000 - 105, 43, 105, 6, 0x1e293b).setOrigin(0, 0);
    this.p2StaminaBar = this.scene.add.rectangle(1000 - 105, 43, 105, 6, 0xeab308).setOrigin(0, 0);
    this.container.add([p2ChakraBg, this.p2ChakraBar, p2StaminaBg, this.p2StaminaBar]);

    this.p2ActionText = this.scene.add.text(1000, 52, 'STATE: IDLE', {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'monospace'
    }).setOrigin(1, 0);
    this.container.add(this.p2ActionText);

    // 4. Center Round Timer
    this.timerText = this.scene.add.text(512, 34, '03:00', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#f8fafc',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.container.add(this.timerText);

    // 5. Cooldown Badges (Bottom Center)
    const cdContainer = this.scene.add.container(512, 720);
    const cdBg = this.scene.add.rectangle(0, 0, 260, 48, 0x090d16, 0.85);
    cdBg.setStrokeStyle(1, 0x334155);
    cdContainer.add(cdBg);

    // K skill
    const kBox = this.scene.add.rectangle(-60, 0, 90, 36, 0x1e293b);
    kBox.setStrokeStyle(1, 0x38bdf8);
    const kLabel = this.scene.add.text(-60, -10, '[K] SKILL 1', { fontSize: '9px', fontStyle: 'bold', color: '#38bdf8' }).setOrigin(0.5);
    this.skill1CdText = this.scene.add.text(-60, 6, 'READY', { fontSize: '11px', fontStyle: 'bold', color: '#22c55e' }).setOrigin(0.5);
    cdContainer.add([kBox, kLabel, this.skill1CdText]);

    // L skill
    const lBox = this.scene.add.rectangle(60, 0, 90, 36, 0x1e293b);
    lBox.setStrokeStyle(1, 0xf97316);
    const lLabel = this.scene.add.text(60, -10, '[L] SKILL 2', { fontSize: '9px', fontStyle: 'bold', color: '#f97316' }).setOrigin(0.5);
    this.skill2CdText = this.scene.add.text(60, 6, 'READY', { fontSize: '11px', fontStyle: 'bold', color: '#22c55e' }).setOrigin(0.5);
    cdContainer.add([lBox, lLabel, this.skill2CdText]);

    this.container.add(cdContainer);

    // 6. Header Controls & Options Buttons (Mute, FX, Help F1)
    const helpBtn = this.scene.add.text(370, 48, '[F1 GUIDE]', { fontSize: '11px', color: '#94a3b8' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleControls());
    this.container.add(helpBtn);

    this.muteButtonText = this.scene.add.text(620, 48, '[MUTE: OFF]', { fontSize: '11px', color: '#94a3b8' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleMute());
    this.container.add(this.muteButtonText);

    this.fxButtonText = this.scene.add.text(480, 52, '[FX: HIGH]', { fontSize: '10px', color: '#38bdf8' })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleQualityPreset());
    this.container.add(this.fxButtonText);

    // 7. Minimap Graphics
    this.minimapGraphics = this.scene.add.graphics();
    this.minimapGraphics.setScrollFactor(0);
    this.minimapGraphics.setDepth(10001);

    // F1 Key binding
    this.scene.input.keyboard?.on('keydown-F1', () => this.toggleControls());
  }

  private buildControlsModal(): void {
    this.controlsModal = this.scene.add.container(512, 384);
    this.controlsModal.setScrollFactor(0);
    this.controlsModal.setDepth(12000);
    this.controlsModal.setVisible(false);

    const bg = this.scene.add.rectangle(0, 0, 480, 320, 0x090d16, 0.96);
    bg.setStrokeStyle(2, 0x38bdf8, 1);
    this.controlsModal.add(bg);

    const title = this.scene.add.text(0, -130, '⛩ NINJA ARENA 2D — PC CONTROLS ⛩', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f8fafc'
    }).setOrigin(0.5);

    const body = this.scene.add.text(0, -10, [
      'WASD: Di chuyển 8 hướng (Movement)',
      'Chuột (Mouse): Ngắm hướng 8 chiều (Aim 8)',
      'J: Đòn đánh cơ bản (Light Attack) — 40 dmg',
      'K: Thuật 1 (Phân thân / Cầu lửa) — Chi phí Chakra',
      'L: Thuật 2 (Phi tiêu gió / Phản điện) — Chi phí Chakra',
      'Space: Lướt né (Dodge) — Khung bất tử 4 ticks (i-frames)',
      'Shift: Đỡ đòn & Phản đòn (Guard & Parry 4-tick window)',
      '------------------------------------------------',
      'F1: Ẩn/Hiện hướng dẫn điều khiển (Controls Guide)',
      'F2: Ẩn/Hiện bảng đo hiệu năng (Performance Profiler)',
      '------------------------------------------------',
      '* Decision D08: Radar minimap che vị trí khi bị chắn tầm nhìn'
    ].join('\n'), {
      fontSize: '11px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);

    const closeBtn = this.scene.add.text(0, 130, '[NHẤN F1 ĐỂ ĐÓNG]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.toggleControls());

    this.controlsModal.add([title, body, closeBtn]);
  }

  public toggleControls(): void {
    this.isControlsVisible = !this.isControlsVisible;
    this.controlsModal.setVisible(this.isControlsVisible);
  }

  public toggleMute(): void {
    const isMuted = this.audioManager.toggleMute();
    this.muteButtonText.setText(`[MUTE: ${isMuted ? 'ON' : 'OFF'}]`);
    this.muteButtonText.setColor(isMuted ? '#ef4444' : '#94a3b8');
  }

  public toggleQualityPreset(): void {
    this.currentQuality = this.currentQuality === 'high' ? 'low' : 'high';
    this.fxButtonText.setText(`[FX: ${this.currentQuality.toUpperCase()}]`);
    if (this.onQualityToggle) {
      this.onQualityToggle(this.currentQuality);
    }
  }

  public updateState(
    p1: PlayerSimulationState,
    p2: PlayerSimulationState,
    roundTimeSec: number,
    obstacles: MapObstacle[],
    mapWidth = 2048,
    mapHeight = 2048
  ): void {
    // 1. Update Bars
    const p1HpRatio = Math.max(0, p1.hp / p1.maxHp);
    this.p1HpBar.setScale(p1HpRatio, 1);
    this.p1HpBar.setFillStyle(p1HpRatio > 0.3 ? 0x22c55e : 0xef4444);

    const p1ChakraRatio = Math.max(0, p1.chakra / p1.maxChakra);
    this.p1ChakraBar.setScale(p1ChakraRatio, 1);

    const p1StaminaRatio = Math.max(0, p1.stamina / p1.maxStamina);
    this.p1StaminaBar.setScale(p1StaminaRatio, 1);

    this.p1ActionText.setText(`STATE: ${p1.action.toUpperCase()}${p1.isGuarding ? ' (GUARD)' : ''}`);

    // P2 Bars
    const p2HpRatio = Math.max(0, p2.hp / p2.maxHp);
    this.p2HpBar.setScale(p2HpRatio, 1);
    this.p2HpBar.setFillStyle(p2HpRatio > 0.3 ? 0x22c55e : 0xef4444);

    const p2ChakraRatio = Math.max(0, p2.chakra / p2.maxChakra);
    this.p2ChakraBar.setScale(p2ChakraRatio, 1);

    const p2StaminaRatio = Math.max(0, p2.stamina / p2.maxStamina);
    this.p2StaminaBar.setScale(p2StaminaRatio, 1);

    this.p2ActionText.setText(`STATE: ${p2.action.toUpperCase()}${p2.isGuarding ? ' (GUARD)' : ''}`);

    // 2. Cooldowns
    if (p1.skill1CooldownTicks > 0) {
      const sec = (p1.skill1CooldownTicks / 30).toFixed(1);
      this.skill1CdText.setText(`${sec}s`);
      this.skill1CdText.setColor('#ef4444');
    } else {
      this.skill1CdText.setText('READY');
      this.skill1CdText.setColor('#22c55e');
    }

    if (p1.skill2CooldownTicks > 0) {
      const sec = (p1.skill2CooldownTicks / 30).toFixed(1);
      this.skill2CdText.setText(`${sec}s`);
      this.skill2CdText.setColor('#ef4444');
    } else {
      this.skill2CdText.setText('READY');
      this.skill2CdText.setColor('#22c55e');
    }

    // 3. Round Timer
    const mins = Math.floor(roundTimeSec / 60);
    const secs = Math.floor(roundTimeSec % 60);
    this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    if (roundTimeSec <= 30) {
      this.timerText.setColor('#ef4444');
    } else {
      this.timerText.setColor('#f8fafc');
    }

    // 4. Render Minimap
    this.renderMinimap(p1, p2, obstacles, mapWidth, mapHeight);
  }

  private renderMinimap(
    p1: PlayerSimulationState,
    p2: PlayerSimulationState,
    obstacles: MapObstacle[],
    mapWidth: number,
    mapHeight: number
  ): void {
    const m = this.minimapGraphics;
    m.clear();

    const mmX = 874;
    const mmY = 80;
    const mmSize = 130;
    const scale = mmSize / mapWidth;

    // Minimap Background
    m.fillStyle(0x090d16, 0.88);
    m.fillRect(mmX, mmY, mmSize, mmSize);
    m.lineStyle(1, 0x334155, 1);
    m.strokeRect(mmX, mmY, mmSize, mmSize);

    // Obstacles
    m.fillStyle(0x334155, 0.9);
    for (const obs of obstacles) {
      m.fillRect(mmX + obs.x * scale, mmY + obs.y * scale, obs.width * scale, obs.height * scale);
    }

    // Player A (Self) - Always visible
    m.fillStyle(0xf97316, 1);
    m.fillCircle(mmX + p1.x * scale, mmY + p1.y * scale, 3.5);

    // Player B (Opponent) - Follows Decision D08:
    // UI concealment only: opponent shown on minimap only when line-of-sight exists
    const hasLOS = hasLineOfSight(p1.x, p1.y, p2.x, p2.y, obstacles);
    if (hasLOS) {
      m.fillStyle(0x818cf8, 1);
      m.fillCircle(mmX + p2.x * scale, mmY + p2.y * scale, 3.5);
    }
  }
}
