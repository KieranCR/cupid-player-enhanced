import { useCallback, useState } from 'react';

/**
 * Which settings-panel view is showing. Kept as independent flags (rather
 * than one enum) because some combine: e.g. `about` stays set underneath
 * the help views. SettingsPanel picks the view in priority order:
 * tracks > source > playlists > spotify help > apple help > about > main.
 */
export default function usePanelViews() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTrackView, setShowTrackView] = useState(false);
  const [showPlaylistView, setShowPlaylistView] = useState(false);
  const [showSourceView, setShowSourceView] = useState(false);
  const [showSpotifyHelp, setShowSpotifyHelp] = useState(false);
  const [showAppleHelp, setShowAppleHelp] = useState(false);

  const toggleSettings = useCallback(() => {
    if (showSettings) {
      setShowAbout(false);
      setShowSpotifyHelp(false);
      setShowAppleHelp(false);
    }
    setShowTrackView(false);
    setShowPlaylistView(false);
    setShowSourceView(false);
    setShowSettings((v) => !v);
  }, [showSettings]);

  const toggleTrackView = useCallback(() => {
    setShowAbout(false);
    setShowSettings(false);
    setShowPlaylistView(false);
    setShowSourceView(false);
    setShowSpotifyHelp(false);
    setShowAppleHelp(false);
    setShowTrackView((v) => !v);
  }, []);

  const openSourceView = useCallback(() => {
    setShowTrackView(false);
    setShowSettings(false);
    setShowSourceView(true);
  }, []);

  const backToTracks = useCallback(() => {
    setShowSourceView(false);
    setShowTrackView(true);
  }, []);

  const isSubView = showTrackView || showPlaylistView || showSourceView || showSpotifyHelp || showAppleHelp;

  return {
    showSettings,
    showAbout,
    showTrackView,
    showPlaylistView,
    showSourceView,
    showSpotifyHelp,
    showAppleHelp,
    isOpen: showSettings || isSubView,
    isSubView,
    setShowAbout,
    setShowTrackView,
    setShowPlaylistView,
    setShowSpotifyHelp,
    setShowAppleHelp,
    toggleSettings,
    toggleTrackView,
    openSourceView,
    backToTracks,
  };
}
