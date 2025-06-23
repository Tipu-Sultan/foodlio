import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { Toaster } from '@/components/ui/sonner';
import ClientProvider from './ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Foodie Express - Food Delivery App',
  description: 'Delicious food delivered to your doorstep',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <ClientProvider>
          <Header />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
          </ClientProvider>
        </div>
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}