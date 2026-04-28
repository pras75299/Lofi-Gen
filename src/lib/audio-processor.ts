import * as Tone from 'tone';

export type Effects = {
  vinylCrackle: number;
  tapeHiss: number;
  bitCrush: number;
  reverb: number;
  lowPass: number;
  tempo: number;
  backgroundReduction: number;
  stereoWidth: number;
  wowFlutter: number;
  compression: number;
  pitchShift: number;
  vocalReduction: number;
  harmonics: number;
};

export class LoFiProcessor {
  private player: Tone.Player | null = null;
  private lowPass: Tone.Filter;
  private reverb: Tone.Reverb;
  private vocalEQ: Tone.EQ3;
  private bgEQ: Tone.EQ3;
  private vinylNoise: Tone.Noise;
  private tapeHiss: Tone.Noise;
  private noiseLowPass: Tone.Filter;
  private noiseReverb: Tone.Reverb;
  private bitCrusher: Tone.BitCrusher;
  private eq: Tone.EQ3;
  private gainNode: Tone.Gain;
  private stereoWidener: Tone.StereoWidener;
  private compressor: Tone.Compressor;
  private pitchShift: Tone.PitchShift;
  private chebyshev: Tone.Chebyshev;
  private vibrato: Tone.Vibrato;

  constructor() {
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

    this.bgEQ = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 150,
      highFrequency: 4000
    });

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

    // Tone.Vibrato gives steady wow/flutter via internal LFO; simpler than wiring an LFO to pitchShift.
    this.vibrato = new Tone.Vibrato({
      frequency: 2,
      depth: 0,
      wet: 0
    });

    this.gainNode = new Tone.Gain(0.8);

    // Dedicated noise lowpass + reverb so noise sits in the same room as music without feedback cycles.
    this.noiseLowPass = new Tone.Filter({
      type: 'lowpass',
      frequency: 2000,
      rolloff: -24
    });

    this.noiseReverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2
    });

    this.vinylNoise.chain(this.noiseLowPass, this.noiseReverb, this.gainNode);
    this.tapeHiss.chain(this.noiseLowPass, this.noiseReverb, this.gainNode);

    this.gainNode.toDestination();
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
    this.updateEffectsChain();
  }

  private updateEffectsChain() {
    if (!this.player) return;

    this.player.disconnect();

    this.player.chain(
      this.bgEQ,
      this.vocalEQ,
      this.lowPass,
      this.pitchShift,
      this.vibrato,
      this.stereoWidener,
      this.compressor,
      this.bitCrusher,
      this.chebyshev,
      this.eq,
      this.reverb,
      this.gainNode
    );
  }

  setEffects(effects: Effects) {
    this.vinylNoise.volume.value = effects.vinylCrackle * -30 - 40;
    this.tapeHiss.volume.value = effects.tapeHiss * -30 - 50;
    this.bitCrusher.set({ bits: Math.floor(effects.bitCrush * 7 + 1) });
    this.reverb.wet.value = effects.reverb;
    this.noiseReverb.wet.value = effects.reverb;
    this.lowPass.frequency.value = effects.lowPass * 3000 + 500;
    this.noiseLowPass.frequency.value = effects.lowPass * 3000 + 500;

    this.vocalEQ.low.value = 0;
    this.vocalEQ.high.value = 0;
    this.vocalEQ.mid.value = -effects.vocalReduction * 12;

    this.bgEQ.low.value = -effects.backgroundReduction * 8;
    this.bgEQ.high.value = -effects.backgroundReduction * 6;
    this.bgEQ.mid.value = 0;

    this.chebyshev.wet.value = effects.harmonics;

    this.vibrato.depth.value = effects.wowFlutter * 0.5;
    this.vibrato.wet.value = effects.wowFlutter;

    if (this.player) {
      this.player.playbackRate = effects.tempo;
    }

    this.stereoWidener.width.value = effects.stereoWidth;

    this.compressor.threshold.value = -50 + effects.compression * 40;
    this.compressor.ratio.value = 1 + effects.compression * 19;

    this.pitchShift.pitch = effects.pitchShift * 24 - 12;
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

  dispose() {
    if (this.player) {
      try { this.player.stop(); } catch { /* ignore */ }
      this.player.dispose();
      this.player = null;
    }
    try { this.vinylNoise.stop(); } catch { /* ignore */ }
    try { this.tapeHiss.stop(); } catch { /* ignore */ }
    this.vinylNoise.dispose();
    this.tapeHiss.dispose();
    this.noiseLowPass.dispose();
    this.noiseReverb.dispose();
    this.lowPass.dispose();
    this.reverb.dispose();
    this.vocalEQ.dispose();
    this.bgEQ.dispose();
    this.bitCrusher.dispose();
    this.eq.dispose();
    this.stereoWidener.dispose();
    this.compressor.dispose();
    this.pitchShift.dispose();
    this.chebyshev.dispose();
    this.vibrato.dispose();
    this.gainNode.dispose();
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
    const liveBgLow = this.bgEQ.low.value;
    const liveBgMid = this.bgEQ.mid.value;
    const liveBgHigh = this.bgEQ.high.value;
    const liveStereoWidth = this.stereoWidener.width.value;
    const liveCompThreshold = this.compressor.threshold.value;
    const liveCompRatio = this.compressor.ratio.value;
    const livePitch = this.pitchShift.pitch;
    const liveChebyshevOrder = 3;
    const liveChebyshevWet = this.chebyshev.wet.value;
    const liveVibratoFreq = Number(this.vibrato.frequency.value);
    const liveVibratoDepth = this.vibrato.depth.value;
    const liveVibratoWet = this.vibrato.wet.value;
    const liveGain = this.gainNode.gain.value;
    const livePlaybackRate = this.player.playbackRate;
    const liveVinylVol = this.vinylNoise.volume.value;
    const liveHissVol = this.tapeHiss.volume.value;

    const renderedBuffer = await Tone.Offline(async () => {
      const offlineGain = new Tone.Gain(liveGain).toDestination();

      const offlineReverb = new Tone.Reverb({ decay: liveReverbDecay, wet: liveReverbWet });
      const offlineLowPass = new Tone.Filter({ type: 'lowpass', frequency: liveLowPassFreq, rolloff: -24 });
      const offlineBitCrusher = new Tone.BitCrusher(liveBitCrusherBits);
      const offlineEQ = new Tone.EQ3({ low: liveEqLow, mid: liveEqMid, high: liveEqHigh });
      const offlineVocalEQ = new Tone.EQ3({
        low: liveVocalLow,
        mid: liveVocalMid,
        high: liveVocalHigh,
        lowFrequency: 200,
        highFrequency: 2600
      });
      const offlineBgEQ = new Tone.EQ3({
        low: liveBgLow,
        mid: liveBgMid,
        high: liveBgHigh,
        lowFrequency: 150,
        highFrequency: 4000
      });
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
      const offlineVibrato = new Tone.Vibrato({
        frequency: liveVibratoFreq,
        depth: liveVibratoDepth,
        wet: liveVibratoWet
      });

      // Duplicate noise lowpass+reverb so noise lives in the same space without creating a cycle into the music chain.
      const offlineNoiseLowPass = new Tone.Filter({ type: 'lowpass', frequency: liveLowPassFreq, rolloff: -24 });
      const offlineNoiseReverb = new Tone.Reverb({ decay: liveReverbDecay, wet: liveReverbWet });

      const offlinePlayer = new Tone.Player(originalBuffer);
      offlinePlayer.playbackRate = livePlaybackRate;

      offlinePlayer.chain(
        offlineBgEQ,
        offlineVocalEQ,
        offlineLowPass,
        offlinePitchShift,
        offlineVibrato,
        offlineStereoWidener,
        offlineCompressor,
        offlineBitCrusher,
        offlineChebyshev,
        offlineEQ,
        offlineReverb,
        offlineGain
      );

      const offlineVinyl = new Tone.Noise({ type: 'pink', volume: liveVinylVol });
      const offlineHiss = new Tone.Noise({ type: 'white', volume: liveHissVol });

      offlineVinyl.chain(offlineNoiseLowPass, offlineNoiseReverb, offlineGain);
      offlineHiss.chain(offlineNoiseLowPass, offlineNoiseReverb, offlineGain);

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
}
