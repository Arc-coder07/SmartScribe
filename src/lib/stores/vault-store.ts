import { create } from 'zustand';
import type { VaultEntry } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface VaultState {
  entries: VaultEntry[];
  searchQuery: string;
  activeCategory: string;
  isLoading: boolean;
  error: string | null;
}

interface VaultActions {
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Partial<VaultEntry>) => Promise<VaultEntry | null>;
  updateEntry: (id: string, updates: Partial<VaultEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
}

type VaultStore = VaultState & VaultActions;

export const useVaultStore = create<VaultStore>((set, get) => ({
  entries: [],
  searchQuery: '',
  activeCategory: 'all',
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vault_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ entries: data as any[] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vault_entries')
        .insert({ ...entryData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ entries: [data as any, ...state.entries] }));
      return data as any;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  updateEntry: async (id, updates) => {
    const supabase = createClient();
    try {
      // Optimistic update
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        ),
      }));

      const { error } = await supabase
        .from('vault_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteEntry: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));

      const { error } = await supabase.from('vault_entries').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
}));
