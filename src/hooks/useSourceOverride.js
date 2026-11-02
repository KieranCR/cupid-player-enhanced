import { useCallback, useState } from 'react';

/**
 * Lets the user pin (or clear) the YouTube video used to play the current
 * streaming track, then restarts playback so the new source takes effect.
 */
export default function useSourceOverride({
  track,
  trackIndex,
  canChange,
  setStreamTracks,
  restartStream,
  setError,
}) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const reset = useCallback((initialInput) => {
    setInput(initialInput);
    setMessage(null);
  }, []);

  const run = useCallback(async (action) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await action();
      restartStream();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [restartStream, setError]);

  const save = useCallback(async () => {
    if (!canChange || !input.trim()) return;

    await run(async () => {
      const videoId = await window.cupid.saveStreamSource(track.title, track.artist, input.trim());
      setStreamTracks((tracks) => tracks.map((item, index) => (
        index === trackIndex ? { ...item, sourceVideoId: videoId } : item
      )));
      setInput(videoId);
      setMessage('source saved');
    });
  }, [canChange, input, run, setStreamTracks, track, trackIndex]);

  const clear = useCallback(async () => {
    if (!canChange) return;

    await run(async () => {
      await window.cupid.clearStreamSource(track.title, track.artist);
      setStreamTracks((tracks) => tracks.map((item, index) => {
        if (index !== trackIndex) return item;
        const { sourceVideoId, ...rest } = item;
        return rest;
      }));
      setInput(track.videoId || '');
      setMessage('source cleared');
    });
  }, [canChange, run, setStreamTracks, track, trackIndex]);

  return { input, setInput, busy, message, reset, save, clear };
}
