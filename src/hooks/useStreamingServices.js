import { useCallback, useEffect, useState } from 'react';
import {
  login as spotifyLogin,
  handleCallback as handleSpotifyCallback,
  isLoggedIn as isSpotifyLoggedIn,
  logout as spotifyLogout,
  getClientId as getSpotifyClientId,
  setClientId as setSpotifyClientId,
  isConfigured as isSpotifyConfigured,
} from '../spotify/auth.js';
import { fetchPlaylistTracks as fetchSpotifyTracks, fetchMyPlaylists as fetchSpotifyPlaylists } from '../spotify/api.js';
import { login as appleLogin, logout as appleLogout, isLoggedIn as isAppleLoggedIn } from '../apple/auth.js';
import { fetchMyPlaylists as fetchApplePlaylists, fetchPlaylistTracks as fetchAppleTracks } from '../apple/api.js';
import {
  login as youtubeLogin,
  logout as youtubeLogout,
  isLoggedIn as isYouTubeLoggedIn,
  isConfigured as isYouTubeConfigured,
} from '../youtube/auth.js';
import {
  parsePlaylistUrl as parseYouTubePlaylistUrl,
  fetchPlaylistByUrl as fetchYouTubePlaylistByUrl,
  fetchMyPlaylists as fetchYouTubePlaylists,
  fetchPlaylistTracks as fetchYouTubeTracks,
} from '../youtube/api.js';
import useAppleConfig from './useAppleConfig.js';

const TRACK_FETCHERS = {
  spotify: fetchSpotifyTracks,
  apple: fetchAppleTracks,
  youtube: fetchYouTubeTracks,
};

/**
 * Connection state, playlists and playlist loading for Spotify, Apple Music
 * and YouTube.
 *
 * @param {object} opts
 * @param {string} opts.musicService     currently selected service
 * @param {(msg: string|null) => void} opts.setError  shared settings error
 * @param {(tracks: object[]) => void} opts.onTracksLoaded  start streaming a playlist
 * @param {() => void} opts.onLogout     called after any service logs out
 */
