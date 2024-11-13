import { useCallback, useRef } from 'react';

export const useLongPress = (
  callback: () => void,
  ms: number = 500
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent text selection specifically for touch events
    if ('touches' in e) {
      (e.target as HTMLElement).style.userSelect = 'none';
    }

    timeoutRef.current = setTimeout(callback, ms);
  }, [callback, ms]);

  const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset user-select after touch
    if ('touches' in e) {
      (e.target as HTMLElement).style.userSelect = '';
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};