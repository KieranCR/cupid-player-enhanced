import { useEffect, useRef, useState } from 'react';
import { clamp01 } from '../utils/format.js';

/** Click/drag seeking on the progress bar, plus the star hover state. */
export default function useSeekDrag(seek) {
  const seekRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [starHovered, setStarHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(null);

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => {
      const rect = seekRef.current.getBoundingClientRect();
      const pct = clamp01((e.clientX - rect.left) / rect.width);
      setHoverProgress(pct);
      seek(pct);
    };
    const onMouseUp = () => {
      setDragging(false);
      setStarHovered(false);
      setHoverProgress(null);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, seek]);

  return {
    seekRef,
    starHovered,
    hoverProgress,
    handlers: {
      onMouseEnter: () => setStarHovered(true),
      onMouseLeave: () => { if (!dragging) setStarHovered(false); },
      onMouseDown: (e) => {
        e.preventDefault();
        setDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = clamp01((e.clientX - rect.left) / rect.width);
        setHoverProgress(pct);
        seek(pct);
      },
    },
  };
}
