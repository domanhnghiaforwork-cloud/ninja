import Phaser from 'phaser';
import { Direction8, ActionState } from '@ninja/shared';

export const FRAME_WIDTH = 64;
export const FRAME_HEIGHT = 64;
export const FOOT_ANCHOR_X = 32;
export const FOOT_ANCHOR_Y = 58;

const DIRECTIONS: Direction8[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const ACTIONS = ['idle', 'run', 'attack', 'guard', 'parry', 'dodge', 'hitstun', 'ko'] as const;
type ActionType = typeof ACTIONS[number];

const ACTION_FALLBACKS: Record<string, ActionType> = {
  startup: 'attack',
  active: 'attack',
  recovery: 'idle',
  moving: 'run',
  guard_break: 'hitstun',
  knockdown: 'ko',
  parry: 'parry',
  guard: 'guard',
  dodge: 'dodge',
  hitstun: 'hitstun',
  ko: 'ko',
  idle: 'idle'
};

export class AnimationLoader {
  private static initialized = false;

  public static init(scene: Phaser.Scene): void {
    if (this.initialized) return;

    this.createFighterTextures(scene, 'fighter_a', 0xf97316, 0x38bdf8); // Amber/orange + cyan
    this.createFighterTextures(scene, 'fighter_b', 0x818cf8, 0xef4444); // Indigo/purple + fire red
    this.registerAnimations(scene, 'fighter_a');
    this.registerAnimations(scene, 'fighter_b');

    this.initialized = true;
  }

  private static createFighterTextures(
    scene: Phaser.Scene,
    fighter: 'fighter_a' | 'fighter_b',
    primaryColor: number,
    accentColor: number
  ): void {
    const canvasTexture = scene.textures.createCanvas(`${fighter}_atlas`, FRAME_WIDTH * 6, FRAME_HEIGHT * 8 * DIRECTIONS.length);
    if (!canvasTexture) return;

    const ctx = canvasTexture.getContext();
    const primaryHex = `#${primaryColor.toString(16).padStart(6, '0')}`;
    const accentHex = `#${accentColor.toString(16).padStart(6, '0')}`;

    let row = 0;
    for (const dir of DIRECTIONS) {
      for (const action of ACTIONS) {
        const frameCount = action === 'run' ? 6 : action === 'attack' || action === 'dodge' || action === 'idle' || action === 'ko' ? 4 : action === 'parry' ? 3 : 2;

        for (let frame = 0; frame < frameCount; frame++) {
          const x = frame * FRAME_WIDTH;
          const y = row * FRAME_HEIGHT;

          ctx.clearRect(x, y, FRAME_WIDTH, FRAME_HEIGHT);
          this.drawFighterFrame(ctx, x, y, action, dir, frame, primaryHex, accentHex);

          // Add frame to texture
          canvasTexture.add(
            `${fighter}_${action}_${dir}_${frame}`,
            0,
            x,
            y,
            FRAME_WIDTH,
            FRAME_HEIGHT
          );
        }
        row++;
      }
    }

    canvasTexture.refresh();
  }

  private static drawFighterFrame(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    action: ActionType,
    dir: Direction8,
    frame: number,
    primaryColor: string,
    accentColor: string
  ): void {
    ctx.save();
    ctx.translate(bx, by);

    const cx = 32;
    const cy = 40;

    // Bobbing effect for idle and run
    let bobY = 0;
    if (action === 'run') {
      bobY = Math.sin(frame * Math.PI) * 3;
    } else if (action === 'idle') {
      bobY = Math.sin(frame * (Math.PI / 2)) * 1.5;
    } else if (action === 'ko') {
      bobY = 12; // Collapsed
    }

    // 1. Foot Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, FOOT_ANCHOR_Y, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Legs / Stride
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    if (action === 'run') {
      const legStride = Math.sin(frame * Math.PI) * 8;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 8);
      ctx.lineTo(cx - 5 - legStride, FOOT_ANCHOR_Y);
      ctx.moveTo(cx + 5, cy + 8);
      ctx.lineTo(cx + 5 + legStride, FOOT_ANCHOR_Y);
      ctx.stroke();
    } else if (action === 'ko') {
      // Fallen legs
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + bobY + 4);
      ctx.lineTo(cx - 18, FOOT_ANCHOR_Y);
      ctx.moveTo(cx - 2, cy + bobY + 4);
      ctx.lineTo(cx + 10, FOOT_ANCHOR_Y);
      ctx.stroke();
    } else {
      // Idle / Guard / Attack stance legs
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 8);
      ctx.lineTo(cx - 8, FOOT_ANCHOR_Y);
      ctx.moveTo(cx + 6, cy + 8);
      ctx.lineTo(cx + 8, FOOT_ANCHOR_Y);
      ctx.stroke();
    }

    // 3. Body Torso (Ninja Vest / Kimono)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(cx - 10, cy - 10 + bobY, 20, 20, [4]);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shinobi Belt / Sash
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 10, cy + 3 + bobY, 20, 4);

    // 4. Head and Ninja Mask
    ctx.fillStyle = '#f8fafc'; // Skin
    ctx.beginPath();
    ctx.arc(cx, cy - 18 + bobY, 9, 0, Math.PI * 2);
    ctx.fill();

    // Dark Ninja Mask
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy - 16 + bobY, 9, 0, Math.PI);
    ctx.fill();

    // Metal Headband Plate
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 8, cy - 24 + bobY, 16, 4);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 8, cy - 24 + bobY, 16, 4);

    // Headband Tails fluttering behind
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 22 + bobY);
    ctx.lineTo(cx - 16, cy - 20 + bobY + (frame % 2) * 2);
    ctx.stroke();

    // 5. Action Overlays: Weapons / Guards / Effects
    if (action === 'attack') {
      // Slash thrust
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      const reach = 14 + frame * 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy + bobY);
      ctx.lineTo(cx + reach, cy - 2 + bobY);
      ctx.stroke();

      // Blade sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + reach + 2, cy - 2 + bobY, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (action === 'guard') {
      // Guard crossed arm pose
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + bobY, 14, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (action === 'parry') {
      // Parry flash burst
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + 10, cy + bobY, 12 + frame * 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (action === 'dodge') {
      // Afterimage shadow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(cx - 8, cy + bobY, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (action === 'hitstun') {
      // Red hit flash
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy + bobY, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private static registerAnimations(scene: Phaser.Scene, fighter: 'fighter_a' | 'fighter_b'): void {
    for (const dir of DIRECTIONS) {
      for (const action of ACTIONS) {
        const frameCount = action === 'run' ? 6 : action === 'attack' || action === 'dodge' || action === 'idle' || action === 'ko' ? 4 : action === 'parry' ? 3 : 2;
        const frameRate = action === 'run' ? 12 : action === 'attack' || action === 'dodge' ? 16 : action === 'idle' ? 8 : 10;
        const repeat = action === 'idle' || action === 'run' || action === 'guard' ? -1 : 0;

        const frames: Phaser.Types.Animations.AnimationFrame[] = [];
        for (let f = 0; f < frameCount; f++) {
          frames.push({
            key: `${fighter}_atlas`,
            frame: `${fighter}_${action}_${dir}_${f}`
          });
        }

        const animKey = `${fighter}_${action}_${dir}`;
        if (!scene.anims.exists(animKey)) {
          scene.anims.create({
            key: animKey,
            frames,
            frameRate,
            repeat
          });
        }
      }
    }
  }

  public static getResolvedAction(action: ActionState | string): ActionType {
    return ACTION_FALLBACKS[action] || 'idle';
  }

  public static play(
    sprite: Phaser.GameObjects.Sprite,
    fighter: 'fighter_a' | 'fighter_b',
    action: ActionState | string,
    facing: Direction8
  ): void {
    const resolvedAction = this.getResolvedAction(action);
    const animKey = `${fighter}_${resolvedAction}_${facing}`;

    if (sprite.anims.currentAnim?.key !== animKey) {
      if (sprite.scene.anims.exists(animKey)) {
        sprite.play(animKey);
      } else {
        // Fallback to idle in that direction
        const fallbackKey = `${fighter}_idle_${facing}`;
        if (sprite.scene.anims.exists(fallbackKey)) {
          sprite.play(fallbackKey);
        }
      }
    }
  }
}
