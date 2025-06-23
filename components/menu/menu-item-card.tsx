'use client';

import Image from 'next/image';
import { Plus, Minus, Leaf, Flame } from 'lucide-react';
import { IMenuItem, IRestaurant } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: IMenuItem;
  restaurant: IRestaurant;
}

export function MenuItemCard({ item, restaurant }: MenuItemCardProps) {
  const { addToCart, updateQuantity, removeFromCart, cart } = useAppStore();

  const cartItem = cart.find((cartItem) => cartItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: item.restaurantId.toString(),
      restaurantName: restaurant.name,
      image: item.image,
      description: item.description,
    });

    toast.success(`Added ${item.name} to cart!`);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
    toast.success(`Updated ${item.name} quantity to ${quantity + 1}`);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      removeFromCart(item.id);
      toast.success(`Removed ${item.name} from cart`);
    } else {
      updateQuantity(item.id, quantity - 1);
      toast.success(`Updated ${item.name} quantity to ${quantity - 1}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
        {item.popular && (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">Popular</Badge>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          {item.isVegetarian && (
            <div className="bg-green-500 rounded-full p-1">
              <Leaf className="h-3 w-3 text-white" />
            </div>
          )}
          {!item.isVegetarian && (
            <div className="bg-red-500 rounded-full p-1">
              <div className="h-3 w-3 bg-red-600 rounded-full"></div>
            </div>
          )}
          {item.isSpicy && (
            <div className="bg-red-500 rounded-full p-1">
              <Flame className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecrement}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleIncrement}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}