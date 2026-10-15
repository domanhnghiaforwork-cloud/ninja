export type AudioBus = 'master' | 'sfx' | 'ui';

export class AudioManager {
  private static instance: AudioManager | null = null;

  private audioCtx: AudioContext | null = null;
  private isUnlocked = false;
  private isMuted = false;
  private masterVolume = 0.8;
  private sfxVolume = 0.8;
  private uiVolume = 0.7;

  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private uiGain: GainNode | null = null;

  private playedEvents: Set<string> = new Set();

  private constructor() {
    this.loadSavedSettings();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadSavedSettings(): void {
    try {
      const savedMute = localStorage.getItem('ninja_audio_mute');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('ninja_audio_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.masterVolume = v;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('ninja_audio_mute', String(this.isMuted));
      localStorage.setItem('ninja_audio_volume', String(this.masterVolume));
    } catch {
      // Ignore localStorage errors
    }
  }

  public unlock(): void {
    if (this.isUnlocked && this.audioCtx && this.audioCtx.state === 'running') {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Build Audio Bus Graph
      // [Source] -> [SFX / UI Gain] -> [Master Gain] -> [Destination]
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioCtx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.uiGain = this.audioCtx.createGain();
      this.uiGain.gain.setValueAtTime(this.uiVolume, this.audioCtx.currentTime);
      this.uiGain.connect(this.masterGain);

      this.isUnlocked = true;
    } catch (e) {
      console.warn('AudioManager unlock error:', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
    }
    this.saveSettings();
    return this.isMuted;
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    }
    this.saveSettings();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public hasPlayedEvent(eventId: string): boolean {
    if (this.playedEvents.has(eventId)) {
      return true;
    }
    this.playedEvents.add(eventId);
    if (this.playedEvents.size > 200) {
      const it = this.playedEvents.values();
      for (let i = 0; i < 50; i++) {
        this.playedEvents.delete(it.next().value!);
      }
    }
    return false;
  }

  // Synthesized Anime Sound Effects
  public playSound(
    type:
      | 'light_hit'
      | 'heavy_hit'
      | 'parry'
      | 'guard_block'
      | 'dodge'
      | 'wind_shuriken'
      | 'fireball_blast'
      | 'lightning_counter'
      | 'ui_click'
      | 'countdown',
    eventId?: string
  ): void {
    if (eventId && this.hasPlayedEvent(eventId)) {
      return;
    }

    if (!this.isUnlocked || !this.audioCtx || !this.sfxGain || !this.uiGain) {
      return;
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (type) {
      case 'light_hit': {
        // Fast katana slash sound: high-pass white noise + pitch swoop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'heavy_hit': {
        // Impact punch thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'parry': {
        // Dual metallic bell chime: 1200Hz + 1500Hz
        for (const freq of [1200, 1550]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.35);
        }
        break;
      }

      case 'guard_block': {
        // Deep shield resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'dodge': {
        // Filtered whoosh sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'wind_shuriken': {
        // Whirring blade sound: frequency modulation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.linearRampToValueAtTime(620, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'fireball_blast': {
        // Fire burst: low boom + sizzle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'lightning_counter': {
        // High voltage spark crackle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(220, now + 0.05);
        osc.frequency.setValueAtTime(740, now + 0.1);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'countdown': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.uiGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'ui_click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(this.uiGain);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
    }
  }
}
