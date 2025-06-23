'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Truck, Leaf } from 'lucide-react';
import { IRestaurant } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  restaurant: IRestaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.slugId}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-white bg-black/50">
                Closed
              </Badge>
            </div>
          )}
          {restaurant.isVeg && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white">
              <Leaf className="h-3 w-3 mr-1" />
              Pure Veg
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{restaurant.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{restaurant.cuisine}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Truck className="h-4 w-4" />
              <span>₹{restaurant.deliveryFee}</span>
            </div>
          </div>
          
          {restaurant.minOrder > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Min. order: ₹{restaurant.minOrder}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}