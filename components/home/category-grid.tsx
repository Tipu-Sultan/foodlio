'use client';

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ISerializedCategory } from '@/lib/schema';

interface CategoryGridProps {
  categories: ISerializedCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { selectedCategory, setSelectedCategory } = useAppStore();
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push('/search');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              'flex flex-col items-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-md',
              category.color,
              selectedCategory === category.id && 'ring-2 ring-orange-500'
            )}
          >
            <span className="text-3xl mb-2">{category.icon}</span>
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}