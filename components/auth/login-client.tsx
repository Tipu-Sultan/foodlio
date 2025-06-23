'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

export default function LoginClient() {
  const { loginForm, setLoginFormField, resetLoginForm, setUser, isAuthLoading, setAuthLoading } =
    useAppStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setAuthLoading(false);
        return;
      }

      const response = await fetch('/api/auth/session');
      const session = await response.json();
      if (session?.user) {
        setUser({
          _id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone,
          address: session.user.address,
        });
        toast.success('Welcome back!');
        resetLoginForm();
        router.push('/');
      } else {
        toast.error('Failed to fetch user data');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue ordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginFormField('email', e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginFormField('password', e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 text-orange-600 hover:text-orange-700"
                  onClick={() => router.push('/auth/register')}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}