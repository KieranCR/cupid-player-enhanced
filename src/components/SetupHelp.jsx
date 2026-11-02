import { APPLE_KEYS_URL, SPOTIFY_DASHBOARD_URL, SPOTIFY_REDIRECT_URI } from '../constants.js';

export function SpotifySetupHelp() {
  return (
    <div className="settings-help">
      <div className="settings-help-copy">
        create a spotify app, copy its client id, then paste it into cupid player+.
      </div>
      <div className="settings-help-list">
        <span>1. open the spotify developer dashboard</span>
        <span>2. create an app and choose web api if asked</span>
        <span>3. add this redirect uri exactly</span>
        <code>{SPOTIFY_REDIRECT_URI}</code>
        <span>4. save, then copy the client id</span>
      </div>
      <div className="settings-help-copy">you do not need the client secret.</div>
      <a
        className="settings-theme-btn settings-help-link"
        href={SPOTIFY_DASHBOARD_URL}
        target="_blank"
        rel="noreferrer"
      >
        open dashboard
      </a>
    </div>
  );
}

export function AppleSetupHelp() {
  return (
    <div className="settings-help">
      <div className="settings-help-copy">
        apple music needs a developer key so cupid player+ can create a musickit token.
      </div>
      <div className="settings-help-list">
        <span>1. open apple developer keys</span>
        <span>2. create a key with musickit enabled</span>
        <span>3. copy your team id and key id</span>
        <span>4. open the downloaded .p8 file and paste its contents</span>
      </div>
      <div className="settings-help-copy">
        this requires an apple developer account. the key stays on this computer.
      </div>
      <a
        className="settings-theme-btn settings-help-link"
        href={APPLE_KEYS_URL}
        target="_blank"
        rel="noreferrer"
      >
        open keys
      </a>
    </div>
  );
}
