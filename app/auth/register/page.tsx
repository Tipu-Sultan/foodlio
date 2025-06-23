import RegisterClient from '@/components/auth/register-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Foodlio',
  description: 'Create a Foodlio account to start ordering delicious food.',
  openGraph: {
    title: 'Register | Foodlio',
    description: 'Create a Foodlio account to start ordering delicious food.',
    url: 'https://yourdomain.com/auth/register',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register | Foodlio',
    description: 'Create a Foodlio account to start ordering delicious food.',
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}