import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MobileSkeletonProps {
  count?: number;
  className?: string;
}

export function MobileCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MobileSkeletonList({ count = 5, className }: MobileSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <MobileCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Bottom Navigation Skeleton
export function BottomNavSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 animate-pulse">
      <div className="flex items-center justify-around h-full px-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-12 h-2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Table to Cards Skeleton
export function TableCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {/* Desktop: Table skeleton */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-muted p-4 border-b">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="p-4 border-b last:border-0">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Cards skeleton */}
      <div className="md:hidden">
        <MobileSkeletonList count={count} />
      </div>
    </>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
