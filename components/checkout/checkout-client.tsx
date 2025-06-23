'use client';

import { MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import BackButton from '../navigation/back-button';

export default function CheckoutClient({ userId }: { userId: string }) {
  const {
    user,
    cart,
    getCartTotal,
    clearCart,
    addOrder,
    checkoutForm,
    setCheckoutFormField,
    resetCheckoutForm,
    isCheckoutProcessing,
    setCheckoutProcessing,
  } = useAppStore();
  const router = useRouter();
  const { data: session } = useSession();

  const subtotal = getCartTotal();
  const deliveryFee = 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + gst;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);

  // Initialize delivery address from user
  useEffect(() => {
    if (user?.address && !checkoutForm.deliveryAddress) {
      setCheckoutFormField('deliveryAddress', user.address);
    }
  }, [user, checkoutForm.deliveryAddress, setCheckoutFormField]);

  const handlePlaceOrder = async () => {
    if (!checkoutForm.deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setCheckoutProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          restaurantId: cart[0].restaurantId,
          restaurantName: cart[0].restaurantName,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total,
          deliveryAddress: checkoutForm.deliveryAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      const newOrder = {
        id: data.order.id,
        items: cart,
        total,
        status: 'pending' as const,
        createdAt: new Date(),
        deliveryAddress: checkoutForm.deliveryAddress,
        restaurantId: cart[0].restaurantId,
        restaurantName: cart[0].restaurantName,
      };

      addOrder(newOrder);
      clearCart();
      resetCheckoutForm();
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setCheckoutProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BackButton/>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={checkoutForm.deliveryAddress}
                    onChange={(e) => setCheckoutFormField('deliveryAddress', e.target.value)}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={checkoutForm.paymentMethod}
                  onValueChange={(value) => setCheckoutFormField('paymentMethod', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash on Delivery</Label>
                  </div>
                </RadioGroup>

                {checkoutForm.paymentMethod === 'card' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutForm.paymentMethod === 'upi' && (
                  <div className="mt-4">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" placeholder="yourname@upi" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Estimated Delivery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-900">25-35 minutes</p>
                <p className="text-sm text-gray-600">We'll update you with the exact time</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x ₹{item.price}
                        </p>
                      </div>
                      <span className="font-medium">₹{(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isCheckoutProcessing}
                >
                  {isCheckoutProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}