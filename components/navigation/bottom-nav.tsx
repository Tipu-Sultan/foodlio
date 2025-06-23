'use client';

import { Home, Search, ShoppingBag, User, Heart, LogIn, LogOut, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Define interface for navigation items
interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void; // Optional onClick
}

export function BottomNav() {
  const pathname = usePathname();
  const { getCartItemsCount, setUser } = useAppStore();
  const { data: session, status } = useSession();
  const cartItemsCount = getCartItemsCount();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navItems : NavItem[]= [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    // Dynamic auth item added below
  ];

  const authItem : NavItem[]= status === 'authenticated'
    ? [
        { href: '/favorites', icon: Heart, label: 'Favorites' },
        { href: '/orders', icon: ShoppingBag, label: 'Orders' },
        { href: '/profile', icon: User, label: 'Profile' },
        { href: '#logout', icon: LogOut, label: 'Logout', onClick: handleLogout },
      ]
    : [
        { href: '/auth/login', icon: LogIn, label: 'Login' },
        { href: '/auth/register', icon: User, label: 'Register' },
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {[...navItems, ...authItem].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isOrders = item.href === '/orders';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors relative',
                isActive
                  ? 'text-orange-600'
                  : 'text-gray-500 hover:text-gray-700',
                item.href === '#logout' && 'cursor-pointer'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}