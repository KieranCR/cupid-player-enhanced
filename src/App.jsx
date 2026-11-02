import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import useAudioPlayer from './hooks/useAudioPlayer.js';
import useSpotifyPlayer from './hooks/useSpotifyPlayer.js';
import useTheme from './hooks/useTheme.js';
import useLocalPlaylist from './hooks/useLocalPlaylist.js';
import usePanelViews from './hooks/usePanelViews.js';
import useRecordAnimation from './hooks/useRecordAnimation.js';
import useResize from './hooks/useResize.js';
import useSeekDrag from './hooks/useSeekDrag.js';
import useSleepTimer from './hooks/useSleepTimer.js';
import useSourceOverride from './hooks/useSourceOverride.js';
import useStreamingServices from './hooks/useStreamingServices.js';
import useVolumeDrag from './hooks/useVolumeDrag.js';
import MarqueeText from './components/MarqueeText.jsx';
import SettingsPanel from './components/settings/SettingsPanel.jsx';
import {
  readInitialSource,
  readInitialStreamTracks,
  readMusicService,
  readNightMode,
  readResolverAvoidText,
  readResumeState,
  splitResolverAvoidWords,
  writeMusicService,
  writeNightMode,
  writeResolverAvoidText,
  writeResumeState,
} from './storage.js';
import { formatTime } from './utils/format.js';

import progressBarStars from '../assets/progress_bar_stars.png';
import star from '../assets/star.png';
import starSelected from '../assets/star_selected.png';

