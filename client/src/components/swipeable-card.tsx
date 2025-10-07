import { ReactNode } from 'react';
import { useSwipeToDelete } from '@/hooks/useSwipe';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  deleteLabel?: string;
  className?: string;
  enabled?: boolean;
}

export function SwipeableCard({
  children,
  onDelete,
  deleteLabel = 'Deletar',
  className,
  enabled = true,
}: SwipeableCardProps) {
  const { elementRef, swipeDistance, isDeleting, showDeleteButton } = useSwipeToDelete({
    onDelete: onDelete || (() => {}),
    enabled: enabled && !!onDelete,
  });

  if (!onDelete || !enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)} ref={elementRef}>
      {/* Delete button background */}
      <div
        className={cn(
          'absolute top-0 right-0 bottom-0 bg-destructive flex items-center justify-end px-4 transition-all',
          isDeleting && 'animate-pulse'
        )}
        style={{
          width: `${Math.min(swipeDistance, 150)}px`,
          opacity: showDeleteButton ? 1 : 0.5,
        }}
      >
        <div className="flex items-center gap-2 text-destructive-foreground">
          <Trash2 className="w-5 h-5" />
          {swipeDistance > 80 && <span className="text-sm font-medium">{deleteLabel}</span>}
        </div>
      </div>

      {/* Card content */}
      <div
        className="relative bg-card transition-transform"
        style={{
          transform: `translateX(-${Math.min(swipeDistance, 150)}px)`,
          transition: isDeleting || swipeDistance === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Componente para navegação com swipe entre páginas
interface SwipeableViewProps {
  children: ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function SwipeableView({
  children,
  currentIndex,
  onIndexChange,
  className,
}: SwipeableViewProps) {
  const handleSwipeLeft = () => {
    if (currentIndex < children.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  // Vamos implementar isso de forma mais simples com CSS transitions
  return (
    <div className={cn('relative overflow-hidden h-full', className)}>
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {children.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30'
              )}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
