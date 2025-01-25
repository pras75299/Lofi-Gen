import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { LoFiProcessor } from "@/lib/audio-processor";
import { useAuth } from "@/components/auth/auth-provider";

interface EffectsState {
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
}

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  createdAt: Date;
}

const DEFAULT_EFFECTS: EffectsState = {
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

export function useLoFiCreation() {
  const { user } = useAuth();
  const processorRef = useRef<LoFiProcessor | null>(null);

  // States
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [effects, setEffects] = useState<EffectsState>(DEFAULT_EFFECTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  // Fetch existing converted files from Supabase
  const fetchConvertedFiles = useCallback(async () => {
    if (!user) {
      setError("User is not authenticated.");
      return;
    }
    try {
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

      if (!data) {
        setConvertedFiles([]);
        return;
      }

      // Generate public URLs
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

  useEffect(() => {
    fetchConvertedFiles();
  }, [fetchConvertedFiles]);

  // Handle file drop or file input change
  const handleFileChange = useCallback(
    async (newFile: File) => {
      try {
        if (!newFile.type.startsWith("audio/")) {
          throw new Error("Please upload an audio file.");
        }
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (newFile.size > maxSize) {
          throw new Error("File size must be less than 50MB.");
        }
        setIsProcessing(true);
        setIsUploading(true);

        // Upload to Supabase
        const fileName = `${Date.now()}-${newFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("lofi-tracks")
          .upload(fileName, newFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL -> fetch back to local for processing
        const {
          data: { publicUrl },
        } = supabase.storage.from("lofi-tracks").getPublicUrl(fileName);

        const response = await fetch(publicUrl);
        const fileBlob = await response.blob();
        const localFile = new File([fileBlob], newFile.name, {
          type: newFile.type,
        });

        setFile(localFile);

        // Initialize processor
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
    [effects]
  );

  // Handle effect changes
  const handleEffectChange = useCallback(
    (key: keyof EffectsState, value: number) => {
      setEffects((prev) => {
        const updated = { ...prev, [key]: value };
        processorRef.current?.setEffects(updated);
        return updated;
      });
    },
    []
  );

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (!processorRef.current) return;
    if (isPlaying) {
      processorRef.current.stop();
    } else {
      processorRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Reset all effects
  const handleReset = useCallback(() => {
    setEffects(DEFAULT_EFFECTS);
    processorRef.current?.setEffects(DEFAULT_EFFECTS);
  }, []);

  // Export Lo-Fi track
  const handleExport = useCallback(async () => {
    if (!processorRef.current || !file || !user) return;
    setIsGenerating(true);

    try {
      const originalFileName = file.name;
      const fileNameWithoutExt = originalFileName.substring(
        0,
        originalFileName.lastIndexOf(".")
      );
      const processedBlob = await processorRef.current.exportLoFi();

      // Download locally
      const blobUrl = URL.createObjectURL(processedBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `lofi-${fileNameWithoutExt}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // (Optional) Upload the processed file to Supabase
      const processedFileName = `processed/${Date.now()}-lofi-${fileNameWithoutExt}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from("lofi-tracks")
        .upload(processedFileName, processedBlob, {
          contentType: "audio/mp3",
        });
      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        setError("Failed to save the processed file.");
        return;
      }

      // Update the list
      await fetchConvertedFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exporting file");
    } finally {
      setIsGenerating(false);
    }
  }, [file, user, fetchConvertedFiles]);

  return {
    file,
    error,
    effects,
    isProcessing,
    isUploading,
    isGenerating,
    isPlaying,
    convertedFiles,
    handleFileChange,
    handleEffectChange,
    handleReset,
    handleExport,
    togglePlayback,
  };
}
