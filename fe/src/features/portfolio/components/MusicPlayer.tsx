"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Heart, List, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";

export interface Track { id: string; title: string; artist: string; album?: string; artwork: string; duration: number; url?: string; }
export interface MusicPlayerProps { currentTrack?: Track; queue?: Track[]; currentIndex?: number; className?: string; autoPlay?: boolean; showEqualizer?: boolean; accentColor?: string; onPlayPause?: (isPlaying: boolean) => void; onTimeChange?: (time: number) => void; onTrackEnd?: () => void; onTrackChange?: (track: Track, index: number) => void; onVolumeChange?: (volume: number) => void; }

const fallbackTrack: Track = { id: "default", title: "Sample Track", artist: "Sample Artist", artwork: "", duration: 180 };
const spring = { type: "spring" as const, stiffness: 300, damping: 30 };
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const randomTrackIndex = (length: number, current: number) => { const candidates = Array.from({ length }, (_, index) => index).filter((index) => index !== current); return candidates[Math.floor(Math.random() * candidates.length)]; };

function WaveBars({ playing, color }: { playing: boolean; color: string }) { return <span className={`nyx-wave ${playing ? "is-playing" : ""}`} style={{ color }} aria-hidden="true"><i /><i /><i /><i /></span>; }

export function MusicPlayer({ currentTrack, queue = [], currentIndex = 0, className = "", autoPlay = false, showEqualizer = true, accentColor = "#222", onPlayPause, onTimeChange, onTrackEnd, onTrackChange, onVolumeChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [showQueue, setShowQueue] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const simTimeRef = useRef(0);
  const track = queue.length ? (queue[activeIndex] ?? currentTrack ?? fallbackTrack) : (currentTrack ?? fallbackTrack);
  const hasAudio = Boolean(track.url);
  const progress = useMemo(() => track.duration ? Math.min(100, currentTime / track.duration * 100) : 0, [currentTime, track.duration]);
  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    if (audioRef.current && track.url) { audioRef.current.volume = effectiveVolume / 100; audioRef.current.muted = muted; if (isPlaying) void audioRef.current.play().catch(() => setIsPlaying(false)); else audioRef.current.pause(); return; }
    if (!isPlaying) return;
    const interval = window.setInterval(() => { const next = simTimeRef.current + 1; if (next >= track.duration) { simTimeRef.current = 0; setCurrentTime(0); if (repeatMode === "one") return; setIsPlaying(false); onTrackEnd?.(); return; } simTimeRef.current = next; setCurrentTime(next); onTimeChange?.(next); }, 1000);
    return () => window.clearInterval(interval);
  }, [effectiveVolume, hasAudio, isPlaying, muted, onTimeChange, onTrackEnd, repeatMode, track.duration, track.url]);

  const togglePlay = useCallback(() => setIsPlaying((playing) => { onPlayPause?.(!playing); return !playing; }), [onPlayPause]);
  const seek = useCallback((value: number) => { const next = Math.max(0, Math.min(track.duration, value)); simTimeRef.current = next; setCurrentTime(next); if (audioRef.current && track.url) audioRef.current.currentTime = next; onTimeChange?.(next); }, [onTimeChange, track.duration, track.url]);
  const skipTrack = (direction: "next" | "prev") => { if (!queue.length) return; const next = shuffled && queue.length > 1 ? randomTrackIndex(queue.length, activeIndex) : direction === "next" ? (activeIndex + 1) % queue.length : (activeIndex + queue.length - 1) % queue.length; setActiveIndex(next); setCurrentTime(0); onTrackChange?.(queue[next], next); };

  useEffect(() => { const handleKey = (event: KeyboardEvent) => { const target = event.target; if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return; if (event.code === "Space") { event.preventDefault(); togglePlay(); } if (event.key === "ArrowLeft") seek(currentTime - 10); if (event.key === "ArrowRight") seek(currentTime + 10); if (event.key === "ArrowUp") setVolume((value) => Math.min(100, value + 10)); if (event.key === "ArrowDown") setVolume((value) => Math.max(0, value - 10)); }; window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [currentTime, seek, togglePlay]);

  const repeatLabel = repeatMode === "one" ? "Repeat one" : repeatMode === "all" ? "Repeat all" : "Repeat off";
  const control = (label: string, action: () => void, children: React.ReactNode, disabled = false) => <button type="button" className="nyx-control" onPointerDown={(event) => event.stopPropagation()} onClick={action} aria-label={label} disabled={disabled}>{children}</button>;

  return <div className={`nyx-full-player ${className}`} tabIndex={0} role="region" aria-label="Music player">
    {track.url && <audio ref={audioRef} src={track.url} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => setIsPlaying(false)} preload="metadata" />}
    <MotionConfig transition={spring}><AnimatePresence mode="popLayout" initial={false}>
      {isCollapsed ? <motion.div key="collapsed" className="nyx-collapsed" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
        <button type="button" className="nyx-collapsed-art" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsCollapsed(false)} aria-label="Expand player"><img src={track.artwork} alt={track.title} /></button>
        <button type="button" className="nyx-collapsed-info" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsCollapsed(false)} aria-label="Expand player"><b>{track.title} {isPlaying && showEqualizer && <WaveBars playing color={accentColor} />}</b><small>{track.artist}</small></button>
        <span className="nyx-mini-progress"><i style={{ width: `${progress}%` }} /></span>
        {control(isPlaying ? "Pause" : "Play", togglePlay, isPlaying ? <Pause size={14} /> : <Play size={14} />)}
        {control("Expand player", () => setIsCollapsed(false), <ChevronUp size={15} />)}
      </motion.div> : <motion.div key="expanded" className="nyx-expanded" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
        <div className="nyx-artwork-panel"><img src={track.artwork} alt={`${track.title} by ${track.artist}`} /><div className="nyx-artwork-scrim" />{control("Collapse player", () => setIsCollapsed(true), <ChevronDown size={15} />)}<button type="button" className="nyx-volume-trigger" onPointerDown={(event) => event.stopPropagation()} onClick={() => setShowVolume((visible) => !visible)} aria-label="Adjust volume">{effectiveVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>{showVolume && <div className="nyx-volume-popover"><b>{effectiveVolume}</b><input type="range" min="0" max="100" value={effectiveVolume} onChange={(event) => { const value = Number(event.target.value); setVolume(value); setMuted(value === 0); onVolumeChange?.(value); }} aria-label="Volume" />{control(muted ? "Unmute" : "Mute", () => setMuted((value) => !value), muted ? <VolumeX size={13} /> : <Volume2 size={13} />)}</div>}<div className="nyx-artwork-info"><b>{track.title} {isPlaying && showEqualizer && <WaveBars playing color={accentColor} />}</b><small>{track.album ? `${track.artist} • ${track.album}` : track.artist}</small></div></div>
        <div className="nyx-player-controls"><div className="nyx-seek" role="slider" tabIndex={0} aria-label="Seek" aria-valuemin={0} aria-valuemax={track.duration} aria-valuenow={currentTime} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); const box = event.currentTarget.getBoundingClientRect(); seek((event.clientX - box.left) / box.width * track.duration); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) { const box = event.currentTarget.getBoundingClientRect(); seek((event.clientX - box.left) / box.width * track.duration); } }}><i style={{ width: `${progress}%` }} /></div><div className="nyx-time"><span>{formatTime(currentTime)}</span><span>{formatTime(track.duration)}</span></div><div className="nyx-control-row">{control(liked ? "Unlike" : "Like", () => setLiked((value) => !value), <Heart size={14} fill={liked ? "currentColor" : "none"} />)}<div className="nyx-control-dock">{control("Toggle shuffle", () => setShuffled((value) => !value), <Shuffle size={13} />)}{control("Previous track", () => skipTrack("prev"), <SkipBack size={14} />, !queue.length)}{control(isPlaying ? "Pause" : "Play", togglePlay, isPlaying ? <Pause size={15} /> : <Play size={15} />)}{control("Next track", () => skipTrack("next"), <SkipForward size={14} />, !queue.length)}{control(repeatLabel, () => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off"), repeatMode === "one" ? <Repeat1 size={13} /> : <Repeat size={13} />)}</div>{control(showQueue ? "Hide queue" : "Show queue", () => setShowQueue((value) => !value), <List size={14} />, !queue.length)}</div></div>
        <AnimatePresence>{showQueue && queue.length > 0 && <motion.div className="nyx-queue" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><header><b>Up Next · {queue.length}</b>{control("Close queue", () => setShowQueue(false), <X size={14} />)}</header>{queue.map((item, index) => <button type="button" className={`nyx-queue-item ${index === activeIndex ? "is-active" : ""}`} key={item.id} onClick={() => { setActiveIndex(index); setCurrentTime(0); setShowQueue(false); onTrackChange?.(item, index); }}><img src={item.artwork} alt="" /><span><b>{item.title}</b><small>{item.artist}</small></span><em>{formatTime(item.duration)}</em></button>)}</motion.div>}</AnimatePresence>
      </motion.div>}
    </AnimatePresence></MotionConfig>
  </div>;
}
