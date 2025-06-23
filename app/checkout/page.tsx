import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import CheckoutClient from '@/components/checkout/checkout-client';

export const metadata: Metadata = {
  title: 'Checkout | Foodlio',
  description: 'Complete your order on Foodlio.',
  openGraph: {
    title: 'Checkout | Foodlio',
    description: 'Complete your order on Foodlio.',
    url: 'https://yourdomain.com/checkout',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkout | Foodlio',
    description: 'Complete your order on Foodlio.',
  },
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }

  return <CheckoutClient userId={session.user.id} />;
}