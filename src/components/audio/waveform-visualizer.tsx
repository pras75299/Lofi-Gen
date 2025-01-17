import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformVisualizerProps {
  audioFile: File;
  onReady?: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioFile,
  onReady,
  height = 100,
  waveColor = "#5D8736",
  progressColor = "#4A6C2B",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor,
      progressColor,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && wavesurfer.current) {
        await wavesurfer.current.loadBlob(audioFile);
        onReady?.();
      }
    };
    reader.readAsArrayBuffer(audioFile);

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioFile, height, waveColor, progressColor, onReady]);

  return <div ref={containerRef} />;
};
