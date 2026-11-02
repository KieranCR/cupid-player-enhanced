import SettingsDropdown from '../SettingsDropdown.jsx';
import { MUSIC_SERVICE_OPTIONS, SLEEP_TIMER_OPTIONS } from '../../constants.js';
import { formatCountdown } from '../../utils/format.js';
import { ErrorMessage, PanelButton } from './common.jsx';
import { AppleSettings, SpotifySettings, YouTubeSettings } from './ServiceSettings.jsx';

export default function MainSettingsView({ preferences, services, error, panels }) {
  const { theme, toggleTheme, nightMode, toggleNightMode, musicService, onMusicServiceChange, sleep, onReloadLocal } = preferences;
  const showPlaylists = () => panels.setShowPlaylistView(true);
  const serviceProps = {
    loadingPlaylists: services.loadingPlaylists,
    onShowPlaylists: showPlaylists,
  };

  return (
    <>
      <div className="settings-label">theme</div>
      <div className="settings-theme-row">
        <PanelButton active={theme === 'pink'} onClick={() => { if (theme !== 'pink') toggleTheme(); }}>
          pink
        </PanelButton>
        <PanelButton active={theme === 'blue'} onClick={() => { if (theme !== 'blue') toggleTheme(); }}>
          blue
        </PanelButton>
      </div>
      <PanelButton active={nightMode} onClick={toggleNightMode}>
        night {nightMode ? 'on' : 'off'}
      </PanelButton>
      <PanelButton onClick={() => panels.setShowAbout(true)}>
        about
      </PanelButton>

      <div className="settings-label">music</div>
      <SettingsDropdown
        value={musicService}
        options={MUSIC_SERVICE_OPTIONS}
        onChange={onMusicServiceChange}
      />

      <div className="settings-label">sleep</div>
      <SettingsDropdown
        value={sleep.timer}
        options={SLEEP_TIMER_OPTIONS}
        onChange={sleep.setTimer}
      />
      {sleep.timer !== 'off' && (
        <>
          <PanelButton active={sleep.showCountdown} onClick={sleep.toggleCountdown}>
            countdown {sleep.showCountdown ? 'on' : 'off'}
          </PanelButton>
          {sleep.showCountdown && (
            <div className="settings-label">sleep in {formatCountdown(sleep.remaining)}</div>
          )}
        </>
      )}

      {musicService === 'local' && (
        <PanelButton onClick={onReloadLocal}>
          reload
        </PanelButton>
      )}

      {musicService === 'spotify' && (
        <SpotifySettings
          spotify={services.spotify}
          onShowHelp={() => panels.setShowSpotifyHelp(true)}
          {...serviceProps}
        />
      )}

      {musicService === 'apple' && (
        <AppleSettings
          apple={services.apple}
          onShowHelp={() => panels.setShowAppleHelp(true)}
          {...serviceProps}
        />
      )}

      {musicService === 'youtube' && (
        <YouTubeSettings
          youtube={services.youtube}
          loadingPlaylist={services.loadingPlaylist}
          {...serviceProps}
        />
      )}

      <ErrorMessage error={error} />
    </>
  );
}
