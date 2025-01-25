import React from "react";
import { Music } from "lucide-react";
import { useLoFiCreation } from "@/hooks/useLoFiCreation";
import { useAuth } from "@/components/auth/auth-provider";

import { AudioUpload } from "@/components/audio/AudioUpload";
import { LoFiEffectsPanel } from "@/components/audio/LoFiEffectsPanel";
import { SoundSettingsPanel } from "@/components/audio/SoundSettingsPanel";
import { AdvancedAudioPanel } from "@/components/audio/AdvancedAudioPanel";
import { WaveformVisualizer } from "@/components/audio/waveform-visualizer";
import { ConvertedFilesList } from "@/components/audio/ConvertedFilesList";

export const CreatePage: React.FC = () => {
  const { signOut } = useAuth();
  const {
    file,
    error,
    effects,
    isUploading,
    isPlaying,
    isGenerating,
    convertedFiles,
    handleFileChange,
    handleEffectChange,
    handleReset,
    handleExport,
    togglePlayback,
  } = useLoFiCreation();

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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <AudioUpload
          isUploading={isUploading}
          onFileChange={handleFileChange}
        />

        {/* Waveform & Playback */}
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

        {/* Reset Button */}
        <div className="mb-4 flex justify-end mt-6">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#997C70] hover:bg-[#8EB486] 
              text-white text-sm rounded-md transition-colors shadow-md flex items-center gap-2"
          >
            Reset to Default
          </button>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoFiEffectsPanel
            vinylCrackle={effects.vinylCrackle}
            tapeHiss={effects.tapeHiss}
            bitCrush={effects.bitCrush}
            onChange={(key, value) => handleEffectChange(key, value)}
          />

          <SoundSettingsPanel
            reverb={effects.reverb}
            lowPass={effects.lowPass}
            tempo={effects.tempo}
            backgroundReduction={effects.backgroundReduction}
            onChange={(key, value) => handleEffectChange(key, value)}
          />
        </div>

        <div className="mt-8">
          <AdvancedAudioPanel
            spatialX={effects.spatialX}
            spatialY={effects.spatialY}
            spatialZ={effects.spatialZ}
            compression={effects.compression}
            pitchShift={effects.pitchShift}
            vocalReduction={effects.vocalReduction}
            harmonics={effects.harmonics}
            onChange={(key, value) => handleEffectChange(key, value)}
          />
        </div>

        {/* Generate Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExport}
            disabled={isGenerating || !file}
            className="px-6 py-3 bg-[#8EB486] hover:bg-[#997C70] 
              text-white rounded-md transition-colors disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Generate Lo-Fi</span>
            )}
          </button>
        </div>

        {/* Converted Files List */}
        <ConvertedFilesList files={convertedFiles} />
      </div>
    </div>
  );
};
