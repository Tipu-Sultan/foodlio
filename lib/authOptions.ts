import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail } from '@/lib/server';
import bcrypt from 'bcryptjs';

// Extend the default NextAuth User type
declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone: string; // Add phone
    address?: string; // Add address (optional)
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone: string;
      address?: string;
    };
  }
}

// Extend the JWT token type
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    address?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address || undefined, // Handle optional address
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.address = token.address;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};