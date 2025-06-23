import { Metadata } from 'next';
import LoginClient from '@/components/auth/login-client';

export const metadata: Metadata = {
  title: 'Login | Foodlio',
  description: 'Sign in to your Foodlio account to order delicious food.',
  openGraph: {
    title: 'Login | Foodlio',
    description: 'Sign in to your Foodlio account to order delicious food.',
    url: 'https://yourdomain.com/auth/login',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login | Foodlio',
    description: 'Sign in to your Foodlio account to order delicious food.',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}