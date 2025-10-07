import { useEffect, useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipe,
  threshold = 50,
  enabled = true,
}: SwipeOptions) {
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determina se é um swipe horizontal ou vertical
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        // Swipe horizontal
        if (deltaX > 0) {
          onSwipeRight?.();
          onSwipe?.('right');
        } else {
          onSwipeLeft?.();
          onSwipe?.('left');
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        // Swipe vertical
        if (deltaY > 0) {
          onSwipeDown?.();
          onSwipe?.('down');
        } else {
          onSwipeUp?.();
          onSwipe?.('up');
        }
      }

      setIsSwiping(false);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isSwiping, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    elementRef,
    isSwiping,
  };
}

// Hook para deletar item com swipe (similar ao iOS)
interface SwipeToDeleteOptions {
  onDelete: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeToDelete({
  onDelete,
  threshold = 100,
  enabled = true,
}: SwipeToDeleteOptions) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentX.current = e.changedTouches[0].screenX;
      const deltaX = touchCurrentX.current - touchStartX.current;

      // Apenas permite swipe para a esquerda (deletar)
      if (deltaX < 0) {
        setSwipeDistance(Math.abs(deltaX));
      }
    };

    const handleTouchEnd = () => {
      if (swipeDistance >= threshold) {
        setIsDeleting(true);
        setTimeout(() => {
          onDelete();
          setIsDeleting(false);
          setSwipeDistance(0);
        }, 300);
      } else {
        setSwipeDistance(0);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, swipeDistance, threshold, onDelete]);

  return {
    elementRef,
    swipeDistance,
    isDeleting,
    showDeleteButton: swipeDistance > 50,
  };
}
