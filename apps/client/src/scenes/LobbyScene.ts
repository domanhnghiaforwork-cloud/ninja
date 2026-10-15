import Phaser from 'phaser';
import { NetworkClient } from '../network/NetworkClient';

export class LobbyScene extends Phaser.Scene {
  private network = NetworkClient.getInstance();
  private statusText!: Phaser.GameObjects.Text;
  private roomInfoContainer!: Phaser.GameObjects.Container;
  private codeText!: Phaser.GameObjects.Text;
  private playersText!: Phaser.GameObjects.Text;
  private readyButton!: Phaser.GameObjects.Text;
  private isReady = false;

  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background Gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x020617, 0x020617, 1);
    bg.fillRect(0, 0, width, height);

    // Title & Branding
    this.add.text(width / 2, 100, 'NINJA ARENA', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#0369a1',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(width / 2, 150, '1v1 TACTICAL RANGED & COUNTERPLAY', {
      fontSize: '15px',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Mode Buttons
    this.createButton(width / 2, 250, 'PLAY OFFLINE VS AI BOT', 0x10b981, () => {
      this.scene.start('BattleScene', { mode: 'offline' });
    });

    this.createButton(width / 2, 330, 'CREATE PRIVATE ROOM', 0x3b82f6, async () => {
      await this.handleCreateRoom();
    });

    this.createButton(width / 2, 410, 'JOIN ROOM WITH CODE', 0x8b5cf6, () => {
      this.handleJoinPrompt();
    });

    // Status / Message Display
    this.statusText = this.add.text(width / 2, 480, '', {
      fontSize: '14px',
      color: '#facc15'
    }).setOrigin(0.5);

    // In-Room Display (initially hidden)
    this.roomInfoContainer = this.add.container(width / 2, 570);
    this.roomInfoContainer.setVisible(false);

    const roomBox = this.add.rectangle(0, 0, 480, 160, 0x1e293b, 0.95);
    roomBox.setStrokeStyle(2, 0x38bdf8);

    this.codeText = this.add.text(0, -50, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.playersText = this.add.text(0, -10, 'Waiting for opponent to connect...', {
      fontSize: '14px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    this.readyButton = this.add.text(0, 40, '[ READY TO FIGHT ]', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#22c55e',
      backgroundColor: '#14532d',
      padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.readyButton.on('pointerdown', () => {
      if (this.network.room) {
        this.isReady = !this.isReady;
        this.network.room.send('ready', {});
        this.readyButton.setText(this.isReady ? '[ CANCEL READY ]' : '[ READY TO FIGHT ]');
        this.readyButton.setBackgroundColor(this.isReady ? '#7f1d1d' : '#14532d');
        this.readyButton.setColor(this.isReady ? '#ef4444' : '#22c55e');
      }
    });

    this.roomInfoContainer.add([roomBox, this.codeText, this.playersText, this.readyButton]);
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void) {
    const btn = this.add.rectangle(x, y, 340, 54, 0x1e293b, 0.9);
    btn.setStrokeStyle(2, color);
    btn.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(x, y, text, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f8fafc'
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(color, 0.3);
      btnText.setColor('#38bdf8');
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(0x1e293b, 0.9);
      btnText.setColor('#f8fafc');
    });

    btn.on('pointerdown', onClick);
  }

  private async handleCreateRoom() {
    this.statusText.setText('Creating private room on server...');
    try {
      const data = await this.network.createRoom();
      this.statusText.setText('Connecting to room...');
      const room = await this.network.joinRoom(data.roomId, data.ticket, data.guestId);
      this.setupRoomListeners(room, data.inviteCode);
    } catch (err: any) {
      this.statusText.setText(`Error: ${err.message}`);
    }
  }

  private handleJoinPrompt() {
    const code = window.prompt('Enter 8-character invite code (e.g. ABCDEFGH):');
    if (!code) return;

    this.statusText.setText('Resolving invite code...');
    this.network.resolveCode(code)
      .then(async (data) => {
        this.statusText.setText('Joining private room...');
        const room = await this.network.joinRoom(data.roomId, data.ticket, data.guestId);
        this.setupRoomListeners(room, code.trim().toUpperCase());
      })
      .catch((err) => {
        this.statusText.setText(`Failed to join: ${err.message}`);
      });
  }

  private setupRoomListeners(room: any, inviteCode: string) {
    this.statusText.setText('Connected to room!');
    this.roomInfoContainer.setVisible(true);
    this.codeText.setText(`INVITE CODE: ${inviteCode}`);

    room.onStateChange((state: any) => {
      const count = Object.keys(state.players || {}).length;
      this.playersText.setText(count === 2 ? 'Both fighters connected! Click READY to begin countdown.' : 'Waiting for Player 2 to join with code...');

      if (state.phase === 'countdown') {
        this.statusText.setText(`ROUND STARTING IN ${state.countdownSeconds}...`);
      }

      if (state.phase === 'playing') {
        this.scene.start('BattleScene', { mode: 'online', room });
      }
    });

    room.onMessage('countdown_cancelled', (msg: any) => {
      this.statusText.setText(msg.reason || 'Countdown cancelled');
    });
  }
}
