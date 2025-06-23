'use client';

import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { IRestaurant } from '@/lib/schema';
import Link from 'next/link';

interface FeaturedRestaurantsProps {
  restaurants: IRestaurant[];
}

export function FeaturedRestaurants({ restaurants }: FeaturedRestaurantsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Restaurants</h2>
        <Link href={'/restaurant'} className="text-orange-600 font-medium hover:text-orange-700">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}