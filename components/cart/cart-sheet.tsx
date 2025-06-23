'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { CartItem } from './cart-item';
import { ShoppingBag, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CartSheet() {
  const { 
    isCartOpen, 
    setCartOpen, 
    cart, 
    getCartTotal, 
    getCartItemsCount,
    isAuthenticated 
  } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Avoid rendering until client is ready
  if (!isClient) {
    return null;
  }

  const total = getCartTotal();
  const itemsCount = getCartItemsCount();

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      setCartOpen(false);
      return;
    }
    
    router.push('/checkout');
    setCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-[90vw] max-w-[400px] sm:max-w-[450px] md:max-w-[500px] p-4 sm:p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <ShoppingBag className="h-5 w-5" />
            <span>Your Cart ({itemsCount})</span>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)] text-center px-4">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-sm sm:text-base text-gray-500">Add some delicious items to get started!</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto py-2 sm:py-4 px-2 sm:px-0">
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="border-t pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>₹49.00</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{(total * 0.05).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{(total + 49 + total * 0.05).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base" 
                size="lg"
                onClick={handleCheckout}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartSheet; 