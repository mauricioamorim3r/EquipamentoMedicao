import { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  enabled = true
}: PullToRefreshProps) {
  const { containerRef, isPulling, isRefreshing, pullDistance, isTriggered } =
    usePullToRefresh({ onRefresh, enabled });

  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = (pullDistance / 80) * 360;

  return (
    <div ref={containerRef} className={cn("relative overflow-y-auto", className)}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50 transition-all"
        style={{
          height: `${Math.min(pullDistance, 80)}px`,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="bg-card rounded-full p-2 shadow-lg">
          <Loader2
            className={cn(
              "w-6 h-6 text-primary transition-all",
              isRefreshing && "animate-spin"
            )}
            style={{
              opacity,
              transform: isRefreshing ? 'rotate(0deg)' : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: isPulling || isRefreshing
            ? `translateY(${Math.min(pullDistance, 80)}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
