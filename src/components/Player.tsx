import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';

export const Player = () => {
  const { currentStation, isPlaying, togglePlay, volume, setVolume } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }

    const audio = audioRef.current;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setError(null);
    };
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsBuffering(false);
      setError("Stream unavailable");
      // Could implement auto-fallback or retry here for robustness
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      // If URL changed, update and play
      if (audio.src !== currentStation.url) {
        audio.src = currentStation.url;
        audio.load();
        setError(null);
        setIsBuffering(true);
        if (isPlaying) {
          audio.play().catch(e => {
             console.error("Play prevented:", e);
             setError("Autoplay blocked");
             if(isPlaying) togglePlay(); // Reset state if play failed
          });
        }
      } else {
        // Just play/pause toggle
        if (isPlaying) {
          audio.play().catch(e => {
             console.error("Play prevented:", e);
             setError("Autoplay blocked");
             togglePlay();
          });
        } else {
          audio.pause();
        }
      }
    } else {
      audio.pause();
    }
  }, [currentStation, isPlaying, togglePlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="player-container glass-panel">
      <button className="play-btn" onClick={togglePlay} disabled={!currentStation}>
        {isBuffering ? (
          <Loader2 className="animate-spin text-slate-800" size={24} />
        ) : isPlaying ? (
          <Pause className="text-slate-800" fill="currentColor" size={24} />
        ) : (
          <Play className="text-slate-800 ml-1" fill="currentColor" size={24} />
        )}
      </button>

      <div className="player-info">
        <div className="station-title-wrapper">
          {isPlaying && !isBuffering && !error && <span className="live-indicator animate-pulse-soft"></span>}
          <h2 className="station-title">
            {currentStation ? currentStation.name : "Select a station"}
          </h2>
        </div>
        <div className="station-meta">
          {error ? (
            <span className="text-red-400 flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </span>
          ) : currentStation ? (
            <>
              <span>{currentStation.country}</span>
              <span>•</span>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '120px', position: 'relative' }}>
                <span className="text-gradient font-semibold animate-ticker" style={{display: 'inline-block'}}>
                  Live Broadcast
                </span>
              </div>
            </>
          ) : (
            <span>Spin the globe to explore</span>
          )}
        </div>
      </div>

      <div className="volume-control hidden md:flex">
        {volume === 0 ? <VolumeX size={18} className="text-slate-400" /> : <Volume2 size={18} className="text-slate-400" />}
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
};
