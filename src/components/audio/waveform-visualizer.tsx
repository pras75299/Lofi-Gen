import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformVisualizerProps {
  audioFile: File;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioFile,
  height = 100,
  waveColor = "#5D8736",
  progressColor = "#4A6C2B",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

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

    void (async () => {
      try {
        await wavesurfer.current?.loadBlob(audioFile);
      } catch {
        if (!cancelled) {
          wavesurfer.current?.destroy();
          wavesurfer.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
      wavesurfer.current?.destroy();
      wavesurfer.current = null;
    };
  }, [audioFile, height, waveColor, progressColor]);

  return <div ref={containerRef} />;
};
