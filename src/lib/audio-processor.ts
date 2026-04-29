import * as Tone from 'tone';

export const MAX_PITCH_SHIFT_SEMITONES = 4;

export type Effects = {
  vinylCrackle: number;
  tapeHiss: number;
  bitCrush: number;
  reverb: number;
  lowPass: number;
  tempo: number;
  backgroundReduction: number;
  stereoWidth: number;
  wow: number;
  flutter: number;
  compression: number;
  pitchShift: number;
  vocalReduction: number;
  harmonics: number;
};

export class LoFiProcessor {
  private player: Tone.Player | null = null;
  private midSideSplit: Tone.MidSideSplit;
  private midSideMerge: Tone.MidSideMerge;
  private lowPass: Tone.Filter;
  private reverb: Tone.Reverb;
  private vocalEQ: Tone.EQ3;
  private bgEQ: Tone.EQ3;
  private vocalGain: Tone.Gain;
  private backgroundGain: Tone.Gain;
  private vinylNoise: Tone.Noise;
  private tapeHiss: Tone.Noise;
  private vinylHighPass: Tone.Filter;
  private vinylLowPass: Tone.Filter;
  private vinylTremolo: Tone.Tremolo;
  private tapeHighPass: Tone.Filter;
  private tapeLowPass: Tone.Filter;
  private noiseReverb: Tone.Reverb;
  private bitCrusher: Tone.BitCrusher;
  private eq: Tone.EQ3;
  private musicGain: Tone.Gain;
  private noiseGain: Tone.Gain;
  private masterGain: Tone.Gain;
  private limiter: Tone.Limiter;
  private stereoWidener: Tone.StereoWidener;
  private compressor: Tone.Compressor;
  private pitchShift: Tone.PitchShift;
  private chebyshev: Tone.Chebyshev;
  private wowVibrato: Tone.Vibrato;
  private flutterVibrato: Tone.Vibrato;
  private warmthOrder = 3;
  private isPlaying = false;

