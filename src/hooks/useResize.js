import { useCallback } from 'react';

/** Mouse-down handler for a custom frameless-window resize handle. */
export default function useResize(corner) {
  return useCallback((e) => {
    e.preventDefault();
    window.cupid?.resizeStart({ x: e.screenX, y: e.screenY, corner });

    const onMouseMove = (e) => {
      window.cupid?.resize({ x: e.screenX, y: e.screenY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.cupid?.resizeEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [corner]);
}
