import { describe, expect, it } from 'vitest';
import {
  readInitialSource,
  readInitialStreamTracks,
  readMusicService,
  splitResolverAvoidWords,
} from './storage.js';
import { clamp01, formatCountdown, formatTime } from './utils/format.js';

describe('splitResolverAvoidWords', () => {
  it('splits on commas and newlines, trimming blanks', () => {
    expect(splitResolverAvoidWords('live, remix\ncover,, \n ')).toEqual(['live', 'remix', 'cover']);
  });

  it('handles empty input', () => {
    expect(splitResolverAvoidWords('')).toEqual([]);
    expect(splitResolverAvoidWords(null)).toEqual([]);
  });
});

describe('resume state helpers', () => {
  it('resumes streaming only when stream tracks were saved', () => {
    expect(readInitialSource(null)).toBe('local');
    expect(readInitialSource({ source: 'streaming', streamTracks: [] })).toBe('local');
    expect(readInitialSource({ source: 'streaming', streamTracks: [{ title: 'a' }] })).toBe('streaming');
    expect(readInitialSource({ source: 'local', streamTracks: [{ title: 'a' }] })).toBe('local');
  });

  it('reads saved stream tracks defensively', () => {
    expect(readInitialStreamTracks(null)).toEqual([]);
    expect(readInitialStreamTracks({ streamTracks: 'nope' })).toEqual([]);
    expect(readInitialStreamTracks({ streamTracks: [{ title: 'a' }] })).toEqual([{ title: 'a' }]);
  });

  it('prefers a valid resumed music service and falls back to local', () => {
    expect(readMusicService({ musicService: 'apple' })).toBe('apple');
    expect(readMusicService({ musicService: 'bogus' })).toBe('local');
  });
});

describe('format helpers', () => {
  it('formats playback time', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(65.9)).toBe('1:05');
  });

  it('formats countdowns, rounding up', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(59_001)).toBe('1:00');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('clamps to the unit interval', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(2)).toBe(1);
  });
});
