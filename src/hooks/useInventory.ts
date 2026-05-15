import { useState, useEffect } from 'react';
import type { InventoryItem, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const savedItems = localStorage.getItem('smart-stocker-items');
    if (savedItems) {
      try {
        return JSON.parse(savedItems);
      } catch (e) {
        console.error('Failed to parse items from local storage', e);
      }
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('smart-stocker-categories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        // Migrate old default categories to new default categories
        if (parsed.length === 4 && parsed[0].name === '建材・金物 (EMTEK等)') {
          return DEFAULT_CATEGORIES;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse categories from local storage', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Save to local storage whenever items or categories change
  useEffect(() => {
    localStorage.setItem('smart-stocker-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('smart-stocker-categories', JSON.stringify(categories));
  }, [categories]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  return {
    items,
    categories,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
  };
}
