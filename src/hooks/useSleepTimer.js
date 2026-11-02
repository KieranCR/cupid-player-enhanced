import { useEffect, useRef, useState } from 'react';

/**
 * Pauses playback after the chosen number of minutes.
 * `timer` is 'off' or a minute count as a string (matches SLEEP_TIMER_OPTIONS).
 */
export default function useSleepTimer(pause) {
  const [timer, setTimer] = useState('off');
  const [endsAt, setEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showCountdown, setShowCountdown] = useState(true);

  const pauseRef = useRef(pause);
  useEffect(() => { pauseRef.current = pause; }, [pause]);

  useEffect(() => {
    if (timer === 'off') {
      setEndsAt(null);
      return;
    }

    const durationMs = Number(timer) * 60 * 1000;
    setEndsAt(Date.now() + durationMs);
    setNow(Date.now());

    const timeout = setTimeout(() => {
      pauseRef.current();
      setTimer('off');
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [timer]);

  // Only tick once a second while the countdown is actually visible.
  useEffect(() => {
    if (!endsAt || !showCountdown) return;

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endsAt, showCountdown]);

  return {
    timer,
    setTimer,
    showCountdown,
    toggleCountdown: () => setShowCountdown((v) => !v),
    remaining: endsAt ? Math.max(0, endsAt - now) : 0,
  };
}
