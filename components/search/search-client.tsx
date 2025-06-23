'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { IRestaurant, IMenuItem, ICategory, ISerializedCategory } from '@/lib/schema';

interface SearchClientProps {
  initialQuery: string;
  initialCategory: string;
  restaurants: IRestaurant[];
  menuItems: IMenuItem[];
  categories: ISerializedCategory[]; // Use new interface
  restaurantMap: Map<string, IRestaurant>;
}

export default function SearchClient({
  initialQuery,
  initialCategory,
  restaurants,
  menuItems,
  categories,
  restaurantMap,
}: SearchClientProps) {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useAppStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localQuery, setLocalQuery] = useState(searchQuery || initialQuery);

  // Initialize category
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    if (categories.some(cat => cat.id === categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams, categories, setSelectedCategory]);



  const handleSearch = () => {
    setSearchQuery(localQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (localQuery) {
      params.set('q', localQuery);
    } else {
      params.delete('q');
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId !== 'all') {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search restaurants or dishes..."
              className="pl-10 h-12 text-base sm:h-14 sm:text-lg rounded-md border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="Search restaurants or dishes"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-12 sm:h-14 px-6 text-base sm:text-lg bg-orange-500 hover:bg-orange-600 rounded-md w-full sm:w-auto"
            aria-label="Submit search"
          >
            Search
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 mt-4 mb-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Categories:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'secondary'}
              className={`cursor-pointer transition-colors text-sm py-1 px-3 ${
                selectedCategory === category.id ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-gray-200'
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : `${
                  categories.find((c) => c.id === selectedCategory)?.name || 'All'
                } category`}
          </h2>
          <p className="text-gray-600 text-sm">
            Found {restaurants.length} restaurants and {menuItems.length} dishes
          </p>
        </div>
      )}

      <Tabs defaultValue="restaurants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="restaurants">
            Restaurants ({restaurants.length})
          </TabsTrigger>
          <TabsTrigger value="dishes">
            Dishes ({menuItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants">
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dishes">
          {menuItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {menuItems.map((item) => {
                const restaurantId = typeof item.restaurantId === 'string' ? item.restaurantId : item.restaurantId.toString();
                const restaurant = restaurantMap.get(restaurantId)!;
                return (
                  <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}