'use client';

import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <Skeleton className="h-8 w-1/3 mb-8" />

        {/* Loading Cards (mimic order cards or generic content) */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/5 rounded-full" />
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progress Bar Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-2 w-full" />
                  </div>

                  {/* Items Skeleton */}
                  <div>
                    <Skeleton className="h-4 w-1/5 mb-2" />
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/6" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address Skeleton */}
                  <div className="flex items-start space-x-2">
                    <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  {/* Total and Actions Skeleton */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-6 w-1/6" />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}