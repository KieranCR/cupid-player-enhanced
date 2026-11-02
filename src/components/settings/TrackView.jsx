import TrackList from '../TrackList.jsx';
import { BackButton } from './common.jsx';

export default function TrackView({ tracks, activeIndex, playMode, onSelect, onBack, onOpenSource }) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="settings-track-heading">
        <span>tracks</span>
        <small>{tracks.length}</small>
      </div>
      <TrackList
        tracks={tracks}
        activeIndex={activeIndex}
        playMode={playMode}
        onSelect={onSelect}
      />
      {onOpenSource && (
        <button className="settings-theme-btn" onClick={onOpenSource}>
          source
        </button>
      )}
    </>
  );
}
