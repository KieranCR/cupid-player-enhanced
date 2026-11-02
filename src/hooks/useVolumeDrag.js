import { useEffect, useRef, useState } from 'react';
import { clamp01 } from '../utils/format.js';

/** Hover-to-reveal vertical volume bar with click/drag to set volume. */
export default function useVolumeDrag(setVolume) {
  const volumeBarRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => {
      if (!volumeBarRef.current) return;
      const rect = volumeBarRef.current.getBoundingClientRect();
      setVolume(clamp01(1 - (e.clientY - rect.top) / rect.height));
    };
    const onMouseUp = () => {
      setDragging(false);
      setHovered(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, setVolume]);

  return {
    volumeBarRef,
    expanded: hovered || dragging,
    onZoneLeave: () => { if (!dragging) setHovered(false); },
    onIconEnter: () => setHovered(true),
    onBarMouseDown: (e) => {
      e.preventDefault();
      setDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setVolume(clamp01(1 - (e.clientY - rect.top) / rect.height));
    },
  };
}
