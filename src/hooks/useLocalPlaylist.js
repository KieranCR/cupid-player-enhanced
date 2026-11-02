import { useCallback, useEffect, useState } from 'react';

/** Loads playlist.json via the Electron bridge on mount; `reload` re-reads it. */
export default function useLocalPlaylist() {
  const [tracks, setTracks] = useState([]);

  const reload = useCallback(async () => {
    if (!window.cupid?.getLocalPlaylist) return;
    try {
      const loaded = await window.cupid.getLocalPlaylist();
      setTracks(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      console.error('Failed to load local playlist:', err);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { tracks, reload };
}
