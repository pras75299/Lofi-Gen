import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Music2, Settings2, Music } from "lucide-react";
import { WaveformVisualizer } from "@/components/audio/waveform-visualizer";
import { LoFiProcessor } from "@/lib/audio-processor";
import { supabase } from "@/lib/supabase";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/components/auth/auth-provider";

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  createdAt: Date;
}

export const CreatePage = () => {
  const { user, signOut } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<LoFiProcessor | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  const defaultEffects = {
    vinylCrackle: 1,
    tapeHiss: 1,
    bitCrush: 1,
    reverb: 1,
    lowPass: 0.7,
    tempo: 1.0,
    backgroundReduction: 1,
    spatialX: 0.5,
    spatialY: 0.5,
    spatialZ: 0.5,
    compression: 0.4,
    pitchShift: 0.5,
    vocalReduction: 1,
    harmonics: 0.5,
  };

  const [effects, setEffects] = useState({
    ...defaultEffects,
  });

  const fetchConvertedFiles = useCallback(async () => {
    try {
      if (!user) {
        setError("User is not authenticated.");
        return;
      }

      // Fetch files from the 'processed' folder
      const { data, error } = await supabase.storage
        .from("lofi-tracks")
        .list("processed", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "desc" },
        });

      if (error) {
        console.error("Supabase Storage query error:", error);
        setError("Failed to fetch converted files.");
        return;
      }

      if (!data || data.length === 0) {
        console.log("No converted files found in the processed folder.");
        setConvertedFiles([]);
        return;
      }

      // Generate public URLs for each file
      const files: ConvertedFile[] = data.map((file) => ({
        id: file.id || file.name,
        originalName: file.name.split("/").pop() || "Unknown",
        convertedUrl:
          supabase.storage
            .from("lofi-tracks")
            .getPublicUrl(`processed/${file.name}`).data?.publicUrl || "",
        createdAt: new Date(file.updated_at || file.created_at || Date.now()),
      }));

      setConvertedFiles(files);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch converted files.");
    }
  }, [user]);

  // Fetch files on component mount
  useEffect(() => {
    fetchConvertedFiles();
  }, [fetchConvertedFiles]);

  const handleReset = useCallback(() => {
    setEffects(defaultEffects);
    processorRef.current?.setEffects(defaultEffects);
  }, []);

  const handleFileChange = useCallback(
    async (file: File) => {
      try {
        if (!file.type.startsWith("audio/")) {
          throw new Error("Please upload an audio file");
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          throw new Error("File size must be less than 50MB");
        }

        setIsProcessing(true);
        setIsUploading(true);
        // Upload to Supabase storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lofi-tracks")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("lofi-tracks").getPublicUrl(fileName);

        // Download the file to process locally
        const response = await fetch(publicUrl);
        const fileBlob = await response.blob();
        const localFile = new File([fileBlob], file.name, { type: file.type });

        setFile(localFile);
        processorRef.current = new LoFiProcessor();
        await processorRef.current.loadFile(localFile);
        processorRef.current.setEffects(effects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading file");
      } finally {
        setIsProcessing(false);
        setIsUploading(false);
      }
    },
    [effects, user]
  );

  const convertToMp3 = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
    });

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    return new Promise((resolve) => {
      const mediaRecorder = new MediaRecorder(new MediaStream());
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        resolve(blob);
      };

      const channel = renderedBuffer.getChannelData(0);
      const audioData = new Float32Array(channel);
      const wavBuffer = createWavBuffer(audioData, renderedBuffer.sampleRate);
      mediaRecorder.start();
      mediaRecorder.stop();
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange]
  );

  const handleEffectChange = useCallback(
    (key: keyof typeof effects, value: number) => {
      setEffects((prev) => {
        const newEffects = { ...prev, [key]: value };
        processorRef.current?.setEffects(newEffects);
        return newEffects;
      });
    },
    []
  );

  const togglePlayback = useCallback(() => {
    if (!processorRef.current) return;

    if (isPlaying) {
      processorRef.current.stop();
    } else {
      processorRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleExport = useCallback(async () => {
    if (!processorRef.current || !file || !user) return;

    const originalFileName = file.name;
    const fileNameWithoutExt = originalFileName.substring(
      0,
      originalFileName.lastIndexOf(".")
    );

    try {
      setIsGenerating(true);

      // Get the Blob from the processor
      const processedBlob = await processorRef.current.exportLoFi();

      // Create a temporary URL for the Blob
      const blobUrl = URL.createObjectURL(processedBlob);

      // Create a download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `lofi-${fileNameWithoutExt}.mp3`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Optionally: Store the file in Supabase storage for future access
      const fileName = `processed/${Date.now()}-lofi-${fileNameWithoutExt}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from("lofi-tracks")
        .upload(fileName, processedBlob, { contentType: "audio/mp3" });

      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        setError("Failed to save the processed file.");
        return;
      }

      // Fetch the updated list of converted files
      await fetchConvertedFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exporting file");
    } finally {
      setIsGenerating(false);
    }
  }, [file, user, fetchConvertedFiles]);

  return (
    <div className="min-h-screen bg-[#FDF7F4] text-[#685752]">
      {/* Navigation Bar */}
      <nav className="bg-[#FDF7F4]/80 backdrop-blur-sm border-b border-[#997C70]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="flex items-center space-x-2 text-[#8EB486] hover:text-[#997C70] transition-colors"
            >
              <Music className="w-6 h-6" />
              <span className="text-xl font-bold">LOFIGEN</span>
            </a>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white font-medium rounded-md transition-colors shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-[#8EB486]">
          Create Your Lo-Fi Track
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg border border-[#997C70]/20">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-[#8EB486] mr-2" />
            <h2 className="text-xl font-semibold">Upload Audio</h2>
          </div>
          <div
            className="border-2 border-dashed border-[#8EB486] rounded-lg p-8 text-center"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#8EB486] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#997C70]">Uploading audio file...</p>
              </div>
            ) : (
              <>
                <p className="text-[#997C70] mb-4">
                  Drag and drop your audio file here, or click to browse
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-input"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileChange(e.target.files[0])
                  }
                />
                <label
                  htmlFor="audio-input"
                  className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md transition-colors cursor-pointer inline-block shadow-md"
                >
                  Choose File
                </label>
              </>
            )}
          </div>

          {file && (
            <div className="mt-6">
              <WaveformVisualizer
                audioFile={file}
                height={80}
                waveColor="#8EB486"
                progressColor="#997C70"
              />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={togglePlayback}
                  className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md transition-colors mr-4 shadow-md"
                >
                  {isPlaying ? "Stop" : "Play"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#997C70] hover:bg-[#8EB486] text-white text-sm rounded-md transition-colors shadow-md flex items-center gap-2"
          >
            Reset to Default
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
            <div className="flex items-center mb-4">
              <Music2 className="w-6 h-6 text-[#8EB486] mr-2" />
              <h2 className="text-xl font-semibold">Lo-Fi Effects</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vinyl Crackle: {Math.round(effects.vinylCrackle * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.vinylCrackle]}
                  onValueChange={([value]) =>
                    handleEffectChange("vinylCrackle", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tape Hiss: {Math.round(effects.tapeHiss * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.tapeHiss]}
                  onValueChange={([value]) =>
                    handleEffectChange("tapeHiss", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bit Crush: {Math.round(effects.bitCrush * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.bitCrush]}
                  onValueChange={([value]) =>
                    handleEffectChange("bitCrush", value)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
            <div className="flex items-center mb-4">
              <Settings2 className="w-6 h-6 text-[#8EB486] mr-2" />
              <h2 className="text-xl font-semibold">Sound Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reverb: {Math.round(effects.reverb * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.reverb]}
                  onValueChange={([value]) =>
                    handleEffectChange("reverb", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Low Pass Filter: {Math.round(effects.lowPass * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.lowPass]}
                  onValueChange={([value]) =>
                    handleEffectChange("lowPass", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tempo: {Math.round(effects.tempo * 100)}%
                </label>
                <Slider
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  value={[effects.tempo]}
                  onValueChange={([value]) =>
                    handleEffectChange("tempo", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Music Reduction:{" "}
                  {Math.round(effects.backgroundReduction * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.backgroundReduction]}
                  onValueChange={([value]) =>
                    handleEffectChange("backgroundReduction", value)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Audio Processing */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
          <div className="flex items-center mb-4">
            <Settings2 className="w-6 h-6 text-[#8EB486] mr-2" />
            <h2 className="text-xl font-semibold">Advanced Audio Processing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spatial Audio Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Spatial Audio</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Left/Right: {Math.round((effects.spatialX - 0.5) * 200)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.spatialX]}
                  onValueChange={([value]) =>
                    handleEffectChange("spatialX", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Up/Down: {Math.round((effects.spatialY - 0.5) * 200)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.spatialY]}
                  onValueChange={([value]) =>
                    handleEffectChange("spatialY", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Front/Back: {Math.round((effects.spatialZ - 0.5) * 200)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.spatialZ]}
                  onValueChange={([value]) =>
                    handleEffectChange("spatialZ", value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dynamic Compression: {Math.round(effects.compression * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.compression]}
                  onValueChange={([value]) =>
                    handleEffectChange("compression", value)
                  }
                  className="w-full"
                />
                <p className="text-xs text-[#997C70] mt-1">
                  Controls the dynamic range of the audio
                </p>
              </div>
            </div>

            {/* Additional Processing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Sound Processing</h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pitch Shift: {Math.round((effects.pitchShift - 0.5) * 24)}{" "}
                  semitones
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.pitchShift]}
                  onValueChange={([value]) =>
                    handleEffectChange("pitchShift", value)
                  }
                  className="w-full"
                />
                <p className="text-xs text-[#997C70] mt-1">
                  Shift the pitch up or down by up to 12 semitones
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vocal Reduction: {Math.round(effects.vocalReduction * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.vocalReduction]}
                  onValueChange={([value]) =>
                    handleEffectChange("vocalReduction", value)
                  }
                  className="w-full"
                />
              </div>

              {/* Harmonics */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Harmonics: {Math.round(effects.harmonics * 100)}%
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effects.harmonics]}
                  onValueChange={([value]) =>
                    handleEffectChange("harmonics", value)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExport}
            disabled={isGenerating || !file}
            className="px-6 py-3 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Generate Lo-Fi</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-8">
        {/* Converted Files Section */}
        {convertedFiles.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Your Converted Files</h2>
            <ul>
              {convertedFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-[#997C70]/20"
                >
                  <div>
                    <p className="text-[#685752] font-medium">
                      {file.originalName}
                    </p>
                    <p className="text-sm text-[#685752]/70">
                      {file.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={file.convertedUrl}
                    download
                    className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
function createWavBuffer(audioData: Float32Array, sampleRate: number): Buffer {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + audioData.length * bytesPerSample);
  const view = new DataView(buffer);

  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + audioData.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");

  // "fmt " sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, 1, true); // number of channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // "data" sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, audioData.length * bytesPerSample, true);

  // Write audio data
  const offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset + i * bytesPerSample, sample * 0x7fff, true);
  }

  return Buffer.from(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
