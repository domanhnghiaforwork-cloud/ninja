import Phaser from 'phaser';

export class ProfilerOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private text: Phaser.GameObjects.Text;
  private isVisible = false;

  private frameTimes: number[] = [];
  private lastTime = 0;
  private p95FrameTime = 16.6;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(12, 80);
    this.container.setScrollFactor(0);
    this.container.setDepth(11000);
    this.container.setVisible(false);

    const bg = scene.add.rectangle(0, 0, 220, 140, 0x090d16, 0.88);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, 0x0284c7, 0.8);
    this.container.add(bg);

    const title = scene.add.text(10, 8, '⚡ PC PROFILER [F2]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'monospace'
    });
    this.container.add(title);

    this.text = scene.add.text(10, 28, '', {
      fontSize: '10px',
      color: '#cbd5e1',
      fontFamily: 'monospace',
      lineSpacing: 3
    });
    this.container.add(this.text);

    // Setup F2 toggle key
    scene.input.keyboard?.on('keydown-F2', () => {
      this.toggleVisibility();
    });
  }

  public toggleVisibility(): boolean {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
    return this.isVisible;
  }

  public update(time: number, delta: number, serverTickDrift = 0, projectileCount = 0, quality = 'high'): void {
    if (!this.isVisible) return;

    // Track frame times over sliding window of 60 samples
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    // Compute P95 frame time
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const p95Idx = Math.floor(sorted.length * 0.95);
    this.p95FrameTime = sorted[p95Idx] || 16.6;

    const fps = Math.round(this.scene.game.loop.actualFps);
    const targetStatus = fps >= 55 ? 'PASS (60FPS)' : 'DEGRADED';

    let memStr = 'N/A';
    if ((performance as any).memory) {
      const mb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
      memStr = `${mb} MB`;
    }

    this.text.setText([
      `FPS: ${fps} [${targetStatus}]`,
      `Frame Time: ${delta.toFixed(1)} ms`,
      `P95 Frame:  ${this.p95FrameTime.toFixed(1)} ms (<=20ms)`,
      `Svr Drift:  ${serverTickDrift} ticks`,
      `Entities:   ${projectileCount + 2}`,
      `VFX Preset: ${quality.toUpperCase()}`,
      `Heap Used:  ${memStr}`
    ]);
  }

  public getP95(): number {
    return this.p95FrameTime;
  }
}
