import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image: string;
  description?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "on-the-way" | "delivered";
  createdAt: Date;
  deliveryAddress: string;
  restaurantId: string;
  restaurantName: string;
  estimatedDelivery?: string;
  trackingSteps?: {
    step: string;
    completed: boolean;
    time?: string;
  }[];
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface CheckoutForm {
  deliveryAddress: string;
  paymentMethod: "card" | "upi" | "cash";
}

interface AppState {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  loginForm: LoginForm;
  setLoginFormField: (field: keyof LoginForm, value: string) => void;
  resetLoginForm: () => void;
  registerForm: RegisterForm;
  setRegisterFormField: (field: keyof RegisterForm, value: string) => void;
  resetRegisterForm: () => void;
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
  checkoutForm: CheckoutForm;
  setCheckoutFormField: (field: keyof CheckoutForm, value: string) => void;
  resetCheckoutForm: () => void;
  isCheckoutProcessing: boolean;
  setCheckoutProcessing: (processing: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          set({
            cart: cart.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
      },
      removeFromCart: (itemId) => {
        set({ cart: get().cart.filter((item) => item.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getCartItemsCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => get().user !== null,
      orders: [],
      addOrder: (order) => {
        const orderWithTracking = {
          ...order,
          estimatedDelivery: new Date(
            Date.now() + 35 * 60 * 1000
          ).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          trackingSteps: [
            {
              step: "Order Placed",
              completed: true,
              time: new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            { step: "Restaurant Confirmed", completed: false },
            { step: "Food Being Prepared", completed: false },
            { step: "Out for Delivery", completed: false },
            { step: "Delivered", completed: false },
          ],
        };
        set({ orders: [orderWithTracking, ...get().orders] });
      },
      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) => {
            if (order.id === orderId) {
              const updatedSteps = order.trackingSteps?.map((step, index) => {
                const statusIndex = [
                  "pending",
                  "confirmed",
                  "preparing",
                  "on-the-way",
                  "delivered",
                ].indexOf(status);
                return {
                  ...step,
                  completed: index <= statusIndex,
                  time:
                    index === statusIndex
                      ? new Date().toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : step.time,
                };
              });
              return { ...order, status, trackingSteps: updatedSteps };
            }
            return order;
          }),
        });
      },
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      selectedCategory: "all",
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      loginForm: { email: "", password: "" },
      setLoginFormField: (field, value) =>
        set((state) => ({
          loginForm: { ...state.loginForm, [field]: value },
        })),
      resetLoginForm: () => set({ loginForm: { email: "", password: "" } }),
      registerForm: {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      },
      setRegisterFormField: (field, value) =>
        set((state) => ({
          registerForm: { ...state.registerForm, [field]: value },
        })),
      resetRegisterForm: () =>
        set({
          registerForm: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          },
        }),
      isAuthLoading: false,
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),
      checkoutForm: { deliveryAddress: "", paymentMethod: "card" },
      setCheckoutFormField: (field, value) =>
        set((state) => ({
          checkoutForm: { ...state.checkoutForm, [field]: value },
        })),
      resetCheckoutForm: () =>
        set({ checkoutForm: { deliveryAddress: "", paymentMethod: "card" } }),
      isCheckoutProcessing: false,
      setCheckoutProcessing: (processing) =>
        set({ isCheckoutProcessing: processing }),
    }),
    {
      name: "foodie-express-storage",
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
      }),
    }
  )
);