// Pure procedural Web Audio API sound generator - Zero 404s, works offline

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  public isMuted: boolean = false;
  public isAmbientOn: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a gentle water bubble pop / droplet sound
  public playBubble() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startFreq = 300 + Math.random() * 250;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  // Play a magical crystalline chime for specimen discovery
  public playChime(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5].map((f) => f * pitchMultiplier);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.5);
      });
    } catch {
      // audio error ignored
    }
  }

  // Play an epic, sparkling treasure chest unlock fanfare
  public playChestUnlock() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Heavy resonant latch click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(140, now);
      clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.2);

      // Shimmering harp sweep
      const arpeggio = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5];
      arpeggio.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + 0.1 + i * 0.07);

        gain.gain.setValueAtTime(0.09, now + 0.1 + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.1 + i * 0.07);
        osc.stop(now + 0.1 + i * 0.07 + 0.65);
      });
    } catch {
      // audio error ignored
    }
  }

  // Play candle blow whoosh + FULL celebratory Happy Birthday song with chimes & harmonies
  public playCandleBlow() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 1. Gentle breath / whoosh noise using modulated oscillator
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.type = 'sine';
      noise.frequency.setValueAtTime(200, now);
      noise.frequency.exponentialRampToValueAtTime(40, now + 0.38);

      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.4);

      // 2. Complete Happy Birthday Melody (All 4 phrases + Chimes & Harmony)
      // Notes: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25, D5=587.33, E5=659.25, F5=698.46
      const melody = [
        // Phrase 1: "Happy Birthday to you"
        { f: 261.63, t: 0.4, d: 0.28 },
        { f: 261.63, t: 0.72, d: 0.22 },
        { f: 293.66, t: 1.0, d: 0.48 },
        { f: 261.63, t: 1.55, d: 0.48 },
        { f: 349.23, t: 2.1, d: 0.48 },
        { f: 329.63, t: 2.65, d: 0.85 },

        // Phrase 2: "Happy Birthday to you"
        { f: 261.63, t: 3.65, d: 0.28 },
        { f: 261.63, t: 3.97, d: 0.22 },
        { f: 293.66, t: 4.25, d: 0.48 },
        { f: 261.63, t: 4.8, d: 0.48 },
        { f: 392.00, t: 5.35, d: 0.48 },
        { f: 349.23, t: 5.9, d: 0.85 },

        // Phrase 3: "Happy Birthday to dear Mercedes"
        { f: 261.63, t: 6.9, d: 0.28 },
        { f: 261.63, t: 7.22, d: 0.22 },
        { f: 523.25, t: 7.5, d: 0.55 },
        { f: 440.00, t: 8.15, d: 0.5 },
        { f: 349.23, t: 8.75, d: 0.48 },
        { f: 329.63, t: 9.3, d: 0.48 },
        { f: 293.66, t: 9.85, d: 0.85 },

        // Phrase 4: "Happy Birthday to you!"
        { f: 466.16, t: 10.85, d: 0.28 },
        { f: 466.16, t: 11.17, d: 0.22 },
        { f: 440.00, t: 11.45, d: 0.52 },
        { f: 349.23, t: 12.05, d: 0.5 },
        { f: 392.00, t: 12.65, d: 0.5 },
        { f: 349.23, t: 13.25, d: 1.4 },
      ];

      // Accompaniment Chords (Warm bass bells)
      const harmonies = [
        { f: 174.61, t: 0.4, d: 1.2 },   // F3
        { f: 130.81, t: 2.1, d: 1.3 },   // C3
        { f: 174.61, t: 3.65, d: 1.2 },  // F3
        { f: 130.81, t: 5.35, d: 1.3 },  // C3
        { f: 174.61, t: 6.9, d: 1.2 },   // F3
        { f: 233.08, t: 8.15, d: 1.2 },  // Bb3
        { f: 174.61, t: 9.85, d: 0.9 },  // F3
        { f: 233.08, t: 10.85, d: 1.0 }, // Bb3
        { f: 130.81, t: 12.05, d: 1.0 }, // C3
        { f: 174.61, t: 13.25, d: 2.0 }, // F3
      ];

      // Play main melody notes with music-box bell timbre
      melody.forEach((n) => {
        const osc = ctx.createOscillator();
        const chime = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        // Overtone shimmer (octave up bell)
        chime.type = 'sine';
        chime.frequency.setValueAtTime(n.f * 2, now + n.t);

        gain.gain.setValueAtTime(0.14, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(gain);
        chime.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.t);
        chime.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
        chime.stop(now + n.t + n.d + 0.05);
      });

      // Play bass harmonies
      harmonies.forEach((h) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.f, now + h.t);

        gain.gain.setValueAtTime(0.08, now + h.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + h.t + h.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + h.t);
        osc.stop(now + h.t + h.d + 0.05);
      });

      // Shimmering finale arpeggio at the end of the song
      const finaleArp = [349.23, 440.00, 523.25, 698.46, 880.00, 1046.5];
      finaleArp.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 14.6 + idx * 0.07);

        gain.gain.setValueAtTime(0.09, now + 14.6 + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 14.6 + idx * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 14.6 + idx * 0.07);
        osc.stop(now + 14.6 + idx * 0.07 + 0.65);
      });
    } catch {
      // audio error ignored
    }
  }

  // Toggle relaxing oceanic ambient synthesizer
  public toggleAmbient(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isAmbientOn;
    this.isAmbientOn = target;

    if (!target) {
      this.stopAmbient();
      return false;
    }

    try {
      const ctx = this.getContext();
      this.stopAmbient();

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.isMuted ? 0 : 0.03, ctx.currentTime);
      master.connect(ctx.destination);
      this.ambientGain = master;

      // Layered soft oceanic tones (F major / underwater harmonic drone)
      const freqs = [174.61, 220.0, 261.63, 349.23];
      this.ambientOscs = freqs.map((f, idx) => {
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Slow ocean swell LFO
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15 + idx * 0.08, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(master);
        lfo.start();
        osc.start();
        return osc;
      });

      return true;
    } catch {
      this.isAmbientOn = false;
      return false;
    }
  }

  public stopAmbient() {
    this.ambientOscs.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        // ignore
      }
    });
    this.ambientOscs = [];
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // ignore
      }
      this.ambientGain = null;
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.03, this.ctx.currentTime);
    }
  }
}

export const soundEngine = new SoundEngine();
