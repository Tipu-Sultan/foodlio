import { HeroSection } from '@/components/home/hero-section';
import { CategoryGrid } from '@/components/home/category-grid';
import { FeaturedRestaurants } from '@/components/home/featured-restaurants';
import { Metadata } from 'next';
import { getCategories, getFeaturedRestaurants } from '@/lib/server';

export const metadata: Metadata = {
  title: 'Foodlio - Order Food Online',
  description: 'Discover and order delicious food from top restaurants with fast delivery to your doorstep.',
  keywords: 'food delivery, online food order, restaurants, Foodlio',
};

export default async function Home() {
  const categories = await getCategories();
  const featuredRestaurants = await getFeaturedRestaurants(4.7);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoryGrid categories={categories} />
      <FeaturedRestaurants restaurants={featuredRestaurants} />
    </div>
  );
}