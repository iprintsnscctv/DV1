import React from 'react';
import { LayoutGrid, Home, Bed, Building } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    { id: 'All', label: 'All', icon: LayoutGrid },
    { id: 'Family Suites', label: 'Family Suites', icon: Home },
    { id: 'Studio Rooms', label: 'Studio Rooms', icon: Bed },
    { id: 'Lofts', label: 'Lofts', icon: Building },
  ];

  return (
    <div className="flex items-center justify-center gap-2.5 flex-wrap mb-8">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 shadow-md shadow-amber-600/25 scale-102 font-bold'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
