import * as Tone from 'tone';

export class LoFiProcessor {
  private player: Tone.Player | null = null;
  private lowPass: Tone.Filter;
  private reverb: Tone.Reverb;
  private midEQ: Tone.EQ3;
  private backgroundReduction: number = 0;
  private vinylNoise: Tone.Noise;
  private tapeHiss: Tone.Noise;
  private bitCrusher: Tone.BitCrusher;
  private eq: Tone.EQ3;
  private gainNode: Tone.Gain;
  private panner: Tone.Panner3D;
  private compressor: Tone.Compressor;
  private pitchShift: Tone.PitchShift;
  private harmonicOscillator: Tone.Oscillator;

  constructor() {
    // Initialize effects
    this.lowPass = new Tone.Filter({
      type: 'lowpass',
      frequency: 2000,
      rolloff: -24
    });

    this.reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2
    });

    this.vinylNoise = new Tone.Noise({
      type: 'pink',
      volume: -40
    });

    this.tapeHiss = new Tone.Noise({
      type: 'white',
      volume: -50
    });

    this.bitCrusher = new Tone.BitCrusher({
      bits: 8
    });

    this.eq = new Tone.EQ3({
      low: 2,
      mid: 0,
      high: -2
    });

    // EQ for background reduction
    this.midEQ = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 200,
      highFrequency: 2600
    });

    // Initialize spatial audio
    this.panner = new Tone.Panner3D({
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rolloffFactor: 1,
    });

    // Initialize compressor for dynamic range control
    this.compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 30
    });

    // Initialize pitch shifter
    this.pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    });
    this.harmonicOscillator = new Tone.Oscillator({
      frequency: 440, // Base frequency
      type: 'sine', // Harmonic waveform
      volume: -20,  // Default volume for harmonics
    });

    this.gainNode = new Tone.Gain(0.8);

    // Connect effects chain
    this.vinylNoise.connect(this.gainNode);
    this.tapeHiss.connect(this.gainNode);
    this.gainNode.toDestination();

    this.harmonicOscillator.connect(this.gainNode);
  }

  async loadFile(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(buffer);

    if (this.player) {
      this.player.disconnect();
    }

    this.player = new Tone.Player(audioBuffer);
    this.updateEffectsChain();
  }

  private updateEffectsChain() {
    if (!this.player) return;

    this.player.disconnect();

    // Standard lo-fi effects chain with background reduction
    this.player.chain(
      this.midEQ, // Apply background reduction first
      this.lowPass,
      this.pitchShift,
      this.panner,
      this.compressor,
      this.bitCrusher,
      this.eq,
      this.reverb,
      this.gainNode
    );

    // Update background reduction
    this.midEQ.low.value = -this.backgroundReduction * 12;  // Reduce low frequencies
    this.midEQ.high.value = -this.backgroundReduction * 8;  // Reduce high frequencies
    this.midEQ.mid.value = this.backgroundReduction * 6;    // Boost mid frequencies (vocals)
  }

  setEffects(effects: {
    vinylCrackle: number;
    tapeHiss: number;
    bitCrush: number;
    reverb: number;
    lowPass: number;
    tempo: number;
    backgroundReduction: number;
    spatialX: number;
    spatialY: number;
    spatialZ: number;
    compression: number;
    pitchShift: number;
    vocalReduction: number;
    harmonics: number;
  }) {
    this.vinylNoise.volume.value = effects.vinylCrackle * -30 - 40;
    this.tapeHiss.volume.value = effects.tapeHiss * -30 - 50;
    this.bitCrusher.set({ bits: Math.floor(effects.bitCrush * 7 + 1) });
    this.reverb.wet.value = effects.reverb;
    this.lowPass.frequency.value = effects.lowPass * 3000 + 500;
    this.midEQ.low.value = -effects.vocalReduction * 12;
    this.midEQ.high.value = -effects.vocalReduction * 8;
    this.midEQ.mid.value = effects.vocalReduction * 6;

    this.harmonicOscillator.volume.value = effects.harmonics * -30 - 20; // Adjust harmonic intensity
    if (effects.harmonics > 0 && !this.harmonicOscillator.state) {
      this.harmonicOscillator.start();
    } else if (effects.harmonics === 0 && this.harmonicOscillator.state) {
      this.harmonicOscillator.stop();
    }

    if (this.player) {
      this.player.playbackRate = effects.tempo;
    }

    if (this.backgroundReduction !== effects.backgroundReduction) {
      this.backgroundReduction = effects.backgroundReduction;
      this.updateEffectsChain();
    }

    // Update spatial audio position
    this.panner.positionX.value = effects.spatialX * 10 - 5; // Range: -5 to 5
    this.panner.positionY.value = effects.spatialY * 10 - 5;
    this.panner.positionZ.value = effects.spatialZ * 10 - 5;

    // Update compressor settings
    this.compressor.threshold.value = -50 + effects.compression * 40; // Range: -50 to -10
    this.compressor.ratio.value = 1 + effects.compression * 19; // Range: 1 to 20

    // Update pitch shift
    this.pitchShift.pitch = effects.pitchShift * 24 - 12; // Range: -12 to 12 semitones
  }

  async play() {
    await Tone.start();
    this.vinylNoise.start();
    this.tapeHiss.start();
    if (this.player) {
      this.player.start();
    }
  }

  stop() {
    this.vinylNoise.stop();
    this.tapeHiss.stop();
    if (this.player) {
      this.player.stop();
    }
  }

  async exportLoFi(): Promise<Blob> {
    if (!this.player || !this.player.buffer) {
      throw new Error("No audio loaded");
    }

    const originalBuffer = this.player.buffer;
    const duration = originalBuffer.duration / this.player.playbackRate;

    // Use Tone.Offline for deterministic, faster-than-real-time rendering
    const renderedBuffer = await Tone.Offline(async () => {
      const offlinePlayer = new Tone.Player(originalBuffer);
      offlinePlayer.playbackRate = this.player!.playbackRate;

      const offlineLowPass = new Tone.Filter({
        type: 'lowpass',
        frequency: this.lowPass.frequency.value,
        rolloff: -24
      }).toDestination();

      const offlineReverb = new Tone.Reverb({
        decay: Number(this.reverb.decay),
        wet: this.reverb.wet.value
      }).toDestination();

      const offlineBitCrusher = new Tone.BitCrusher(
        Number(this.bitCrusher.bits.value)
      ).toDestination();

      const offlineEQ = new Tone.EQ3({
        low: this.eq.low.value,
        mid: this.eq.mid.value,
        high: this.eq.high.value
      }).toDestination();

      const offlineMidEQ = new Tone.EQ3({
        low: this.midEQ.low.value,
        mid: this.midEQ.mid.value,
        high: this.midEQ.high.value,
        lowFrequency: 200,
        highFrequency: 2600
      }).toDestination();

      const offlinePanner = new Tone.Panner3D({
        positionX: this.panner.positionX.value,
        positionY: this.panner.positionY.value,
        positionZ: this.panner.positionZ.value,
      }).toDestination();

      const offlineCompressor = new Tone.Compressor({
        threshold: this.compressor.threshold.value,
        ratio: this.compressor.ratio.value,
        attack: 0.003,
        release: 0.25,
        knee: 30
      }).toDestination();

      const offlinePitchShift = new Tone.PitchShift({
        pitch: this.pitchShift.pitch,
      }).toDestination();

      const offlineGain = new Tone.Gain(this.gainNode.gain.value).toDestination();

      // Noise generators in offline context
      const offlineVinyl = new Tone.Noise({
        type: 'pink',
        volume: this.vinylNoise.volume.value
      }).connect(offlineGain);

      const offlineHiss = new Tone.Noise({
        type: 'white',
        volume: this.tapeHiss.volume.value
      }).connect(offlineGain);

      offlinePlayer.chain(
        offlineMidEQ,
        offlineLowPass,
        offlinePitchShift,
        offlinePanner,
        offlineCompressor,
        offlineBitCrusher,
        offlineEQ,
        offlineReverb,
        offlineGain
      );

      offlinePlayer.start(0);
      offlineVinyl.start(0);
      offlineHiss.start(0);
    }, duration);

    return this.audioBufferToWav(renderedBuffer.get()!);
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) { // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([outBuffer], { type: 'audio/wav' });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
}
