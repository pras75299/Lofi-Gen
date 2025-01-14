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

    this.gainNode = new Tone.Gain(0.8);

    // Connect effects chain
    this.vinylNoise.connect(this.gainNode);
    this.tapeHiss.connect(this.gainNode);
    this.gainNode.toDestination();
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
  }) {
    this.vinylNoise.volume.value = effects.vinylCrackle * -30 - 40;
    this.tapeHiss.volume.value = effects.tapeHiss * -30 - 50;
    this.bitCrusher.bits = Math.floor(effects.bitCrush * 7 + 1);
    this.reverb.wet.value = effects.reverb;
    this.lowPass.frequency.value = effects.lowPass * 3000 + 500;
    
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
    return new Promise((resolve) => {
      const chunks: BlobPart[] = [];
      const dest = Tone.context.createMediaStreamDestination();
      const offlineContext = new OfflineAudioContext(2, 44100 * 10, 44100);
      
      // Process audio faster using OfflineAudioContext
      if (this.player) {
        this.player.disconnect();
        this.player.chain(
          this.midEQ,
          this.lowPass,
          this.pitchShift,
          this.panner,
          this.compressor,
          this.bitCrusher,
          this.eq,
          this.reverb,
          this.gainNode,
          dest
        );
      }
      
      // Connect noise generators
      this.vinylNoise.disconnect();
      this.tapeHiss.disconnect();
      this.vinylNoise.connect(this.gainNode);
      this.tapeHiss.connect(this.gainNode);
      
      this.gainNode.connect(dest);
      
      const mediaRecorder = new MediaRecorder(dest.stream);
      
      mediaRecorder.ondataavailable = (evt) => {
        chunks.push(evt.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Restore original connections
        if (this.player) {
          this.player.disconnect();
          this.updateEffectsChain();
        }
        
        if (!this.isolateVocals) {
          this.vinylNoise.disconnect();
          this.tapeHiss.disconnect();
          this.vinylNoise.connect(this.gainNode);
          this.tapeHiss.connect(this.gainNode);
        }
        
        this.gainNode.toDestination();
        
        resolve(blob);
      };
      
      // Start recording
      mediaRecorder.start();
      this.play();
      
      // Record for the duration of the audio
      setTimeout(() => {
        mediaRecorder.stop();
        this.stop();
      }, this.player?.buffer.duration * 1000);
    });
  }
}