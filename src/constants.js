export const SLEEP_TIMER_OPTIONS = [
  { value: 'off', label: 'off' },
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '60 minutes' },
];

export const MUSIC_SERVICES = ['spotify', 'apple', 'youtube', 'local'];

export const MUSIC_SERVICE_OPTIONS = [
  { value: 'local', label: 'local' },
  { value: 'spotify', label: 'spotify' },
  { value: 'apple', label: 'apple' },
  { value: 'youtube', label: 'youtube' },
];

export const RESUME_KEY = 'cupid-player-resume';
export const NIGHT_MODE_KEY = 'cupid-player-night-mode';
export const RESOLVER_AVOID_KEY = 'cupid-player-resolver-avoid';
export const MUSIC_SERVICE_KEY = 'cupid-player-music-service';

export const DEFAULT_RESOLVER_AVOID = 'live, remix, cover, karaoke, sped up, slowed, instrumental';
export const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5173/callback';
export const SPOTIFY_DASHBOARD_URL = 'https://developer.spotify.com/dashboard';
export const APPLE_KEYS_URL = 'https://developer.apple.com/account/resources/authkeys/list';
