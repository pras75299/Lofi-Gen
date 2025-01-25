import React from "react";
import { Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface SoundSettingsPanelProps {
  reverb: number;
  lowPass: number;
  tempo: number;
  backgroundReduction: number;
  onChange: (
    key: "reverb" | "lowPass" | "tempo" | "backgroundReduction",
    value: number
  ) => void;
}

export const SoundSettingsPanel: React.FC<SoundSettingsPanelProps> = ({
  reverb,
  lowPass,
  tempo,
  backgroundReduction,
  onChange,
}) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
      <div className="flex items-center mb-4">
        <Settings2 className="w-6 h-6 text-[#8EB486] mr-2" />
        <h2 className="text-xl font-semibold">Sound Settings</h2>
      </div>
      <div className="space-y-4">
        {/* Reverb */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reverb: {Math.round(reverb * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[reverb]}
            onValueChange={([val]) => onChange("reverb", val)}
          />
        </div>

        {/* Low Pass */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Low Pass Filter: {Math.round(lowPass * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[lowPass]}
            onValueChange={([val]) => onChange("lowPass", val)}
          />
        </div>

        {/* Tempo */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tempo: {Math.round(tempo * 100)}%
          </label>
          <Slider
            min={0.5}
            max={1.5}
            step={0.01}
            value={[tempo]}
            onValueChange={([val]) => onChange("tempo", val)}
          />
        </div>

        {/* Background Reduction */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Background Music Reduction: {Math.round(backgroundReduction * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[backgroundReduction]}
            onValueChange={([val]) => onChange("backgroundReduction", val)}
          />
        </div>
      </div>
    </div>
  );
};
