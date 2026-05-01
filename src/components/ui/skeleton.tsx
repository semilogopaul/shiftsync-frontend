import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-lg bg-muted/70 dark:bg-muted/40', className)}
      {...props}
    />
  );
}

interface SkeletonListProps {
  readonly rows?: number;
  readonly rowClassName?: string;
  readonly className?: string;
}

function SkeletonList({ rows = 5, rowClassName, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn('h-14 w-full', rowClassName)} />
      ))}
    </div>
  );
}

interface SkeletonTextProps {
  readonly lines?: number;
  readonly className?: string;
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-3/5' : 'w-full')} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonList, SkeletonText };
