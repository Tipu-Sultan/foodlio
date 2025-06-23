import { Metadata } from 'next';
import { getCategories, searchRestaurants, searchMenuItems, getRestaurantById } from '@/lib/server';
import { IRestaurant, IMenuItem, ICategory } from '@/lib/schema';
import SearchClient from '@/components/search/search-client';

interface SearchPageProps {
  searchParams: { q?: string; category?: string };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  const category = searchParams.category || 'all';

  const [restaurants, menuItems] = await Promise.all([
    searchRestaurants(query, category),
    searchMenuItems(query, category),
  ]);

  const title = query
    ? `Search for "${query}" | Foodlio`
    : category !== 'all'
    ? `${category} Restaurants | Foodlio`
    : 'Search Restaurants | Foodlio';
  const description = `Find ${restaurants.length} restaurants and ${menuItems.length} dishes${
    query ? ` matching "${query}"` : ''
  }${category !== 'all' ? ` in the ${category} category` : ''} on Foodlio.`;

  return {
    title,
    description,
    keywords: `food delivery, restaurants, ${query}, ${category}, Foodlio`,
    openGraph: {
      title,
      description,
      url: `https://yourdomain.com/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const category = searchParams.category || 'all';

  const [restaurants, menuItems, categories] = await Promise.all([
    searchRestaurants(query, category),
    searchMenuItems(query, category),
    getCategories(),
  ]);

  // Convert categories to plain objects with _id as string
  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(), // Convert ObjectId to string
  }));

  // Fetch restaurant data for each menu item
  const restaurantIds = [...new Set(menuItems.map((item) => {
    return typeof item.restaurantId === 'string' ? item.restaurantId : item.restaurantId.toString();
  }))];
  const restaurantMap = new Map<string, IRestaurant>();
  for (const id of restaurantIds) {
    try {
      const restaurant = await getRestaurantById(id);
      if (restaurant) {
        restaurantMap.set(id, restaurant);
      } else {
        console.warn(`Restaurant not found for ID: ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching restaurant ID ${id}:`, error);
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        ...restaurants.map((restaurant, index) => ({
          '@type': 'Restaurant',
          position: index + 1,
          name: restaurant.name,
          url: `https://yourdomain.com/restaurant/${restaurant.slugId}`,
          image: restaurant.image,
          servesCuisine: restaurant.cuisine,
        })),
        ...menuItems.map((item, index) => ({
          '@type': 'MenuItem',
          position: index + restaurants.length + 1,
          name: item.name,
          image: item.image,
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'INR',
          },
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SearchClient
        initialQuery={query}
        initialCategory={category}
        restaurants={restaurants}
        menuItems={menuItems}
        categories={serializedCategories} // Use serialized categories
        restaurantMap={restaurantMap}
      />
    </>
  );
}