import Phaser from 'phaser';
import {
  InputFrame,
  Direction8,
  quantizeAimTo8,
  BUTTON_LIGHT,
  BUTTON_SKILL1,
  BUTTON_SKILL2,
  BUTTON_DODGE,
  BUTTON_GUARD
} from '@ninja/shared';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyJ: Phaser.Input.Keyboard.Key;
  private keyK: Phaser.Input.Keyboard.Key;
  private keyL: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private keyShift: Phaser.Input.Keyboard.Key;
  private keyTab: Phaser.Input.Keyboard.Key;

  private isBlurred = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard not available');
    }

    this.cursors = keyboard.createCursorKeys();
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyJ = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyL = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyTab = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    // Prevent tab from losing browser focus
    keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.TAB, Phaser.Input.Keyboard.KeyCodes.SPACE]);

    window.addEventListener('blur', () => {
      this.isBlurred = true;
    });

    window.addEventListener('focus', () => {
      this.isBlurred = false;
    });
  }

  public getInput(tick: number, playerWorldX: number, playerWorldY: number): InputFrame {
    if (this.isBlurred) {
      return {
        tick,
        dx: 0,
        dy: 0,
        aimAngle: 0,
        aimDirection: 'E',
        buttons: 0
      };
    }

    let dx = 0;
    let dy = 0;

    if (this.keyA.isDown || this.cursors.left.isDown) dx -= 1;
    if (this.keyD.isDown || this.cursors.right.isDown) dx += 1;
    if (this.keyW.isDown || this.cursors.up.isDown) dy -= 1;
    if (this.keyS.isDown || this.cursors.down.isDown) dy += 1;

    // Mouse aim in world coordinates
    const pointer = this.scene.input.activePointer;
    const worldMouseX = pointer.worldX;
    const worldMouseY = pointer.worldY;

    const rawAimAngle = Math.atan2(worldMouseY - playerWorldY, worldMouseX - playerWorldX);
    const aimDirection: Direction8 = quantizeAimTo8(rawAimAngle);

    let buttons = 0;
    if (this.keyJ.isDown || pointer.leftButtonDown()) buttons |= BUTTON_LIGHT;
    if (this.keyK.isDown) buttons |= BUTTON_SKILL1;
    if (this.keyL.isDown || pointer.rightButtonDown()) buttons |= BUTTON_SKILL2;
    if (this.keySpace.isDown) buttons |= BUTTON_DODGE;
    if (this.keyShift.isDown) buttons |= BUTTON_GUARD;

    return {
      tick,
      dx,
      dy,
      aimAngle: rawAimAngle,
      aimDirection,
      buttons
    };
  }

  public isJustPressed(keyName: 'J' | 'K' | 'L' | 'Space' | 'Shift' | 'Tab'): boolean {
    switch (keyName) {
      case 'J': return Phaser.Input.Keyboard.JustDown(this.keyJ);
      case 'K': return Phaser.Input.Keyboard.JustDown(this.keyK);
      case 'L': return Phaser.Input.Keyboard.JustDown(this.keyL);
      case 'Space': return Phaser.Input.Keyboard.JustDown(this.keySpace);
      case 'Shift': return Phaser.Input.Keyboard.JustDown(this.keyShift);
      case 'Tab': return Phaser.Input.Keyboard.JustDown(this.keyTab);
    }
  }
}
