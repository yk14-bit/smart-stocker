import { useState, useEffect } from 'react';
import type { InventoryItem, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../types';
import { supabase } from '../services/supabase';

// Helper functions to map between UI types and Supabase column names
function mapToSupabaseItem(item: InventoryItem) {
  return {
    id: item.id,
    image_url: item.imageUrl,
    name: item.name,
    category_id: item.categoryId,
    status: item.status,
    estimated_price: item.estimatedPrice,
    actual_price: item.actualPrice,
    description: item.description,
    quantity: item.quantity || 1,
    ai_analysis: item.aiAnalysis || [],
    created_at: item.createdAt,
  };
}

function mapFromSupabaseItem(row: any): InventoryItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    categoryId: row.category_id,
    status: row.status,
    estimatedPrice: row.estimated_price,
    actualPrice: row.actual_price,
    description: row.description,
    quantity: row.quantity,
    aiAnalysis: row.ai_analysis,
    createdAt: row.created_at,
  };
}

export function useInventory(userId: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        // Fetch categories
        let { data: catData, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;

        let activeCategories = catData || [];

        // If categories are empty (first run), insert defaults with unique IDs
        if (activeCategories.length === 0) {
          const uniqueDefaults = DEFAULT_CATEGORIES.map((cat) => ({
            id: `${userId}-${cat.id}`,
            name: cat.name,
          }));

          const { data: newCats, error: insertCatError } = await supabase
            .from('categories')
            .insert(uniqueDefaults)
            .select();
            
          if (insertCatError) throw insertCatError;
          activeCategories = newCats || [];
        }
        setCategories(activeCategories);

        // Fetch items
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (itemError) throw itemError;

        let activeItems = (itemData || []).map(mapFromSupabaseItem);

        // Migration logic: check if local storage has items and we haven't migrated
        const localItemsStr = localStorage.getItem('smart-stocker-items');
        if (localItemsStr) {
          try {
            const localItems: InventoryItem[] = JSON.parse(localItemsStr);
            if (localItems.length > 0) {
              console.log('Migrating local items to Supabase...', localItems);
              const { error: migrationError } = await supabase
                .from('items')
                .insert(localItems.map(mapToSupabaseItem));
              
              if (!migrationError) {
                // Fetch again to ensure we have the correct server state
                const { data: migratedData } = await supabase
                  .from('items')
                  .select('*')
                  .order('created_at', { ascending: false });
                
                activeItems = (migratedData || []).map(mapFromSupabaseItem);
              } else {
                console.error('Migration failed:', migrationError);
              }
            }
          } catch (e) {
            console.error('Error parsing local items during migration', e);
          } finally {
            // Remove from local storage so we don't migrate again
            localStorage.removeItem('smart-stocker-items');
            localStorage.removeItem('smart-stocker-categories');
          }
        }

        setItems(activeItems);
      } catch (err) {
        console.error('Error initializing data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(), // or crypto.randomUUID()
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setItems((prev) => [newItem, ...prev]);

    // DB update
    const { error } = await supabase.from('items').insert([mapToSupabaseItem(newItem)]);
    if (error) {
      console.error('Error adding item to Supabase:', error);
      // Revert on error if needed
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    // Filter out undefined keys for Supabase update payload
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.estimatedPrice !== undefined) payload.estimated_price = updates.estimatedPrice;
    if (updates.actualPrice !== undefined) payload.actual_price = updates.actualPrice;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.aiAnalysis !== undefined) payload.ai_analysis = updates.aiAnalysis;

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('items').update(payload).eq('id', id);
      if (error) console.error('Error updating item in Supabase:', error);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic UI update
    setItems((prev) => prev.filter((item) => item.id !== id));

    // DB update
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('Error deleting item from Supabase:', error);
    }
  };

  const addCategory = async (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    
    // Optimistic UI update
    setCategories((prev) => [...prev, newCategory]);

    // DB update
    const { error } = await supabase.from('categories').insert([newCategory]);
    if (error) {
      console.error('Error adding category to Supabase:', error);
    }
  };

  return {
    items,
    categories,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
  };
}
