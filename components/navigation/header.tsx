"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Bell,
  ShoppingCart,
  Home,
  Heart,
  ShoppingBag,
  User,
  LogIn,
  LogOut,
  UtensilsCrossed,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

// Define type for navigation items
interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

// Define type for CartSheet component
import type { ComponentType } from "react";
const CartSheet: ComponentType = dynamic(
  () => import("@/components/cart/cart-sheet").then((mod) => mod.default),
  { ssr: false }
);

export function Header() {
  const { user, getCartItemsCount, setCartOpen, setUser } = useAppStore();
  const { data: session, status } = useSession();
  const cartItemsCount = getCartItemsCount();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Set client-side flag and update cart count
  useEffect(() => {
    setIsClient(true);
  }, [cartItemsCount]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  // Navigation items (center nav, excluding auth items)
  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/restaurant", icon: UtensilsCrossed, label: "Restaurant" },
  ];

  // Authentication navigation items (for dropdown)
  const authItem: NavItem[] =
    status === "authenticated"
      ? [
          { href: "/favorites", icon: Heart, label: "Favorites" },
          { href: "/orders", icon: ShoppingBag, label: "Orders" },
          { href: "/profile", icon: User, label: "Profile" },
          {
            href: "#logout",
            icon: LogOut,
            label: "Logout",
            onClick: handleLogout,
          },
        ]
      : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: Logo and Delivery Address */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-orange-600">
                Foodlio
              </Link>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Deliver to</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {user?.address || "Set delivery address"}
                </div>
              </div>
            </div>

            {/* Center Section: Navigation Links (Tablet and Desktop) */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors relative",
                      isActive
                        ? "text-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              {isClient && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </Button>
              )}
              {/* Authentication Actions */}
              {status === "authenticated" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                        {user?.name || "Profile"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {authItem.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            onClick={item.onClick}
                            className="flex items-center space-x-2 w-full"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="h-5 w-5 mr-1 text-gray-600" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" size="sm">
                      <User className="h-5 w-5 mr-1 text-orange-600" />
                      <span className="hidden sm:inline">Register</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
