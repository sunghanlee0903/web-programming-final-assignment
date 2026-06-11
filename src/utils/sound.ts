// Web Audio API Retro 8-bit Sound Synthesizer
// Completely offline, file-free, ultra-responsive retro sounds.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check local storage for mute preference
    const savedMute = localStorage.getItem('pokemon_battle_muted');
    this.isMuted = savedMute === 'true';
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('pokemon_battle_muted', String(muted));
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMutedStatus(): boolean {
    return this.isMuted;
  }

  public playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    startTimeOffset = 0,
    volumeVal = 0.1
  ) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

      gain.gain.setValueAtTime(volumeVal, ctx.currentTime + startTimeOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTimeOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration);
    } catch (e) {
      console.warn('Audio Context failed to play:', e);
    }
  }

  // 1. Select / Click Sound (Clean Beep)
  public playSelect() {
    this.playTone(880, 'square', 0.1, 0, 0.05);
  }

  // 2. Normal Hit Sound (Noise/Crunch sound synthesized with white-noise like modulation)
  public playHit() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const bufferSize = ctx.sampleRate * 0.15; // 150ms of sound
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate retro noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filter for crunchier sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 0.15);

      // Add a low square beep under the noise for punch
      this.playTone(150, 'square', 0.12, 0, 0.1);
    } catch (e) {
      // Fallback tone if noise generation fails
      this.playTone(220, 'triangle', 0.15, 0, 0.15);
    }
  }

  // 3. Super Effective Hit Sound (Double explosion / Deep noise sweep)
  public playSuperEffective() {
    this.playHit();
    // Extra low explosion sweep
    setTimeout(() => {
      this.playTone(90, 'sawtooth', 0.25, 0, 0.25);
    }, 40);
  }

  // 4. Victory Sound (Classic upbeat retro arpeggio)
  public playVictory() {
    if (this.isMuted) return;
    const tempo = 0.12; // Time between notes
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const type: OscillatorType = index === notes.length - 1 ? 'sine' : 'square';
      const duration = index === notes.length - 1 ? 0.6 : 0.18;
      const vol = index === notes.length - 1 ? 0.12 : 0.08;
      this.playTone(freq, type, duration, index * tempo, vol);
    });
  }

  // 5. Defeat Sound (Downward detuned sliding scale)
  public playDefeat() {
    if (this.isMuted) return;
    const tempo = 0.15;
    const notes = [392.00, 349.23, 311.13, 246.94, 196.00]; // G4, F4, D#4, B3, G3
    
    notes.forEach((freq, index) => {
      const duration = index === notes.length - 1 ? 0.8 : 0.25;
      const vol = index === notes.length - 1 ? 0.15 : 0.08;
      this.playTone(freq, 'sawtooth', duration, index * tempo, vol);
    });
  }
}

export const sound = new SoundManager();