  constructor(private readonly onPlaybackStateChange?: (isPlaying: boolean) => void) {
    this.midSideSplit = new Tone.MidSideSplit();
    this.midSideMerge = new Tone.MidSideMerge();

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

    this.vocalEQ = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 200,
      highFrequency: 2600
    });
    this.vocalGain = new Tone.Gain(1);

    this.bgEQ = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 150,
      highFrequency: 4000
    });
    this.backgroundGain = new Tone.Gain(1);

    this.stereoWidener = new Tone.StereoWidener(0.5);

    this.compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 30
    });

    this.pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    });

    this.chebyshev = new Tone.Chebyshev({
      order: 3,
      wet: 0
    });

    this.wowVibrato = new Tone.Vibrato({
      frequency: 0.6,
      depth: 0,
      wet: 0
    });

    this.flutterVibrato = new Tone.Vibrato({
      frequency: 6,
      depth: 0,
      wet: 0
    });

    this.musicGain = new Tone.Gain(0.88);
    this.noiseGain = new Tone.Gain(0.35);
    this.masterGain = new Tone.Gain(0.92);
    this.limiter = new Tone.Limiter(-1);

    // Shape vinyl crackle as bright bursts instead of constant low-passed wash.
    this.vinylHighPass = new Tone.Filter({
      type: 'highpass',
      frequency: 2400,
      rolloff: -24
    });

    this.vinylLowPass = new Tone.Filter({
      type: 'lowpass',
      frequency: 7200,
      rolloff: -12
    });

    this.vinylTremolo = new Tone.Tremolo({
      frequency: 8,
      depth: 0.85,
      spread: 0,
      wet: 1
    }).start();

    this.tapeHighPass = new Tone.Filter({
      type: 'highpass',
      frequency: 3200,
      rolloff: -24
    });

    this.tapeLowPass = new Tone.Filter({
      type: 'lowpass',
      frequency: 9600,
      rolloff: -12
    });

    this.noiseReverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2
    });

    this.vinylNoise.chain(this.vinylHighPass, this.vinylLowPass, this.vinylTremolo, this.noiseReverb, this.noiseGain);
    this.tapeHiss.chain(this.tapeHighPass, this.tapeLowPass, this.noiseReverb, this.noiseGain);

    this.midSideSplit.mid.chain(this.vocalEQ, this.vocalGain, this.midSideMerge.mid);
    this.midSideSplit.side.chain(this.bgEQ, this.backgroundGain, this.midSideMerge.side);

    this.midSideMerge.chain(
      this.lowPass,
      this.pitchShift,
      this.wowVibrato,
      this.flutterVibrato,
      this.stereoWidener,
      this.compressor,
      this.bitCrusher,
      this.chebyshev,
      this.eq,
      this.reverb,
      this.musicGain
    );

    this.musicGain.connect(this.masterGain);
    this.noiseGain.connect(this.masterGain);
    this.masterGain.connect(this.limiter);
    this.limiter.toDestination();
  }

  async loadFile(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(buffer);

    if (this.player) {
      this.player.stop();
      this.player.disconnect();
      this.player.dispose();
    }

    this.player = new Tone.Player(audioBuffer);
    this.player.onstop = () => {
      this.isPlaying = false;
      this.onPlaybackStateChange?.(false);
    };
    this.updateEffectsChain();
  }

  private updateEffectsChain() {
    if (!this.player) return;

    this.player.disconnect();
    this.player.connect(this.midSideSplit);
  }

  setEffects(effects: Effects) {
    const lowPassFrequency = this.getLowPassFrequency(effects.lowPass);

    this.vinylNoise.volume.value = -72 + effects.vinylCrackle * 34;
    this.tapeHiss.volume.value = -76 + effects.tapeHiss * 30;
    this.bitCrusher.set({ bits: this.getBitDepth(effects.bitCrush) });
    this.reverb.wet.value = effects.reverb;
    this.noiseReverb.wet.value = effects.reverb;
    this.lowPass.frequency.value = lowPassFrequency;
    this.vinylLowPass.frequency.value = Math.max(3800, lowPassFrequency * 1.35);
    this.tapeLowPass.frequency.value = Math.max(5000, lowPassFrequency * 1.8);

    this.vocalEQ.low.value = -effects.vocalReduction * 1.5;
    this.vocalEQ.high.value = -effects.vocalReduction * 2.5;
    this.vocalEQ.mid.value = -effects.vocalReduction * 14;
    this.vocalGain.gain.value = this.getVocalGain(effects.vocalReduction);

    this.bgEQ.low.value = -effects.backgroundReduction * 4;
    this.bgEQ.high.value = -effects.backgroundReduction * 4;
    this.bgEQ.mid.value = -effects.backgroundReduction * 2;
    this.backgroundGain.gain.value = this.getBackgroundGain(effects.backgroundReduction);

    this.warmthOrder = 2 + Math.round(effects.harmonics * 4);
    this.chebyshev.order = this.warmthOrder;
    this.chebyshev.wet.value = effects.harmonics * 0.45;

    this.wowVibrato.frequency.value = 0.18 + effects.wow * 1.4;
    this.wowVibrato.depth.value = effects.wow * 0.12;
    this.wowVibrato.wet.value = effects.wow * 0.9;

    this.flutterVibrato.frequency.value = 4.5 + effects.flutter * 8.5;
    this.flutterVibrato.depth.value = effects.flutter * 0.045;
    this.flutterVibrato.wet.value = effects.flutter * 0.75;

    if (this.player) {
      this.player.playbackRate = effects.tempo;
    }

    this.stereoWidener.width.value = effects.stereoWidth;

    this.compressor.threshold.value = -50 + effects.compression * 40;
    this.compressor.ratio.value = 1 + effects.compression * 19;

    this.pitchShift.pitch = this.getPitchShiftSemitones(effects.pitchShift);
    this.musicGain.gain.value = this.getMusicGain(effects);
    this.noiseGain.gain.value = this.getNoiseGain(effects);
  }

  async play() {
    if (!this.player || this.isPlaying) return;
    await Tone.start();
    this.vinylNoise.start();
    this.tapeHiss.start();
    this.player.start();
    this.isPlaying = true;
    this.onPlaybackStateChange?.(true);
  }

  stop() {
    if (!this.isPlaying) return;
    this.vinylNoise.stop();
    this.tapeHiss.stop();
    if (this.player) {
      this.player.stop();
    }
    this.isPlaying = false;
    this.onPlaybackStateChange?.(false);
  }

  dispose() {
    if (this.player) {
      try { this.player.stop(); } catch { /* ignore */ }
      this.player.dispose();
      this.player = null;
    }
    try { this.vinylNoise.stop(); } catch { /* ignore */ }
    try { this.tapeHiss.stop(); } catch { /* ignore */ }
    try { this.vinylTremolo.stop(); } catch { /* ignore */ }
    this.vinylNoise.dispose();
    this.tapeHiss.dispose();
    this.vinylHighPass.dispose();
    this.vinylLowPass.dispose();
    this.vinylTremolo.dispose();
    this.tapeHighPass.dispose();
    this.tapeLowPass.dispose();
    this.noiseReverb.dispose();
    this.lowPass.dispose();
    this.reverb.dispose();
    this.midSideSplit.dispose();
    this.midSideMerge.dispose();
    this.vocalEQ.dispose();
    this.bgEQ.dispose();
    this.vocalGain.dispose();
    this.backgroundGain.dispose();
    this.bitCrusher.dispose();
    this.eq.dispose();
    this.musicGain.dispose();
    this.noiseGain.dispose();
    this.masterGain.dispose();
    this.limiter.dispose();
    this.stereoWidener.dispose();
    this.compressor.dispose();
    this.pitchShift.dispose();
    this.chebyshev.dispose();
    this.wowVibrato.dispose();
    this.flutterVibrato.dispose();
  }

  async exportLoFi(): Promise<Blob> {
    if (!this.player || !this.player.buffer) {
      throw new Error("No audio loaded");
    }

    const originalBuffer = this.player.buffer;
    const duration = originalBuffer.duration / this.player.playbackRate;

    const liveLowPassFreq = this.lowPass.frequency.value;
    const liveReverbDecay = Number(this.reverb.decay);
    const liveReverbWet = this.reverb.wet.value;
    const liveBitCrusherBits = Number(this.bitCrusher.bits.value);
    const liveEqLow = this.eq.low.value;
    const liveEqMid = this.eq.mid.value;
    const liveEqHigh = this.eq.high.value;
    const liveVocalLow = this.vocalEQ.low.value;
    const liveVocalMid = this.vocalEQ.mid.value;
    const liveVocalHigh = this.vocalEQ.high.value;
    const liveVocalGain = this.vocalGain.gain.value;
    const liveBgLow = this.bgEQ.low.value;
    const liveBgMid = this.bgEQ.mid.value;
    const liveBgHigh = this.bgEQ.high.value;
    const liveBackgroundGain = this.backgroundGain.gain.value;
    const liveStereoWidth = this.stereoWidener.width.value;
    const liveCompThreshold = this.compressor.threshold.value;
    const liveCompRatio = this.compressor.ratio.value;
    const livePitch = this.pitchShift.pitch;
    const liveChebyshevOrder = this.warmthOrder;
    const liveChebyshevWet = this.chebyshev.wet.value;
    const liveWowFreq = Number(this.wowVibrato.frequency.value);
    const liveWowDepth = this.wowVibrato.depth.value;
    const liveWowWet = this.wowVibrato.wet.value;
    const liveFlutterFreq = Number(this.flutterVibrato.frequency.value);
    const liveFlutterDepth = this.flutterVibrato.depth.value;
    const liveFlutterWet = this.flutterVibrato.wet.value;
    const liveMusicGain = this.musicGain.gain.value;
    const liveNoiseGain = this.noiseGain.gain.value;
    const liveMasterGain = this.masterGain.gain.value;
    const livePlaybackRate = this.player.playbackRate;
    const liveVinylVol = this.vinylNoise.volume.value;
    const liveHissVol = this.tapeHiss.volume.value;
    const liveVinylLowPass = this.vinylLowPass.frequency.value;
    const liveTapeLowPass = this.tapeLowPass.frequency.value;

    const renderedBuffer = await Tone.Offline(async () => {
      const offlineLimiter = new Tone.Limiter(-1).toDestination();
      const offlineMasterGain = new Tone.Gain(liveMasterGain).connect(offlineLimiter);
      const offlineMusicGain = new Tone.Gain(liveMusicGain).connect(offlineMasterGain);
      const offlineNoiseGain = new Tone.Gain(liveNoiseGain).connect(offlineMasterGain);

      const offlineReverb = new Tone.Reverb({ decay: liveReverbDecay, wet: liveReverbWet });
      const offlineLowPass = new Tone.Filter({ type: 'lowpass', frequency: liveLowPassFreq, rolloff: -24 });
      const offlineBitCrusher = new Tone.BitCrusher(liveBitCrusherBits);
      const offlineEQ = new Tone.EQ3({ low: liveEqLow, mid: liveEqMid, high: liveEqHigh });
      const offlineMidSideSplit = new Tone.MidSideSplit();
      const offlineMidSideMerge = new Tone.MidSideMerge();
      const offlineVocalEQ = new Tone.EQ3({
        low: liveVocalLow,
        mid: liveVocalMid,
        high: liveVocalHigh,
        lowFrequency: 200,
        highFrequency: 2600
      });
      const offlineVocalGain = new Tone.Gain(liveVocalGain);
      const offlineBgEQ = new Tone.EQ3({
        low: liveBgLow,
        mid: liveBgMid,
        high: liveBgHigh,
        lowFrequency: 150,
        highFrequency: 4000
      });
      const offlineBackgroundGain = new Tone.Gain(liveBackgroundGain);
      const offlineStereoWidener = new Tone.StereoWidener(liveStereoWidth);
      const offlineCompressor = new Tone.Compressor({
        threshold: liveCompThreshold,
        ratio: liveCompRatio,
        attack: 0.003,
        release: 0.25,
        knee: 30
      });
      const offlinePitchShift = new Tone.PitchShift({ pitch: livePitch });
      const offlineChebyshev = new Tone.Chebyshev({ order: liveChebyshevOrder, wet: liveChebyshevWet });
      const offlineWowVibrato = new Tone.Vibrato({
        frequency: liveWowFreq,
        depth: liveWowDepth,
        wet: liveWowWet
      });
      const offlineFlutterVibrato = new Tone.Vibrato({
        frequency: liveFlutterFreq,
        depth: liveFlutterDepth,
        wet: liveFlutterWet
      });

      // Mirror the live noise shaping so preview and export stay close.
      const offlineVinylHighPass = new Tone.Filter({ type: 'highpass', frequency: 2400, rolloff: -24 });
      const offlineVinylLowPass = new Tone.Filter({ type: 'lowpass', frequency: liveVinylLowPass, rolloff: -12 });
      const offlineVinylTremolo = new Tone.Tremolo({ frequency: 8, depth: 0.85, spread: 0, wet: 1 }).start();
      const offlineTapeHighPass = new Tone.Filter({ type: 'highpass', frequency: 3200, rolloff: -24 });
      const offlineTapeLowPass = new Tone.Filter({ type: 'lowpass', frequency: liveTapeLowPass, rolloff: -12 });
      const offlineNoiseReverb = new Tone.Reverb({ decay: liveReverbDecay, wet: liveReverbWet });

      const offlinePlayer = new Tone.Player(originalBuffer);
      offlinePlayer.playbackRate = livePlaybackRate;

      offlineMidSideSplit.mid.chain(offlineVocalEQ, offlineVocalGain, offlineMidSideMerge.mid);
      offlineMidSideSplit.side.chain(offlineBgEQ, offlineBackgroundGain, offlineMidSideMerge.side);

      offlineMidSideMerge.chain(
        offlineLowPass,
        offlinePitchShift,
        offlineWowVibrato,
        offlineFlutterVibrato,
        offlineStereoWidener,
        offlineCompressor,
        offlineBitCrusher,
        offlineChebyshev,
        offlineEQ,
        offlineReverb,
        offlineMusicGain
      );

      offlinePlayer.connect(offlineMidSideSplit);

      const offlineVinyl = new Tone.Noise({ type: 'pink', volume: liveVinylVol });
      const offlineHiss = new Tone.Noise({ type: 'white', volume: liveHissVol });

      offlineVinyl.chain(offlineVinylHighPass, offlineVinylLowPass, offlineVinylTremolo, offlineNoiseReverb, offlineNoiseGain);
      offlineHiss.chain(offlineTapeHighPass, offlineTapeLowPass, offlineNoiseReverb, offlineNoiseGain);

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

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
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

  private getLowPassFrequency(amount: number) {
    const maxFrequency = 14000;
    const minFrequency = 900;
    return maxFrequency * Math.pow(minFrequency / maxFrequency, amount);
  }

  private getBitDepth(amount: number) {
    return Math.max(4, Math.round(12 - amount * 8));
  }

  private getPitchShiftSemitones(amount: number) {
    return (amount - 0.5) * MAX_PITCH_SHIFT_SEMITONES * 2;
  }

  private getVocalGain(amount: number) {
    return Math.max(0.25, 1 - amount * 0.75);
  }

  private getBackgroundGain(amount: number) {
    return Math.max(0.2, 1 - amount * 0.8);
  }

  private getMusicGain(effects: Effects) {
    const lowPassComp = effects.lowPass * 0.12;
    const reverbComp = effects.reverb * 0.06;
    const compressionTrim = effects.compression * 0.08;
    const saturationTrim = effects.harmonics * 0.05;
    const crushTrim = effects.bitCrush * 0.04;

    return Math.max(0.68, 0.92 + lowPassComp + reverbComp - compressionTrim - saturationTrim - crushTrim);
  }

  private getNoiseGain(effects: Effects) {
    const noiseDensity = (effects.vinylCrackle + effects.tapeHiss) * 0.5;
    const lowPassSupport = effects.lowPass * 0.06;
    return 0.22 + noiseDensity * 0.24 + lowPassSupport;
  }
}