export default function App() {
  // ── Persisted app state ─────────────────────────────────
  const [resumeState] = useState(readResumeState);
  const [source, setSource] = useState(() => readInitialSource(resumeState)); // 'local' | 'streaming'
  const [streamTracks, setStreamTracks] = useState(() => readInitialStreamTracks(resumeState));
  const [streamAutoplayKey, setStreamAutoplayKey] = useState(0);
  const [musicService, setMusicService] = useState(() => readMusicService(resumeState)); // 'spotify' | 'apple' | 'youtube' | 'local'
  const [playMode, setPlayMode] = useState('normal'); // 'normal' | 'shuffle' | 'repeat'
  const [nightMode, setNightMode] = useState(readNightMode);
  const [resolverAvoidText, setResolverAvoidText] = useState(readResolverAvoidText);
  const [settingsError, setSettingsError] = useState(null);
  const [showDebug] = useState(false);

  useEffect(() => { writeNightMode(nightMode); }, [nightMode]);
  useEffect(() => { writeResolverAvoidText(resolverAvoidText); }, [resolverAvoidText]);

  const { theme, toggleTheme, assets } = useTheme();
  const panels = usePanelViews();
  const { tracks: localTracks, reload: loadLocalPlaylist } = useLocalPlaylist();

  // ── Streaming queue ─────────────────────────────────────
  // Bumping the autoplay key tells the streaming player to (re)start playback.
  const restartStream = useCallback(() => setStreamAutoplayKey((key) => key + 1), []);
  const playStreamTracks = useCallback((tracks) => {
    setStreamTracks(tracks);
    setSource('streaming');
    restartStream();
  }, [restartStream]);
  const stopStreaming = useCallback(() => setSource('local'), []);

  const services = useStreamingServices({
    musicService,
    setError: setSettingsError,
    onTracksLoaded: playStreamTracks,
    onLogout: stopStreaming,
  });

  // ── Players ─────────────────────────────────────────────
  const resumeAutoplay = resumeState
    ? resumeState.wasPlaying !== false
    : false;
  const resolverOptions = useMemo(() => ({
    avoidWords: splitResolverAvoidWords(resolverAvoidText),
  }), [resolverAvoidText]);

  const local = useAudioPlayer(localTracks, playMode, window.cupid?.getLocalAudioPath, {
    trackIndex: resumeState?.source === 'local' ? resumeState.trackIndex : 0,
    currentTime: resumeState?.source === 'local' ? resumeState.currentTime : 0,
    autoplay: resumeState?.source === 'local' && resumeAutoplay,
  });
  const streaming = useSpotifyPlayer(streamTracks, playMode, {
    trackIndex: resumeState?.source === 'streaming' ? resumeState.trackIndex : 0,
    currentTime: resumeState?.source === 'streaming' ? resumeState.currentTime : 0,
    autoplay: resumeState?.source === 'streaming' && resumeAutoplay,
    autoplayKey: streamAutoplayKey,
  }, resolverOptions);
  const player = source === 'streaming' ? streaming : local;

  const {
    track,
    isPlaying,
    progress,
    duration,
    currentTime,
    togglePlay,
    pause,
    next,
    prev,
    selectTrack,
    seek,
    volume,
    setVolume,
    muted,
    toggleMute,
    loading = false,
    playbackStatus,
    trackIndex,
  } = player;
  const queueTracks = source === 'streaming' ? streamTracks : localTracks;
  const canChangeSource = source === 'streaming' && track?.title && track.title !== 'No track';

  useEffect(() => {
    if (source === 'local' && localTracks.length === 0) return;
    if (source === 'streaming' && streamTracks.length === 0) return;

    writeResumeState({
      source,
      musicService,
      trackIndex,
      currentTime,
      wasPlaying: isPlaying,
      streamTracks: source === 'streaming' ? streamTracks : [],
      savedAt: Date.now(),
    });
  }, [source, musicService, trackIndex, currentTime, isPlaying, streamTracks, localTracks.length]);

  // ── Feature hooks ───────────────────────────────────────
  const sourceOverride = useSourceOverride({
    track,
    trackIndex,
    canChange: canChangeSource,
    setStreamTracks,
    restartStream,
    setError: setSettingsError,
  });
  const sleep = useSleepTimer(pause);
  const record = useRecordAnimation({ trackTitle: track.title, isPlaying, theme, assets });
  const seekBar = useSeekDrag(seek);
  const volumeBar = useVolumeDrag(setVolume);

  const resizeTL = useResize('top-left');
  const resizeTR = useResize('top-right');
  const resizeBL = useResize('bottom-left');
  const resizeBR = useResize('bottom-right');

  // ── Handlers ────────────────────────────────────────────
  const { reset: resetSourceOverride } = sourceOverride;
  const { openSourceView: showSourceView } = panels;
  const openSourceView = useCallback(() => {
    resetSourceOverride(track?.sourceVideoId || track?.videoId || '');
    setSettingsError(null);
    showSourceView();
  }, [resetSourceOverride, showSourceView, track]);

  const cyclePlayMode = useCallback(() => {
    setPlayMode((m) => m === 'normal' ? 'shuffle' : m === 'shuffle' ? 'repeat' : 'normal');
  }, []);

  const changeMusicService = useCallback((next) => {
    setMusicService(next);
    writeMusicService(next);
    if (next === 'local') setSource('local');
  }, []);

  const displayProgress = seekBar.hoverProgress ?? progress;

  return (
    <div className={`player ${theme === 'blue' ? 'theme-blue' : ''} ${nightMode ? 'night-mode' : ''}`}>
      {/* Base frame */}
      <img src={assets.frame} className="layer" alt="" draggable={false} />

      {/* Window title */}
      <div className="window-title">cupid player+</div>

      {/* Record player centered in frame */}
      <img src={assets.recordPlayer} className="record-player" alt="" draggable={false} />
      <img
        src={record.recordSrc}
        className={`record-player ${record.swapping ? 'record-slide-out' : ''}`}
        alt=""
        draggable={false}
      />
      {record.swapping && (
        <img
          src={record.incomingRecordSrc}
          className="record-player record-slide-in"
          alt=""
          draggable={false}
        />
      )}
      <img src={record.needleSrc} className="record-player" alt="" draggable={false} />

      {/* Frame overlay (no background) to clip sliding records */}
      <img src={assets.frameNoBg} className="layer frame-overlay" alt="" draggable={false} />

      {/* Decorative */}
      <img src={assets.plant} className="layer layer-ui" alt="" draggable={false} />

      {/* Progress bar layers */}
      <img src={assets.progressBar} className="layer layer-ui" alt="" draggable={false} />
      <img
        src={progressBarStars}
        className="layer layer-ui"
        alt=""
        draggable={false}
        style={{
          clipPath: `inset(0 ${(1 - (131 + displayProgress * 226 + 10) / 512) * 100}% 0 0)`,
        }}
      />
      <img
        src={seekBar.starHovered ? starSelected : star}
        className={`layer layer-ui star-indicator ${seekBar.starHovered ? 'star-hovered' : ''}`}
        alt=""
        draggable={false}
        style={{
          transform: `translateX(calc(-3 / 306 * 100vw + ${displayProgress * (226 / 512) * 171.9}vw))`,
        }}
      />

      {/* Playback control layers (visual only) */}
      <img src={assets.backwardsButton} className="layer layer-ui" alt="" draggable={false} />
      <img src={isPlaying ? assets.pauseButton : assets.playButton} className="layer layer-ui" alt="" draggable={false} />
      <img src={assets.forwardsButton} className="layer layer-ui" alt="" draggable={false} />

      {/* Volume/mute button layer */}
      <img
        src={muted ? assets.muteButton : assets.volumeButton}
        className="layer layer-ui"
        alt=""
        draggable={false}
        style={{ opacity: 0.8 }}
      />

      {/* Shuffle/repeat button layer */}
      <img
        src={playMode === 'repeat' ? assets.repeatButton : assets.shuffleButton}
        className="layer layer-ui"
        alt=""
        draggable={false}
        style={{ opacity: playMode === 'normal' ? 0.4 : 0.8 }}
      />

      {/* Window control layers (visual only) */}
      <img src={assets.minimizerButton} className="layer layer-ui" alt="" draggable={false} />
      <img src={assets.windowButton} className="layer layer-ui" alt="" draggable={false} />
      <img src={assets.exitButton} className="layer layer-ui" alt="" draggable={false} />

      {/* Settings button layer */}
      <img src={assets.settings} className="layer layer-ui settings-layer" alt="" draggable={false} />
      <img src={assets.tracks} className="track-view-layer" alt="" draggable={false} />

      {/* SVG clip-path for pixel-art album mask */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="album-mask" clipPathUnits="objectBoundingBox">
            {/* 35x41 centered vertically */}
            <rect x="0.07317" y="0" width="0.85366" height="1" />
            {/* 37x39 */}
            <rect x="0.04878" y="0.02439" width="0.90244" height="0.95122" />
            {/* 39x37 */}
            <rect x="0.02439" y="0.04878" width="0.95122" height="0.90244" />
            {/* 41x35 */}
            <rect x="0" y="0.07317" width="1" height="0.85366" />
          </clipPath>
        </defs>
      </svg>

      {/* Album art clipped to pixel mask */}
      {track.art && (
        <div className="album-mask">
          <img src={track.art} className="album-art" alt="" draggable={false} />
        </div>
      )}

      {/* Album frame overlay */}
      <img src={assets.albumFrame} className="layer album-frame-layer" alt="" draggable={false} />

      {/* Now playing section */}
      <div className="now-playing">
        <div className="track-info">
          <div className="now-playing-label">
            {playbackStatus === 'failed' ? 'not found...' : loading ? 'loading...' : 'now playing...'}
          </div>
          <MarqueeText className="track-title" text={track.title} />
          <div className="track-artist">by {track.artist}</div>
        </div>
      </div>

      {/* Time display */}
      <div className="time-display">
        <span className="time-current">{loading ? '...' : formatTime(currentTime)}</span>
        <span className="time-remaining">{loading ? '...' : formatTime(duration - currentTime)}</span>
      </div>

      {/* Drag region for moving the window */}
      <div className="drag-region" />

      {/* Custom resize handles at frame corners */}
      <div className="resize-handle top-left" onMouseDown={resizeTL} />
      <div className="resize-handle top-right" onMouseDown={resizeTR} />
      <div className="resize-handle bottom-left" onMouseDown={resizeBL} />
      <div className="resize-handle bottom-right" onMouseDown={resizeBR} />

      {/* Progress bar seek target */}
      <div className="progress-seek" ref={seekBar.seekRef} {...seekBar.handlers} />

      {/* Playback control click targets */}
      <div className="btn btn-prev" onClick={prev} />
      <div className="btn btn-play" onClick={togglePlay} />
      <div className="btn btn-next" onClick={next} />

      {/* Volume bar layers — shown on hover or drag */}
      {volumeBar.expanded && (
        <>
          <img src={assets.volumeBarLow} className="layer layer-ui volume-bar-layer" alt="" draggable={false} />
          <img
            src={assets.volumeBarHigh}
            className="layer layer-ui volume-bar-layer"
            alt=""
            draggable={false}
            style={{
              clipPath: `inset(${((1 - (muted ? 0 : volume)) * (420 - 338) / 512 + 338 / 512) * 100}% 0 0 0)`,
            }}
          />
        </>
      )}

      {/* Volume icon — hover to reveal bar */}
      <div
        className={`volume-hover-zone ${volumeBar.expanded ? 'expanded' : ''}`}
        onMouseLeave={volumeBar.onZoneLeave}
      >
        <div
          className="btn-volume-icon"
          onClick={toggleMute}
          onMouseEnter={volumeBar.onIconEnter}
        />
        {volumeBar.expanded && (
          <div
            className="volume-bar-area"
            ref={volumeBar.volumeBarRef}
            onMouseDown={volumeBar.onBarMouseDown}
          />
        )}
      </div>

      {/* Shuffle/repeat click target */}
      <div className="btn btn-playmode" onClick={cyclePlayMode} title={playMode} />

      {/* Window control click targets */}
      <div className="btn btn-minimize" onClick={() => window.cupid?.minimize()} />
      <div className="btn btn-window" onClick={() => window.cupid?.maximize()} />
      <div className="btn btn-exit" onClick={() => window.cupid?.close()} />

      {/* Settings button */}
      <div className="btn btn-settings" onClick={panels.toggleSettings} />
      <div className="btn btn-track-view" onClick={panels.toggleTrackView} />

      {/* Debug overlays — toggle with showDebug state */}
      {showDebug && (
        <>
          <div className="debug-overlay btn btn-prev" />
          <div className="debug-overlay btn btn-play" />
          <div className="debug-overlay btn btn-next" />
          <div className="debug-overlay volume-hover-zone" />
          <div className="debug-overlay volume-bar-area-debug" />
          <div className="debug-overlay btn btn-playmode" />
        </>
      )}

      {panels.isOpen && (
        <SettingsPanel
          panels={panels}
          error={settingsError}
          queue={{
            tracks: queueTracks,
            activeIndex: trackIndex,
            playMode,
            onSelect: selectTrack,
            onOpenSource: source === 'streaming' ? openSourceView : null,
          }}
          source={{
            track,
            canChange: canChangeSource,
            override: sourceOverride,
            avoidText: resolverAvoidText,
            onAvoidTextChange: setResolverAvoidText,
          }}
          services={services}
          preferences={{
            theme,
            toggleTheme,
            nightMode,
            toggleNightMode: () => setNightMode((v) => !v),
            musicService,
            onMusicServiceChange: changeMusicService,
            sleep,
            onReloadLocal: loadLocalPlaylist,
          }}
        />
      )}
    </div>
  );
}
