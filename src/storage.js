import {
  DEFAULT_RESOLVER_AVOID,
  MUSIC_SERVICES,
  MUSIC_SERVICE_KEY,
  NIGHT_MODE_KEY,
  RESOLVER_AVOID_KEY,
  RESUME_KEY,
} from './constants.js';

// localStorage can throw (private mode, blocked storage), so every access is guarded.

export function writeItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readResumeState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RESUME_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeResumeState(state) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function hasResumableStream(resumeState) {
  return resumeState?.source === 'streaming'
    && Array.isArray(resumeState.streamTracks)
    && resumeState.streamTracks.length > 0;
}

/** @returns {'local' | 'streaming'} */
export function readInitialSource(resumeState) {
  return hasResumableStream(resumeState) ? 'streaming' : 'local';
}

export function readInitialStreamTracks(resumeState) {
  return Array.isArray(resumeState?.streamTracks) ? resumeState.streamTracks : [];
}

/** @returns {'spotify' | 'apple' | 'youtube' | 'local'} */
export function readMusicService(resumeState) {
  try {
    if (MUSIC_SERVICES.includes(resumeState?.musicService)) return resumeState.musicService;
    const stored = localStorage.getItem(MUSIC_SERVICE_KEY);
    if (MUSIC_SERVICES.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return 'local';
}

export function writeMusicService(value) {
  writeItem(MUSIC_SERVICE_KEY, value);
}

export function readNightMode() {
  try {
    return localStorage.getItem(NIGHT_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeNightMode(enabled) {
  writeItem(NIGHT_MODE_KEY, enabled ? '1' : '0');
}

export function readResolverAvoidText() {
  try {
    return localStorage.getItem(RESOLVER_AVOID_KEY) || DEFAULT_RESOLVER_AVOID;
  } catch {
    return DEFAULT_RESOLVER_AVOID;
  }
}

export function writeResolverAvoidText(value) {
  writeItem(RESOLVER_AVOID_KEY, value);
}

export function splitResolverAvoidWords(value) {
  return String(value || '')
    .split(/[\n,]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}
