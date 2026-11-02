import { useEffect, useRef, useState } from 'react';

/**
 * Drives the turntable artwork: spins the record and needle while playing,
 * and on track change runs the swap sequence:
 * needle lifts (0→1→2) → records swap → needle lowers (2→1→0).
 */
export default function useRecordAnimation({ trackTitle, isPlaying, theme, assets }) {
  const [recordFrame, setRecordFrame] = useState(0);
  const [needleFrame, setNeedleFrame] = useState(0);
  const [isPink, setIsPink] = useState(theme === 'pink');
  const [swapping, setSwapping] = useState(false);
  const [needleLifted, setNeedleLifted] = useState(false);
  const [needleChangeFrame, setNeedleChangeFrame] = useState(0);
  // null sentinel = haven't seen any track yet; 'No track' = placeholder while
  // tracks load async. Both should silently set the ref without animating.
  const prevTrackRef = useRef(null);

  const currentFrames = isPink ? assets.recordFramesA : assets.recordFramesB;
  const incomingFrames = isPink ? assets.recordFramesB : assets.recordFramesA;

  // Spin animation while playing
  useEffect(() => {
    if (!isPlaying || swapping) return;
    const interval = setInterval(() => {
      setRecordFrame((f) => (f + 1) % currentFrames.length);
      setNeedleFrame((f) => (f + 1) % assets.needlePlayFrames.length);
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, swapping, currentFrames.length]);

  // Detect song change and trigger swap
  useEffect(() => {
    if (prevTrackRef.current === trackTitle) return;
    const wasInitialOrPlaceholder = prevTrackRef.current === null || prevTrackRef.current === 'No track';
    prevTrackRef.current = trackTitle;
    if (trackTitle === 'No track') return;
    if (wasInitialOrPlaceholder) return;
    if (needleLifted) return;

    setNeedleLifted(true);
    setNeedleChangeFrame(0);

    // Show needle lifted (frame 1 = index 1)
    setTimeout(() => setNeedleChangeFrame(1), 200);

    // Start record swap
    setTimeout(() => setSwapping(true), 400);

    // Finish swap, switch color
    setTimeout(() => {
      setIsPink((p) => !p);
      setRecordFrame(0);
      setSwapping(false);
    }, 1000);

    // Needle lower after swap is done, reset to frame 1
    setTimeout(() => {
      setNeedleChangeFrame(0);
      setNeedleLifted(false);
      setNeedleFrame(0);
    }, 1100);
  }, [trackTitle, needleLifted]);

  return {
    swapping,
    recordSrc: currentFrames[recordFrame],
    incomingRecordSrc: incomingFrames[0],
    needleSrc: needleLifted
      ? assets.needleChangeFrames[needleChangeFrame]
      : assets.needlePlayFrames[needleFrame],
  };
}
