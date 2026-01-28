import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const touchStateRef = useRef<TouchState | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStateRef.current) return;

    const touch = e.changedTouches[0];
    const { startX, startY, startTime } = touchStateRef.current;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - startTime;

    // Minimum swipe distance (50px) and maximum time (300ms)
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    // Check if horizontal swipe is dominant (not a scroll)
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    if (
      isHorizontalSwipe &&
      Math.abs(deltaX) >= minSwipeDistance &&
      deltaTime <= maxSwipeTime
    ) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    touchStateRef.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
