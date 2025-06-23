import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRestaurantById, getMenuItemsByRestaurant } from '@/lib/server';
import { IRestaurant, IMenuItem } from '@/lib/schema';
import RestaurantClient from '@/components/restaurant/restaurant-client';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slugId = params.id;
  const restaurant = await getRestaurantById(slugId);

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found | Foodlio',
      description: 'The restaurant you are looking for does not exist.',
    };
  }

  return {
    title: `${restaurant.name} | Foodlio`,
    description: `${restaurant.description} Order from ${restaurant.name} for fast delivery. Cuisine: ${restaurant.cuisine}, Rating: ${restaurant.rating}/5.`,
    keywords: `${restaurant.name}, ${restaurant.cuisine}, food delivery, restaurant, Foodlio`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description,
      images: [{ url: restaurant.image }],
      url: `https://yourdomain.com/restaurant/${restaurant.slugId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.name,
      description: restaurant.description,
      images: [restaurant.image],
    },
  };
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const slugId = params.id;
  const [restaurant, menuItems] = await Promise.all([
    getRestaurantById(slugId),
    getMenuItemsByRestaurant(slugId),
  ]);

  if (!restaurant) {
    notFound();
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    image: restaurant.image,
    telephone: restaurant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
    },
    servesCuisine: restaurant.cuisine,
    priceRange: `₹${restaurant.minOrder}-₹${restaurant.minOrder + 500}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: restaurant.rating,
      reviewCount: Math.floor(Math.random() * 100) + 50,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      opens: restaurant.isOpen ? '00:00' : undefined,
      closes: restaurant.isOpen ? '23:59' : undefined,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RestaurantClient restaurant={restaurant} menuItems={menuItems} />
    </>
  );
}