'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HeroSection() {
  const { user, searchQuery, setSearchQuery } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const router = useRouter();

  const handleSearch = () => {
    setSearchQuery(localQuery);
    router.push('/search');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">
            Hey {user?.name || 'there'}! 👋
          </h1>
          <p className="text-xl mb-8 text-orange-100">
            Delicious food delivered to your doorstep
          </p>
          
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search restaurants or dishes..."
                className="pl-10 bg-white text-gray-900 border-0 h-12"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-white text-orange-600 hover:bg-gray-50 h-12 px-6"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}