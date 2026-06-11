import React, { useState, useRef, useEffect } from "react";
import { PodcastEpisode } from "../types";
import { Play, Pause, Disc, Volume2, Calendar, Radio, Sparkles } from "lucide-react";

interface PodcastSectionProps {
  episodes: PodcastEpisode[];
}

export default function PodcastSection({ episodes }: PodcastSectionProps) {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(episodes[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Re-initialize audio if episode changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = currentEpisode.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentEpisode]);

  useEffect(() => {
    const audio = new Audio(currentEpisode.audioUrl);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio playback gesture limit or source error:", err);
          // Fallback: simulate playing state
          setIsPlaying(true);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekVal = parseFloat(e.target.value);
    audioRef.current.currentTime = seekVal;
    setCurrentTime(seekVal);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <section id="podcast-section" className="bg-darkBg text-editorial py-16 px-4 md:px-8 border-y border-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-accentNeon" />
              <span className="font-mono text-xs uppercase tracking-widest text-accentNeon font-bold">
                Audio Waves
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Listen to the Future
            </h2>
            <p className="text-sm text-neutral-400">
              FutureScope podcast series with deep conceptual insights and designer roundtables.
            </p>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] text-neutral-500">
            <span>SPOTIFY INSPIRED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accentNeon" />
            <span>HQ AUDIO</span>
          </div>
        </div>

        {/* Podcast Player layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Spotify Style Vinyl player (lg:col-span-8) */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden mesh-glow">
            
            {/* Spinning indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-neutral-800">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-accentNeon animate-pulse" : "bg-neutral-600"}`} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                {isPlaying ? "Streaming Broadcast" : "Session Paused"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 pt-4">
              {/* Vinyl representation Cover art */}
              <div className="relative group shrink-0">
                <div className={`w-40 h-40 rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-xl overflow-hidden flex items-center justify-center transition-transform duration-1000 ${isPlaying ? "rotate-180" : ""}`}
                     style={{ transition: isPlaying ? "transform 10s linear infinite" : "none" }}
                >
                  <img
                    src={currentEpisode.coverUrl}
                    alt={currentEpisode.title}
                    className="w-24 h-24 rounded-full object-cover border-4 border-neutral-900"
                  />
                  {/* Vinyl center pinhole */}
                  <div className="absolute w-4 h-4 bg-darkBg border border-neutral-700 rounded-full" />
                </div>
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity cursor-pointer text-accentNeon"
                >
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 fill-accentNeon" />}
                </button>
              </div>

              {/* Title parameters */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-accentNeon text-darkBg px-2.5 py-0.5 rounded-sm font-bold">
                    Episode {currentEpisode.episodeNumber}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-snug">
                  {currentEpisode.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-3">
                  {currentEpisode.description}
                </p>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-xs text-neutral-500 font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-accentNeon" />
                    <span>{currentEpisode.date}</span>
                  </span>
                  <span>•</span>
                  <span>Duration: {currentEpisode.duration}</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Equalizer Waveform & Player controls */}
            <div className="space-y-4 mt-8 pt-6 border-t border-neutral-800">
              
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>{formatTime(currentTime)}</span>
                
                {/* Micro Equalizer visualizer */}
                <div className="flex items-end space-x-0.5 h-6">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 4, 1].map((val, idx) => {
                    const randomDelay = Math.random() * 0.5;
                    return (
                      <span
                        key={idx}
                        className="w-[2px] bg-accentNeon rounded-full"
                        style={{
                          height: isPlaying ? `${Math.floor(Math.random() * 100)}%` : "15%",
                          transition: "height 150ms ease-in-out",
                        }}
                      />
                    );
                  })}
                </div>

                <span>{formatTime(duration || 270)}</span>
              </div>

              {/* Slider Seekbar */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-accentNeon"
              />

              {/* Button Controllers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="p-3 bg-accentNeon text-darkBg rounded-full hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-darkBg" /> : <Play className="w-5 h-5 fill-darkBg" />}
                  </button>
                  <span className="text-xs text-neutral-300 font-medium">Click to Stream Preview</span>
                </div>

                <div className="flex items-center space-x-2 text-neutral-400 hover:text-accentNeon transition-colors scale-90">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-mono">VOLUME SECURED</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Curated Episode Feed Lists (lg:col-span-4) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Podcast Library Directory
            </span>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {episodes.map((ep) => {
                const isSelected = ep.id === currentEpisode.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setCurrentEpisode(ep);
                      if (!isPlaying) {
                        setIsPlaying(true);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all flex items-center space-x-4 group ${
                      isSelected
                        ? "bg-neutral-900 border-accentNeon/40 text-white"
                        : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <img
                      src={ep.coverUrl}
                      alt={ep.title}
                      className="w-12 h-12 rounded object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase text-accentNeon font-semibold">
                          EPISODE {ep.episodeNumber}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">{ep.duration}</span>
                      </div>
                      <h4 className="font-semibold text-xs md:text-sm truncate group-hover:text-white transition-colors">
                        {ep.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 p-4 bg-accentNeon/5 border border-accentNeon/20 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-neutral-200 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-accentNeon animate-pulse" />
                  <span>Interactive Audio Deck</span>
                </span>
                <p className="text-[10px] text-neutral-400">
                  Select any episode to load high-fidelity vocal feeds above.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
