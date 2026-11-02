import { useEffect, useRef } from 'react';

export default function TrackList({ tracks, activeIndex, playMode, onSelect }) {
  const activeRef = useRef(null);
  const nextIndex = playMode === 'normal' && tracks.length > 1
    ? (activeIndex + 1) % tracks.length
    : null;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (tracks.length === 0) {
    return <div className="settings-track-empty">no tracks loaded</div>;
  }

  return (
    <div className="settings-track-list">
      {tracks.map((track, index) => {
        const trackState = index === activeIndex
          ? 'playing'
          : index === nextIndex
            ? 'next'
            : '';

        return (
          <button
            key={`${track.id ?? track.uri ?? track.file ?? track.title}-${index}`}
            ref={index === activeIndex ? activeRef : null}
            className={`settings-track-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSelect(index)}
          >
            <span className="settings-track-title">{track.title}</span>
            <span className="settings-track-meta">
              {track.artist && <small>{track.artist}</small>}
              {trackState && <small>{trackState}</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
