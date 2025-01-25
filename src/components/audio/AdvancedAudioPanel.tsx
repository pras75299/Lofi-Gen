import React from "react";
import { Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AdvancedAudioPanelProps {
  spatialX: number;
  spatialY: number;
  spatialZ: number;
  compression: number;
  pitchShift: number;
  vocalReduction: number;
  harmonics: number;
  onChange: (
    key:
      | "spatialX"
      | "spatialY"
      | "spatialZ"
      | "compression"
      | "pitchShift"
      | "vocalReduction"
      | "harmonics",
    value: number
  ) => void;
}

export const AdvancedAudioPanel: React.FC<AdvancedAudioPanelProps> = ({
  spatialX,
  spatialY,
  spatialZ,
  compression,
  pitchShift,
  vocalReduction,
  harmonics,
  onChange,
}) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
      <div className="flex items-center mb-4">
        <Settings2 className="w-6 h-6 text-[#8EB486] mr-2" />
        <h2 className="text-xl font-semibold">Advanced Audio Processing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spatial Audio */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Spatial Audio</h3>
          {/* Left/Right */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Left/Right: {Math.round((spatialX - 0.5) * 200)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[spatialX]}
              onValueChange={([val]) => onChange("spatialX", val)}
            />
          </div>

          {/* Up/Down */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Up/Down: {Math.round((spatialY - 0.5) * 200)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[spatialY]}
              onValueChange={([val]) => onChange("spatialY", val)}
            />
          </div>

          {/* Front/Back */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Front/Back: {Math.round((spatialZ - 0.5) * 200)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[spatialZ]}
              onValueChange={([val]) => onChange("spatialZ", val)}
            />
          </div>

          {/* Compression */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dynamic Compression: {Math.round(compression * 100)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[compression]}
              onValueChange={([val]) => onChange("compression", val)}
            />
            <p className="text-xs text-[#997C70] mt-1">
              Controls the dynamic range of the audio
            </p>
          </div>
        </div>

        {/* Additional Processing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Sound Processing</h3>
          {/* Pitch Shift */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pitch Shift: {Math.round((pitchShift - 0.5) * 24)} semitones
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[pitchShift]}
              onValueChange={([val]) => onChange("pitchShift", val)}
            />
            <p className="text-xs text-[#997C70] mt-1">
              Shift the pitch up/down by ~12 semitones
            </p>
          </div>

          {/* Vocal Reduction */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Vocal Reduction: {Math.round(vocalReduction * 100)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[vocalReduction]}
              onValueChange={([val]) => onChange("vocalReduction", val)}
            />
          </div>

          {/* Harmonics */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Harmonics: {Math.round(harmonics * 100)}%
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[harmonics]}
              onValueChange={([val]) => onChange("harmonics", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
