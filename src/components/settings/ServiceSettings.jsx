import { PanelButton } from './common.jsx';

/** Shared "connected" controls: open playlists, refresh, logout. */
function ConnectedControls({ service, loadingPlaylists, onShowPlaylists }) {
  return (
    <>
      <PanelButton onClick={onShowPlaylists}>
        playlists ({service.playlists.length})
      </PanelButton>
      <div className="settings-theme-row">
        <PanelButton disabled={loadingPlaylists} onClick={() => service.refresh()}>
          refresh
        </PanelButton>
        <PanelButton onClick={service.logout}>
          logout
        </PanelButton>
      </div>
    </>
  );
}

export function SpotifySettings({ spotify, loadingPlaylists, onShowPlaylists, onShowHelp }) {
  if (spotify.connected) {
    return <ConnectedControls service={spotify} loadingPlaylists={loadingPlaylists} onShowPlaylists={onShowPlaylists} />;
  }

  return (
    <>
      <input
        className="settings-input"
        type="text"
        placeholder="spotify client id"
        value={spotify.clientId}
        onChange={(e) => spotify.setClientId(e.target.value)}
      />
      <div className="settings-theme-row">
        <PanelButton disabled={!spotify.ready} onClick={spotify.login}>
          log in
        </PanelButton>
        <PanelButton onClick={onShowHelp}>
          setup help
        </PanelButton>
      </div>
    </>
  );
}

export function AppleSettings({ apple, loadingPlaylists, onShowPlaylists, onShowHelp }) {
  if (apple.connected) {
    return <ConnectedControls service={apple} loadingPlaylists={loadingPlaylists} onShowPlaylists={onShowPlaylists} />;
  }

  return (
    <>
      <div className="settings-theme-row">
        <PanelButton onClick={onShowHelp}>
          setup help
        </PanelButton>
      </div>
      <input
        className="settings-input"
        type="text"
        placeholder="apple team id"
        value={apple.teamId}
        onChange={(e) => apple.setTeamId(e.target.value)}
      />
      <input
        className="settings-input"
        type="text"
        placeholder="apple key id"
        value={apple.keyId}
        onChange={(e) => apple.setKeyId(e.target.value)}
      />
      <textarea
        className="settings-input settings-textarea"
        placeholder={apple.configReady ? 'private key saved' : 'paste .p8 key contents'}
        value={apple.privateKey}
        onChange={(e) => apple.setPrivateKey(e.target.value)}
      />
      {apple.configReady && (
        <div className="settings-label">
          apple setup saved{apple.configSource === 'env' ? ' from env' : ''}
        </div>
      )}
      <div className="settings-theme-row">
        <PanelButton disabled={!apple.ready} onClick={apple.login}>
          log in
        </PanelButton>
      </div>
    </>
  );
}

export function YouTubeSettings({ youtube, loadingPlaylists, loadingPlaylist, onShowPlaylists }) {
  // Without OAuth credentials, YouTube works by pasting a public playlist link.
  if (!youtube.configured) {
    const url = youtube.urlInput.trim();
    return (
      <>
        <input
          className="settings-input"
          type="text"
          placeholder="paste a youtube playlist link"
          value={youtube.urlInput}
          onChange={(e) => youtube.setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && url) youtube.loadFromUrl(url);
          }}
          disabled={loadingPlaylist}
        />
        <PanelButton disabled={loadingPlaylist || !url} onClick={() => youtube.loadFromUrl(url)}>
          {loadingPlaylist ? 'loading...' : 'load playlist'}
        </PanelButton>
      </>
    );
  }

  if (youtube.connected) {
    return <ConnectedControls service={youtube} loadingPlaylists={loadingPlaylists} onShowPlaylists={onShowPlaylists} />;
  }

  return (
    <PanelButton disabled={youtube.loggingIn} onClick={youtube.login}>
      {youtube.loggingIn ? 'waiting for browser...' : 'log in with google'}
    </PanelButton>
  );
}
