import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Play,
  Square,
  RotateCcw,
  Download,
  Disc3,
  AudioWaveform,
  Sparkles,
  Sliders,
  Loader2,
  FileAudio,
  CassetteTape,
} from "lucide-react";
import { WaveformVisualizer } from "@/components/audio/waveform-visualizer";
import { LoFiProcessor, type Effects } from "@/lib/audio-processor";
import { listTracks, saveTrack } from "@/lib/local-library";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TextSwap } from "@/components/ui/text-swap";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  createdAt: Date;
}

const DEFAULT_EFFECTS: Effects = {
  vinylCrackle: 1,
  tapeHiss: 1,
  bitCrush: 1,
  reverb: 1,
  lowPass: 0.7,
  tempo: 1.0,
  backgroundReduction: 1,
  stereoWidth: 0.5,
  wowFlutter: 0,
  compression: 0.4,
  pitchShift: 0.5,
  vocalReduction: 1,
  harmonics: 0.5,
};

const PRESETS: Record<string, { label: string; spec: string; effects: Partial<Effects> }> = {
  default: { label: "Studio default", spec: "neutral", effects: DEFAULT_EFFECTS },
  cafe: {
    label: "CassetteTape Café",
    spec: "warm · slow",
    effects: { vinylCrackle: 0.6, tapeHiss: 0.7, lowPass: 0.55, tempo: 0.92, reverb: 0.45, harmonics: 0.6 },
  },
  bedroom: {
    label: "Late Bedroom",
    spec: "soft · 70bpm",
    effects: { vinylCrackle: 0.4, tapeHiss: 0.55, lowPass: 0.5, tempo: 0.85, reverb: 0.65, vocalReduction: 0.3 },
  },
  rewind: {
    label: "Tape Rewind",
    spec: "wow & flutter",
    effects: { vinylCrackle: 0.8, tapeHiss: 0.85, bitCrush: 0.55, lowPass: 0.65, tempo: 0.95, harmonics: 0.7 },
  },
  rain: {
    label: "Rainy Window",
    spec: "low-pass dream",
    effects: { vinylCrackle: 0.5, lowPass: 0.4, reverb: 0.75, tempo: 0.88, harmonics: 0.45 },
  },
  amRadio: {
    label: "AM Radio",
    spec: "lo-bit · narrowcast",
    effects: { vinylCrackle: 0.7, tapeHiss: 0.85, bitCrush: 0.65, lowPass: 0.3, harmonics: 0.6, stereoWidth: 0.15, reverb: 0.25 },
  },
  vhs: {
    label: "VHS Hiss",
    spec: "warbled tape",
    effects: { vinylCrackle: 0.55, tapeHiss: 0.9, bitCrush: 0.3, lowPass: 0.55, tempo: 0.97, wowFlutter: 0.7, reverb: 0.4, harmonics: 0.55 },
  },
  underwater: {
    label: "Underwater",
    spec: "submerged · slow",
    effects: { vinylCrackle: 0.3, tapeHiss: 0.4, lowPass: 0.25, tempo: 0.82, reverb: 0.85, wowFlutter: 0.35, harmonics: 0.4, stereoWidth: 0.7 },
  },
  boombox: {
    label: "Boombox",
    spec: "mono-leaning · warm",
    effects: { vinylCrackle: 0.5, tapeHiss: 0.6, bitCrush: 0.45, lowPass: 0.5, tempo: 0.96, stereoWidth: 0.15, harmonics: 0.65, compression: 0.6 },
  },
};

