'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { isAuthenticated } = useAppStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);

  // Ensure client-side rendering and check auth status
  useEffect(() => {
    setIsClient(true);
    setAuthStatus(isAuthenticated());
  }, [isAuthenticated]);

  // Avoid rendering until client is ready
  if (!isClient) {
    return null; // or a loading placeholder
  }

  if (!authStatus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your favorites</p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Favorite Restaurants</h1>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">Save your favorite restaurants to quickly access them later</p>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Explore Restaurants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}