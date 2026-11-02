import { AppleSetupHelp, SpotifySetupHelp } from '../SetupHelp.jsx';
import AboutView from './AboutView.jsx';
import MainSettingsView from './MainSettingsView.jsx';
import PlaylistView from './PlaylistView.jsx';
import SourceView from './SourceView.jsx';
import TrackView from './TrackView.jsx';
import { BackButton, PanelHeading } from './common.jsx';

function HelpView({ title, onBack, children }) {
  return (
    <>
      <BackButton onClick={onBack} />
      <PanelHeading title={title} />
      {children}
    </>
  );
}

function PanelContent({ panels, error, queue, source, services, preferences }) {
  if (panels.showTrackView) {
    return <TrackView {...queue} onBack={() => panels.setShowTrackView(false)} />;
  }
  if (panels.showSourceView) {
    return <SourceView {...source} error={error} onBack={panels.backToTracks} />;
  }
  if (panels.showPlaylistView) {
    return (
      <PlaylistView
        playlists={services.currentPlaylists}
        loading={services.loadingPlaylists}
        loadingPlaylist={services.loadingPlaylist}
        onSelect={services.loadCurrentPlaylist}
        onRefresh={services.refreshCurrentPlaylists}
        onBack={() => panels.setShowPlaylistView(false)}
      />
    );
  }
  if (panels.showSpotifyHelp) {
    return (
      <HelpView title="spotify setup" onBack={() => panels.setShowSpotifyHelp(false)}>
        <SpotifySetupHelp />
      </HelpView>
    );
  }
  if (panels.showAppleHelp) {
    return (
      <HelpView title="apple setup" onBack={() => panels.setShowAppleHelp(false)}>
        <AppleSetupHelp />
      </HelpView>
    );
  }
  if (panels.showAbout) {
    return <AboutView onBack={() => panels.setShowAbout(false)} />;
  }
  return <MainSettingsView preferences={preferences} services={services} error={error} panels={panels} />;
}

/**
 * The pop-over panel. Render only when `panels.isOpen`.
 *
 * @param {object} props
 * @param {ReturnType<import('../../hooks/usePanelViews.js').default>} props.panels
 * @param {string|null} props.error           shared settings error message
 * @param {object} props.queue                props for TrackView
 * @param {object} props.source               props for SourceView
 * @param {ReturnType<import('../../hooks/useStreamingServices.js').default>} props.services
 * @param {object} props.preferences          theme / night mode / service / sleep controls
 */
export default function SettingsPanel(props) {
  return (
    <div className="settings-panel">
      <div className={`settings-panel-inner ${props.panels.isSubView ? 'track-picker' : ''}`}>
        <PanelContent {...props} />
      </div>
    </div>
  );
}