export default function useStreamingServices({ musicService, setError, onTracksLoaded, onLogout }) {
  const [spotifyConnected, setSpotifyConnected] = useState(isSpotifyLoggedIn());
  const [spotifyClientId, setSpotifyClientIdState] = useState(getSpotifyClientId);
  const [appleConnected, setAppleConnected] = useState(isAppleLoggedIn());
  const [youtubeConnected, setYoutubeConnected] = useState(isYouTubeLoggedIn());
  const [youtubeLoggingIn, setYoutubeLoggingIn] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [applePlaylists, setApplePlaylists] = useState([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const appleConfig = useAppleConfig();

  // ── Playlist list fetching ─────────────────────────────
  // `silent` suppresses errors (used for background refreshes on startup).
  const fetchPlaylistsInto = useCallback((fetcher, setPlaylists, silent) => {
    setLoadingPlaylists(true);
    if (!silent) setError(null);
    fetcher()
      .then((p) => { setPlaylists(p); setError(null); })
      .catch((err) => { if (!silent) setError(err.message); })
      .finally(() => setLoadingPlaylists(false));
  }, [setError]);

  const loadSpotifyPlaylists = useCallback(
    (silent = false) => fetchPlaylistsInto(fetchSpotifyPlaylists, setSpotifyPlaylists, silent),
    [fetchPlaylistsInto],
  );
  const loadApplePlaylists = useCallback(
    (silent = false) => fetchPlaylistsInto(fetchApplePlaylists, setApplePlaylists, silent),
    [fetchPlaylistsInto],
  );
  const loadYoutubePlaylists = useCallback(
    (silent = false) => fetchPlaylistsInto(fetchYouTubePlaylists, setYoutubePlaylists, silent),
    [fetchPlaylistsInto],
  );

  // ── Handle Spotify OAuth callback / restore sessions on mount ──
  useEffect(() => {
    async function checkCallback() {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code')) {
        try {
          await handleSpotifyCallback();
          setSpotifyConnected(true);
          // Small delay to let token settle before fetching
          setTimeout(() => loadSpotifyPlaylists(true), 500);
        } catch (err) {
          setError(err.message);
        }
      } else {
        if (isSpotifyLoggedIn()) loadSpotifyPlaylists(true);
        if (isAppleLoggedIn()) loadApplePlaylists(true);
        if (isYouTubeLoggedIn()) loadYoutubePlaylists(true);
      }
    }
    checkCallback();
  }, []);

  // ── Load tracks for a playlist ─────────────────────────
  const loadTracks = useCallback(async (fetchTracks, emptyMessage) => {
    setLoadingPlaylist(true);
    try {
      const tracks = await fetchTracks();
      if (tracks.length === 0) {
        setError(emptyMessage);
        return false;
      }
      onTracksLoaded(tracks);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoadingPlaylist(false);
    }
  }, [onTracksLoaded, setError]);

  const loadCurrentPlaylist = useCallback((id) => {
    const fetcher = TRACK_FETCHERS[musicService];
    if (!fetcher) return;
    setError(null);
    loadTracks(() => fetcher(id), 'Playlist is empty');
  }, [loadTracks, musicService, setError]);

  // Load a playlist from a YouTube URL (no sign-in needed)
  const loadYoutubePlaylistFromUrl = useCallback(async (rawInput) => {
    setError(null);
    if (!parseYouTubePlaylistUrl(rawInput)) {
      setError('Not a recognised YouTube playlist URL');
      return;
    }
    const loaded = await loadTracks(() => fetchYouTubePlaylistByUrl(rawInput), 'Playlist is empty or private');
    if (loaded) setYoutubeUrlInput('');
  }, [loadTracks, setError]);

  // ── Login / logout ─────────────────────────────────────
  const updateSpotifyClientId = useCallback((value) => {
    setSpotifyClientIdState(value);
    setSpotifyClientId(value);
  }, []);

  const loginSpotify = async () => {
    setError(null);
    try {
      await spotifyLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  const loginApple = async () => {
    setError(null);
    try {
      if (appleConfig.needsSave) {
        await appleConfig.save();
      }
      await appleLogin();
      setAppleConnected(true);
      loadApplePlaylists();
    } catch (err) {
      setError(err.message);
    }
  };

  const loginYoutube = async () => {
    setYoutubeLoggingIn(true);
    setError(null);
    try {
      await youtubeLogin();
      setYoutubeConnected(true);
      loadYoutubePlaylists();
    } catch (err) {
      setError(err.message);
    } finally {
      setYoutubeLoggingIn(false);
    }
  };

  const logoutSpotify = () => {
    spotifyLogout();
    setSpotifyConnected(false);
    setSpotifyPlaylists([]);
    onLogout();
  };

  const logoutApple = () => {
    appleLogout();
    setAppleConnected(false);
    setApplePlaylists([]);
    onLogout();
  };

  const logoutYoutube = () => {
    youtubeLogout();
    setYoutubeConnected(false);
    setYoutubePlaylists([]);
    onLogout();
  };

  const spotify = {
    connected: spotifyConnected,
    clientId: spotifyClientId,
    setClientId: updateSpotifyClientId,
    ready: spotifyClientId.trim().length > 0 || isSpotifyConfigured(),
    playlists: spotifyPlaylists,
    refresh: loadSpotifyPlaylists,
    login: loginSpotify,
    logout: logoutSpotify,
  };

  const apple = {
    ...appleConfig,
    connected: appleConnected,
    playlists: applePlaylists,
    refresh: loadApplePlaylists,
    login: loginApple,
    logout: logoutApple,
  };

  const youtube = {
    configured: isYouTubeConfigured(),
    connected: youtubeConnected,
    loggingIn: youtubeLoggingIn,
    urlInput: youtubeUrlInput,
    setUrlInput: setYoutubeUrlInput,
    loadFromUrl: loadYoutubePlaylistFromUrl,
    playlists: youtubePlaylists,
    refresh: loadYoutubePlaylists,
    login: loginYoutube,
    logout: logoutYoutube,
  };

  const current = { spotify, apple, youtube }[musicService] ?? null;

  return {
    spotify,
    apple,
    youtube,
    loadingPlaylists,
    loadingPlaylist,
    currentPlaylists: current?.playlists ?? [],
    refreshCurrentPlaylists: current?.refresh ?? null,
    loadCurrentPlaylist,
  };
}
