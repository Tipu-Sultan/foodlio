"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Clock,
  MapPin,
  Package,
  CheckCircle,
  Truck,
  Eye,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore, Order, CartItem } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { OrderSkeleton } from "./render-skeleton";
import { Progress } from "./client-progress";


const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  preparing: <Package className="h-4 w-4" />,
  "on-the-way": <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  "on-the-way": "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
};

const OrdersPage = () => {
  const { user, isAuthenticated, addOrder, addToCart, clearCart } =
    useAppStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const response = await fetch(`/api/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  trackingSteps: data.order.trackingSteps,
                }
              : order
          )
        );
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus.replace("-", " ")}`,
        });
      } else {
        throw new Error(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const simulateOrderProgress = (orderId: string) => {
    const order: Order | undefined = orders.find((o) => o.id === orderId);
    if (!order) return;

    const statusFlow: Order["status"][] = [
      "pending",
      "confirmed",
      "preparing",
      "on-the-way",
      "delivered",
    ];
    const currentIndex = statusFlow.indexOf(order.status);

    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      updateOrderStatus(orderId, nextStatus);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated() || !user) {
      setIsLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        if (!user) {
          return;
        }
        const response = await fetch(`/api/orders?userId=${user._id}`);
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
          data.orders.forEach((order: Order) => addOrder(order));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated, user, addOrder]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.filter((order) => order.id !== orderId));
        toast({
          title: "Success",
          description: "Order canceled successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OrderSkeleton />
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your orders
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              When you place your first order, it will appear here
            </p>
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Start Ordering
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getProgressValue = (status: Order["status"] | undefined): number => {
    if (!status) return 0;
    const statusMap: Record<Order["status"], number> = {
      pending: 20,
      confirmed: 40,
      preparing: 60,
      "on-the-way": 80,
      delivered: 100,
    };
    return statusMap[status] || 0;
  };

  const handleReorder = async (order: Order) => {
    try {
      clearCart();
      order.items.forEach((item) => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          image: item.image || "",
          description: item.description,
        });
        for (let i = 1; i < item.quantity; i++) {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            restaurantId: order.restaurantId,
            restaurantName: order.restaurantName,
            image: item.image || "",
            description: item.description,
          });
        }
      });
      router.push("/checkout");
      toast({
        title: "Success",
        description: "Items added to cart for reorder",
      });
    } catch (error) {
      console.error("Error reordering:", error);
      toast({
        title: "Error",
        description: "Failed to process reorder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Order History</h1>

        <div className="space-y-6">
          {orders?.map((order) => (
            <Card key={order?.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order?.id}</CardTitle>
                  <Badge className={statusColors[order.status]}>
                    {statusIcons[order.status]}
                    <span className="ml-1 capitalize">
                      {order?.status.replace("-", " ")}
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                  </span>
                  <span>•</span>
                  <span>{order?.restaurantName}</span>
                  {order?.estimatedDelivery && order.status !== "delivered" && (
                    <>
                      <span>•</span>
                      <span>ETA: {order?.estimatedDelivery}</span>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {order?.status && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Order Progress</span>
                        <span>{getProgressValue(order?.status)}%</span>
                      </div>
                      <Progress value={getProgressValue(order?.status)} className="h-2" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order?.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {order?.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{order?.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Track Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Order Tracking</DialogTitle>
                        </DialogHeader>
                        {selectedOrder ? (
                          <div className="space-y-4">
                            <div className="text-center">
                              <h3 className="font-semibold">
                                Order #{selectedOrder?.id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {selectedOrder?.restaurantName}
                              </p>
                              {selectedOrder?.estimatedDelivery &&
                                selectedOrder?.status !== "delivered" && (
                                  <p className="text-sm text-orange-600 font-medium">
                                    ETA: {selectedOrder?.estimatedDelivery}
                                  </p>
                                )}
                            </div>

                            <div className="space-y-3">
                              {selectedOrder?.trackingSteps?.map(
                                (step, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center space-x-3 ${
                                      step.completed
                                        ? "text-green-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        step.completed
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {step.step}
                                      </p>
                                      {step.time && (
                                        <p className="text-xs text-gray-500">
                                          {format(
                                            new Date(step.time),
                                            "MMM d, yyyy • h:mm a"
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            No order selected
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </Button>

                    {order?.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Rate Order
                      </Button>
                    )}

                    {(order.status === "pending" ||
                      order.status === "confirmed" ||
                      order.status === "preparing") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Order
                      </Button>
                    )}

                    {order.status !== "delivered" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => simulateOrderProgress(order.id)}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Simulate Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
