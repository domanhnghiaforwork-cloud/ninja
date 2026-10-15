import Phaser from 'phaser';

export type QualityPreset = 'low' | 'high';

export interface VFXOptions {
  x: number;
  y: number;
  preset?: QualityPreset;
  color?: number;
}

export class VFXManager {
  private scene: Phaser.Scene;
  private processedEventIds: Set<string> = new Set();
  private qualityPreset: QualityPreset = 'high';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setQuality(preset: QualityPreset): void {
    this.qualityPreset = preset;
  }

  public getQuality(): QualityPreset {
    return this.qualityPreset;
  }

  public hasHandledEvent(eventId: string): boolean {
    if (this.processedEventIds.has(eventId)) {
      return true;
    }
    this.processedEventIds.add(eventId);
    if (this.processedEventIds.size > 200) {
      // Keep set bounded
      const it = this.processedEventIds.values();
      for (let i = 0; i < 50; i++) {
        this.processedEventIds.delete(it.next().value!);
      }
    }
    return false;
  }

  // 1. Clone Feint Smoke Poof
  public spawnCloneSmoke(x: number, y: number): void {
    const particleCount = this.qualityPreset === 'high' ? 8 : 4;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const dist = 12 + Math.random() * 8;
      const puff = this.scene.add.arc(
        x + Math.cos(angle) * dist,
        y - 12 + Math.sin(angle) * dist,
        14 + Math.random() * 6,
        0,
        360,
        false,
        0xf1f5f9,
        0.85
      );
      puff.setDepth(y + 20);

      this.scene.tweens.add({
        targets: puff,
        alpha: 0,
        scale: 1.8,
        y: puff.y - 10,
        duration: 350 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy()
      });
    }
  }

  // 2. Wind Shuriken Projectile Trail & Impact
  public spawnWindImpact(x: number, y: number): void {
    const ring = this.scene.add.arc(x, y, 22, 0, 360, false, 0x38bdf8, 0.4);
    ring.setStrokeStyle(3, 0x06b6d4, 0.9);
    ring.setDepth(y + 20);

    this.scene.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    if (this.qualityPreset === 'high') {
      for (let i = 0; i < 4; i++) {
        const blade = this.scene.add.rectangle(x, y, 16, 2, 0xbae6fd, 0.9);
        blade.setRotation((Math.PI / 2) * i + Math.random() * 0.4);
        blade.setDepth(y + 21);

        this.scene.tweens.add({
          targets: blade,
          scaleX: 2.5,
          alpha: 0,
          duration: 200,
          onComplete: () => blade.destroy()
        });
      }
    }
  }

  // 3. Fireball Flight & 80px AoE Blazing Blast
  public spawnFireballExplosion(x: number, y: number, radius = 80): void {
    // 80px AoE Flame Blast wave
    const blast = this.scene.add.arc(x, y, radius, 0, 360, false, 0xf97316, 0.5);
    blast.setStrokeStyle(4, 0xef4444, 1);
    blast.setDepth(y + 25);

    this.scene.tweens.add({
      targets: blast,
      scale: 1.3,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => blast.destroy()
    });

    // Core Fire Flash
    const core = this.scene.add.arc(x, y, radius * 0.4, 0, 360, false, 0xfef08a, 0.9);
    core.setDepth(y + 26);

    this.scene.tweens.add({
      targets: core,
      scale: 1.8,
      alpha: 0,
      duration: 220,
      onComplete: () => core.destroy()
    });

    if (this.qualityPreset === 'high') {
      // Flying embers
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 40;
        const ember = this.scene.add.arc(x, y, 3, 0, 360, false, 0xfacc15, 1);
        ember.setDepth(y + 27);

        this.scene.tweens.add({
          targets: ember,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          alpha: 0,
          duration: 400,
          onComplete: () => ember.destroy()
        });
      }
    }
  }

  // 4. Lightning Counter Stance & Counter Shockwave
  public spawnLightningStrike(x: number, y: number): void {
    const flash = this.scene.add.arc(x, y, 50, 0, 360, false, 0xa855f7, 0.6);
    flash.setStrokeStyle(3, 0xfacc15, 1);
    flash.setDepth(y + 30);

    this.scene.tweens.add({
      targets: flash,
      scale: 1.6,
      alpha: 0,
      duration: 200,
      ease: 'Expo.easeOut',
      onComplete: () => flash.destroy()
    });

    // Lightning bolt zigzag
    const bolt = this.scene.add.graphics();
    bolt.lineStyle(3, 0xfef08a, 1);
    bolt.beginPath();
    bolt.moveTo(x - 20, y - 60);
    bolt.lineTo(x - 5, y - 30);
    bolt.lineTo(x + 10, y - 15);
    bolt.lineTo(x, y);
    bolt.strokePath();
    bolt.setDepth(y + 31);

    this.scene.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 180,
      onComplete: () => bolt.destroy()
    });
  }

  // 5. Parry Flash & Guard Barrier
  public spawnParryFlash(x: number, y: number): void {
    const star = this.scene.add.star(x, y, 5, 8, 24, 0xfacc15, 0.95);
    star.setStrokeStyle(2, 0xffffff, 1);
    star.setDepth(y + 35);

    this.scene.tweens.add({
      targets: star,
      rotation: Math.PI / 2,
      scale: 1.8,
      alpha: 0,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => star.destroy()
    });
  }

  public spawnGuardBlock(x: number, y: number): void {
    const shield = this.scene.add.arc(x, y, 28, -Math.PI / 2, Math.PI / 2, false, 0x38bdf8, 0.4);
    shield.setStrokeStyle(3, 0x0284c7, 1);
    shield.setDepth(y + 20);

    this.scene.tweens.add({
      targets: shield,
      scale: 1.3,
      alpha: 0,
      duration: 180,
      onComplete: () => shield.destroy()
    });
  }
}
