import React from 'react';
import { ProductCardSkeleton, Skeleton } from '../design-system/Skeleton';

export const MenuSkeleton: React.FC = () => (
  <div className="space-y-6 p-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  </div>
);