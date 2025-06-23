'use client';

import Image from 'next/image';
import { Star, Clock, Truck, MapPin, Phone, Leaf } from 'lucide-react';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IRestaurant, IMenuItem } from '@/lib/schema';
import BackButton from '../navigation/back-button';

interface RestaurantClientProps {
  restaurant: IRestaurant;
  menuItems: IMenuItem[];
}

export default function RestaurantClient({ restaurant, menuItems }: RestaurantClientProps) {
  // Group menu items by category
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));
  const menuByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = menuItems.filter((item) => item.category === category);
      return acc;
    },
    {} as Record<string, IMenuItem[]>,
  );

  return (
    <div className="min-h-screen">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              {!restaurant.isOpen && (
                <Badge variant="secondary" className="bg-red-500 text-white">
                  Closed
                </Badge>
              )}
              {restaurant.isVeg && (
                <Badge className="bg-green-500 text-white">
                  <Leaf className="h-3 w-3 mr-1" />
                  Pure Veg
                </Badge>
              )}
            </div>
            <p className="text-lg text-gray-200 mb-4">{restaurant.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>₹{restaurant.deliveryFee} delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Info */}
        <BackButton />
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Restaurant Info</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Delivery Info</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Delivery time: {restaurant.deliveryTime}</p>
                <p>Delivery fee: ₹{restaurant.deliveryFee}</p>
                <p>Minimum order: ₹{restaurant.minOrder}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>

          {categories.length === 0 ? (
            <p className="text-gray-600">No menu items available.</p>
          ) : (
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuByCategory[category].map((item) => (
                      <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}