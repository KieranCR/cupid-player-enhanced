import PlaylistList from '../PlaylistList.jsx';
import { BackButton, PanelButton, PanelHeading } from './common.jsx';

export default function PlaylistView({ playlists, loading, loadingPlaylist, onSelect, onRefresh, onBack }) {
  return (
    <>
      <BackButton onClick={onBack} />
      <PanelHeading title="playlists" count={playlists.length} />
      <PlaylistList
        loading={loading}
        playlists={playlists}
        loadingPlaylist={loadingPlaylist}
        onSelect={onSelect}
      />
      {onRefresh && (
        <PanelButton disabled={loading} onClick={() => onRefresh()}>
          refresh
        </PanelButton>
      )}
    </>
  );
}