export const CreatePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [activePreset, setActivePreset] = useState<string>("default");
  const [effects, setEffects] = useState<Effects>(DEFAULT_EFFECTS);

  const processorRef = useRef<LoFiProcessor | null>(null);
  const filesRef = useRef<ConvertedFile[]>([]);
  filesRef.current = convertedFiles;
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    return () => {
      processorRef.current?.dispose();
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.convertedUrl));
    };
  }, []);

  const fetchConvertedFiles = useCallback(async () => {
    try {
      const tracks = await listTracks();
      setConvertedFiles((prev) => {
        prev.forEach((f) => URL.revokeObjectURL(f.convertedUrl));
        return tracks.map((t) => ({
          id: t.id,
          originalName: t.originalName,
          convertedUrl: URL.createObjectURL(t.blob),
          createdAt: new Date(t.createdAt),
        }));
      });
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch your library.");
    }
  }, []);

  useEffect(() => {
    fetchConvertedFiles();
  }, [fetchConvertedFiles]);

  const handleEffectChange = useCallback(
    (key: keyof Effects, value: number) => {
      setEffects((prev) => {
        const next = { ...prev, [key]: value };
        processorRef.current?.setEffects(next);
        return next;
      });
      setActivePreset("custom");
    },
    []
  );

  const applyPreset = useCallback((key: string) => {
    if (!PRESETS[key]) return;
    const next = { ...DEFAULT_EFFECTS, ...PRESETS[key].effects };
    setEffects(next);
    processorRef.current?.setEffects(next);
    setActivePreset(key);
  }, []);

  const handleReset = useCallback(() => applyPreset("default"), [applyPreset]);

  const handleFileChange = useCallback(
    async (f: File) => {
      try {
        if (!f.type.startsWith("audio/")) throw new Error("Please drop an audio file.");
        const maxSize = 10 * 1024 * 1024;
        if (f.size > maxSize) throw new Error("File must be under 10 MB.");

        setIsLoading(true);
        setError(null);
        setFile(f);
        processorRef.current = new LoFiProcessor();
        await processorRef.current.loadFile(f);
        processorRef.current.setEffects(effects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load file.");
        setFile(null);
      } finally {
        setIsLoading(false);
      }
    },
    [effects]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      dragCounter.current = 0;
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileChange(dropped);
    },
    [handleFileChange]
  );

  const togglePlayback = useCallback(() => {
    if (!processorRef.current) return;
    if (isPlaying) processorRef.current.stop();
    else processorRef.current.play();
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const handleExport = useCallback(async () => {
    if (!processorRef.current || !file) return;
    const original = file.name;
    const stem = original.substring(0, original.lastIndexOf(".")) || original;
    const fileName = `lofi-${stem}.wav`;

    try {
      setIsExporting(true);
      const blob = await processorRef.current.exportLoFi();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      try {
        await saveTrack({
          originalName: original,
          fileName,
          blob,
          effects: JSON.stringify(effects),
        });
      } catch (err) {
        console.error(err);
        setError("Downloaded — could not add to your library.");
        return;
      }

      await fetchConvertedFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }, [file, effects, fetchConvertedFiles]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current <= 0) setIsDragOver(false);
  }, []);

  return (
    <Layout bareFooter>
      <div className="mx-auto max-w-7xl px-4 md:px-8 pb-32 pt-6">
        <Header preset={activePreset} />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="alert"
              className="mt-4 rounded-lg border border-sienna/40 bg-sienna/5 px-4 py-3 text-sm text-sienna flex items-center justify-between"
            >
              {error}
              <button onClick={() => setError(null)} className="text-sienna/70 hover:text-sienna text-xs uppercase tracking-wider">
                dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload zone — swap with smooth crossfade + slight slide */}
        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                <Dropzone
                  isDragOver={isDragOver}
                  isLoading={isLoading}
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onFile={handleFileChange}
                />
              </motion.div>
            ) : (
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                <TrackHeader
                  file={file}
                  isPlaying={isPlaying}
                  onToggle={togglePlayback}
                  onReplace={() => setFile(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Studio surface */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left rail: presets */}
          <aside className="lg:col-span-3">
            <Section icon={Disc3} label="Presets">
              <div className="space-y-1.5">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <PresetButton
                    key={key}
                    active={activePreset === key}
                    label={preset.label}
                    spec={preset.spec}
                    onClick={() => applyPreset(key)}
                  />
                ))}
                {activePreset === "custom" && (
                  <PresetButton active={true} label="Custom" spec="your tweaks" onClick={() => {}} />
                )}
              </div>
            </Section>

            {/* Library */}
            {convertedFiles.length > 0 && (
              <div className="mt-5">
                <Section icon={CassetteTape} label="Library">
                  <ul className="space-y-1.5 -mx-1.5">
                    {convertedFiles.slice(0, 8).map((f) => (
                      <li key={f.id}>
                        <a
                          href={f.convertedUrl}
                          download
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-cream transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-ink">{f.originalName}</div>
                            <div className="spec text-[10px]">{new Date(f.createdAt).toLocaleDateString()}</div>
                          </div>
                          <Download className="h-3.5 w-3.5 text-ink-mute group-hover:text-ink transition-colors" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            )}
          </aside>

          {/* Main controls */}
          <main className="lg:col-span-9 space-y-5">
            {/* Waveform */}
            {file && (
              <Section icon={AudioWaveform} label="Waveform">
                <WaveformVisualizer audioFile={file} height={88} waveColor="#7A6F63" progressColor="#C8624A" />
              </Section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Section icon={Disc3} label="Tape & Vinyl">
                <KnobSlider label="Vinyl crackle" unit="%" value={effects.vinylCrackle} onChange={(v) => handleEffectChange("vinylCrackle", v)} />
                <KnobSlider label="Tape hiss" unit="%" value={effects.tapeHiss} onChange={(v) => handleEffectChange("tapeHiss", v)} />
                <KnobSlider label="Bit crush" unit="%" value={effects.bitCrush} onChange={(v) => handleEffectChange("bitCrush", v)} />
              </Section>

              <Section icon={Sliders} label="Tone & Time">
                <KnobSlider label="Reverb tail" unit="%" value={effects.reverb} onChange={(v) => handleEffectChange("reverb", v)} />
                <KnobSlider label="Low-pass" unit="%" value={effects.lowPass} onChange={(v) => handleEffectChange("lowPass", v)} />
                <KnobSlider
                  label="Tempo"
                  format={(v) => `${Math.round(v * 100)}%`}
                  value={effects.tempo}
                  min={0.5}
                  max={1.5}
                  onChange={(v) => handleEffectChange("tempo", v)}
                />
                <KnobSlider label="Background reduction" unit="%" value={effects.backgroundReduction} onChange={(v) => handleEffectChange("backgroundReduction", v)} />
              </Section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Section icon={Sparkles} label="Stereo & Motion">
                <KnobSlider label="Stereo width" unit="%" value={effects.stereoWidth} onChange={(v) => handleEffectChange("stereoWidth", v)} />
                <KnobSlider label="Wow & flutter" unit="%" value={effects.wowFlutter} onChange={(v) => handleEffectChange("wowFlutter", v)} />
                <KnobSlider label="Compression" unit="%" value={effects.compression} onChange={(v) => handleEffectChange("compression", v)} />
              </Section>

              <Section icon={Sliders} label="Voice & Warmth">
                <KnobSlider
                  label="Pitch shift"
                  format={(v) => `${Math.round((v - 0.5) * 24)} st`}
                  value={effects.pitchShift}
                  onChange={(v) => handleEffectChange("pitchShift", v)}
                />
                <KnobSlider label="Vocal reduction" unit="%" value={effects.vocalReduction} onChange={(v) => handleEffectChange("vocalReduction", v)} />
                <KnobSlider label="Warmth" unit="%" value={effects.harmonics} onChange={(v) => handleEffectChange("harmonics", v)} />
              </Section>
            </div>
          </main>
        </div>
      </div>

      {/* Sticky bottom bar — slides up only when a track is loaded */}
      <AnimatePresence>
        {file && (
          <ActionBar
            isExporting={isExporting}
            onReset={handleReset}
            onExport={handleExport}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

/* ──────────────── Sub components ──────────────── */

const Header = ({ preset }: { preset: string }) => (
  <div className="flex items-end justify-between border-b border-line pb-5">
    <div>
      <span className="spec">§ Studio</span>
      <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.02em]"
          style={{ fontVariationSettings: '"SOFT" 100, "wght" 400' }}>
        Make it <span className="italic text-sienna">sound found.</span>
      </h1>
    </div>
    <div className="hidden sm:flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse-soft" />
      <TextSwap
        className="spec"
        value={preset === "custom" ? "custom mix" : (PRESETS[preset]?.label.toLowerCase() ?? "")}
      />
    </div>
  </div>
);

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  isDragOver: boolean;
  isLoading: boolean;
  onFile: (f: File) => void;
}

const Dropzone = ({ isDragOver, isLoading, onFile, ...rest }: DropzoneProps) => (
  <div
    {...rest}
    className={cn(
      "relative rounded-2xl border border-dashed bg-cream/40",
      "transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out-soft",
      isDragOver
        ? "border-sienna bg-sienna/5 scale-[1.005] shadow-lift"
        : "border-line hover:border-ink-mute"
    )}
  >
    <label htmlFor="audio-input" className="block cursor-pointer p-10 md:p-14 text-center">
      <input
        type="file"
        accept="audio/*"
        className="sr-only"
        id="audio-input"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <div
        className={cn(
          "mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-paper",
          "transition-transform duration-300 ease-out-soft",
          isDragOver && "animate-pulse-ring scale-110",
        )}
      >
        <span className="t-icon-swap" data-state={isLoading ? "b" : "a"}>
          <span className="t-icon" data-icon="a">
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="t-icon" data-icon="b">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
        </span>
      </div>

      <p className="mt-6 font-display text-2xl text-ink" style={{ fontVariationSettings: '"SOFT" 100, "wght" 500' }}>
        {isDragOver ? "Drop it." : "Drop a track here"}
      </p>
      <p className="mt-2 text-sm text-ink-soft">or click to browse · MP3, WAV, OGG, AAC, M4A · max 10 MB</p>
      <p className="spec mt-6">Stems stay on your laptop</p>
    </label>
  </div>
);

interface TrackHeaderProps {
  file: File;
  isPlaying: boolean;
  onToggle: () => void;
  onReplace: () => void;
}

const TrackHeader = ({ file, isPlaying, onToggle, onReplace }: TrackHeaderProps) => {
  const sizeKb = useMemo(() => (file.size / 1024).toFixed(0), [file]);
  return (
    <div className="rounded-2xl border border-line bg-cream/60 p-5 flex flex-wrap items-center gap-4">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper shrink-0">
        <FileAudio className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-lg text-ink leading-tight" style={{ fontVariationSettings: '"SOFT" 80, "wght" 500' }}>
          {file.name}
        </div>
        <div className="spec mt-0.5">{sizeKb} KB · {file.type.replace("audio/", "")}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={onToggle}
          iconLeft={
            <span className="t-icon-swap h-3.5 w-3.5 place-items-center" data-state={isPlaying ? "b" : "a"}>
              <span className="t-icon flex items-center justify-center" data-icon="a">
                <Play className="h-3 w-3 fill-current" />
              </span>
              <span className="t-icon flex items-center justify-center" data-icon="b">
                <Square className="h-3 w-3 fill-current" />
              </span>
            </span>
          }
        >
          <PreviewLabel isPlaying={isPlaying} />
        </Button>
        <Button variant="ghost" size="md" onClick={onReplace}>
          Replace
        </Button>
      </div>
    </div>
  );
};

const PreviewLabel = ({ isPlaying }: { isPlaying: boolean }) => (
  <TextSwap value={isPlaying ? "Stop" : "Preview"} />
);

const Section = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-line bg-cream/40 p-5">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line/70">
      <Icon className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.6} />
      <span className="spec">{label}</span>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

interface PresetButtonProps {
  active: boolean;
  label: string;
  spec: string;
  onClick: () => void;
}

const PresetButton = ({ active, label, spec, onClick }: PresetButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "press group relative w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-200 cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      active ? "text-paper" : "text-ink hover:bg-cream"
    )}
  >
    {/* Layout-shared active background — slides between presets */}
    {active && (
      <motion.span
        layoutId="preset-active"
        className="absolute inset-0 rounded-lg bg-ink"
        transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
      />
    )}
    <span className="relative flex items-center gap-2">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          active ? "bg-sienna-soft animate-pulse-soft" : "bg-ink/15 group-hover:bg-ink-mute"
        )}
      />
      <span className="text-sm font-medium">{label}</span>
    </span>
    <div className={cn(
      "relative ml-3.5 text-[11px] uppercase tracking-[0.18em] mt-0.5",
      active ? "text-paper/60" : "text-ink-mute"
    )}>
      {spec}
    </div>
  </button>
);

interface KnobSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
}

const KnobSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit,
  format,
}: KnobSliderProps) => {
  const display = format ? format(value) : `${Math.round(value * 100)}${unit ?? ""}`;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-[13px] text-ink-soft">{label}</label>
        <span className="font-mono text-[11px] text-ink tabular-nums">{display}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]: number[]) => onChange(v)} />
    </div>
  );
};

interface ActionBarProps {
  isExporting: boolean;
  onReset: () => void;
  onExport: () => void;
}

const ActionBar = ({ isExporting, onReset, onExport }: ActionBarProps) => (
  <motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
    className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/85 backdrop-blur-md"
  >
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 md:px-8 py-3">
      <span className="spec hidden sm:block">Sample-accurate · WAV 44.1 kHz</span>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="md" onClick={onReset} iconLeft={<RotateCcw className="h-3.5 w-3.5" />}>
          Reset
        </Button>
        <Button
          variant="ink"
          size="md"
          onClick={onExport}
          loading={isExporting}
          iconRight={!isExporting ? <Download className="h-3.5 w-3.5" /> : undefined}
        >
          {isExporting ? "Rendering" : "Export WAV"}
        </Button>
      </div>
    </div>
  </motion.div>
);
