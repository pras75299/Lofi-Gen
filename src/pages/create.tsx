import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Music2, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WaveformVisualizer } from "@/components/audio/waveform-visualizer";
import { LoFiProcessor } from "@/lib/audio-processor";
import { db } from "@/db";
import { tracks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { supabase } from "@/lib/supabase";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/components/auth/auth-provider";
import { Layout } from "@/components/layout/Layout";

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  createdAt: Date;
}

export const CreatePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  const [file, setFile] = useState<File | null>(null);
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
      if (!user) return;

      const results = await db
        .select()
        .from(tracks)
        .where(eq(tracks.userId, user.id))
        .orderBy(desc(tracks.createdAt));

      setConvertedFiles(results.map(track => ({
        id: track.id,
        originalName: track.originalName,
        convertedUrl: track.storageUrl,
        createdAt: track.createdAt,
      })));
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

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error("File size must be less than 10MB");
        }

        setIsGenerating(true);
        setIsUploading(true);
        // Upload to Supabase storage
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
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
        setIsGenerating(false);
        setIsUploading(false);
      }
    },
    [effects, user]
  );


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

      // Get the Blob from the processor (WAV format)
      const processedBlob = await processorRef.current.exportLoFi();

      // Create a temporary URL for the Blob
      const blobUrl = URL.createObjectURL(processedBlob);

      // Create a download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `lofi-${fileNameWithoutExt}.wav`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Optionally: Store the file in Supabase storage for future access
      const fileName = `processed/${Date.now()}-lofi-${fileNameWithoutExt}.wav`;
      const { error: uploadError } = await supabase.storage
        .from("lofi-tracks")
        .upload(fileName, processedBlob, { contentType: "audio/wav" });

      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        setError("Failed to save the processed file.");
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("lofi-tracks")
        .getPublicUrl(fileName);

      // Update the database with the new track
      await db.insert(tracks).values({
        userId: user.id,
        originalName: originalFileName,
        fileName: fileName,
        storageUrl: publicUrl,
        effects: JSON.stringify(effects),
      });

      // Fetch the updated list of converted files
      await fetchConvertedFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exporting file");
    } finally {
      setIsGenerating(false);
    }
  }, [file, user, fetchConvertedFiles]);

  return (
    <Layout>
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
                <p className="text-sm text-[#997C70]/70 mb-4">
                  Supported formats: MP3, WAV, OGG, AAC, MP4 (max 10MB)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("vinylCrackle", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("tapeHiss", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("bitCrush", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("reverb", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("lowPass", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("tempo", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("backgroundReduction", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("spatialX", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("spatialY", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("spatialZ", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("compression", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("pitchShift", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("vocalReduction", val)
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
                  onValueChange={([val]: number[]) =>
                    handleEffectChange("harmonics", val)
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
    </Layout>
  );
};
