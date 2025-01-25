import React from "react";
import { Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface LoFiEffectsPanelProps {
  vinylCrackle: number;
  tapeHiss: number;
  bitCrush: number;
  onChange: (
    key: "vinylCrackle" | "tapeHiss" | "bitCrush",
    value: number
  ) => void;
}

export const LoFiEffectsPanel: React.FC<LoFiEffectsPanelProps> = ({
  vinylCrackle,
  tapeHiss,
  bitCrush,
  onChange,
}) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-[#997C70]/20">
      <div className="flex items-center mb-4">
        <Music2 className="w-6 h-6 text-[#8EB486] mr-2" />
        <h2 className="text-xl font-semibold">Lo-Fi Effects</h2>
      </div>
      <div className="space-y-4">
        {/* Vinyl Crackle */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Vinyl Crackle: {Math.round(vinylCrackle * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[vinylCrackle]}
            onValueChange={([val]) => onChange("vinylCrackle", val)}
          />
        </div>

        {/* Tape Hiss */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tape Hiss: {Math.round(tapeHiss * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[tapeHiss]}
            onValueChange={([val]) => onChange("tapeHiss", val)}
          />
        </div>

        {/* Bit Crush */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Bit Crush: {Math.round(bitCrush * 100)}%
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[bitCrush]}
            onValueChange={([val]) => onChange("bitCrush", val)}
          />
        </div>
      </div>
    </div>
  );
};
