import api from '@/utils/api';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// 1. Define the Category Interface based on your Django Serializer layout
export interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);



export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch categories from the Django backend
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Category[]>(`categories/`);
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Something went wrong while fetching categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch automatically when the app/provider mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider 
      value={{ 
        categories, 
        isLoading, 
        error, 
        refreshCategories: fetchCategories // Allows manual pulling (e.g., pull-to-refresh)
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// 3. Create a custom hook to quickly tap into this context
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};