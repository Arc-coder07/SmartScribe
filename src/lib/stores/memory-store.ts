import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type MemoryCategory =
  | 'company'
  | 'services'
  | 'pricing'
  | 'team'
  | 'brand'
  | 'clients'
  | 'preferences';

export interface MemoryEntry {
  id: string;
  user_id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface MemoryState {
  entries: MemoryEntry[];
  isLoading: boolean;
  error: string | null;
}

interface MemoryActions {
  fetchMemory: () => Promise<void>;
  setMemory: (category: MemoryCategory, key: string, value: string) => Promise<MemoryEntry | null>;
  deleteMemory: (id: string) => Promise<void>;
  getByCategory: (category: MemoryCategory) => MemoryEntry[];
  getMemoryContext: () => string;
  bulkSetMemory: (entries: { category: MemoryCategory; key: string; value: string }[]) => Promise<void>;
}

type MemoryStore = MemoryState & MemoryActions;

// ─── Category Labels ────────────────────────────────────────────────────────

export const MEMORY_CATEGORY_META: Record<
  MemoryCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  company: {
    label: 'Company',
    icon: 'Building2',
    color: '#10a37f',
    description: 'Company name, description, website, industry',
  },
  services: {
    label: 'Services',
    icon: 'Layers',
    color: '#10B981',
    description: 'Services offered, capabilities, specializations',
  },
  pricing: {
    label: 'Pricing',
    icon: 'DollarSign',
    color: '#F59E0B',
    description: 'Rates, pricing models, payment terms',
  },
  team: {
    label: 'Team',
    icon: 'Users',
    color: '#3B82F6',
    description: 'Team members, roles, expertise',
  },
  brand: {
    label: 'Brand Voice',
    icon: 'Palette',
    color: '#EC4899',
    description: 'Tone, style, communication preferences',
  },
  clients: {
    label: 'Clients',
    icon: 'UserCheck',
    color: '#12b78e',
    description: 'Past and current client information',
  },
  preferences: {
    label: 'Preferences',
    icon: 'Settings',
    color: '#06B6D4',
    description: 'Document formatting, writing style preferences',
  },
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchMemory: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('memory_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true });

      if (error) throw error;
      set({ entries: (data || []) as MemoryEntry[] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch memory';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setMemory: async (category, key, value) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upsert: insert or update based on user_id + category + key
      const { data, error } = await supabase
        .from('memory_entries')
        .upsert(
          {
            user_id: user.id,
            category,
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category,key' }
        )
        .select()
        .single();

      if (error) throw error;

      const entry = data as MemoryEntry;

      // Update local state
      set((state) => {
        const existing = state.entries.findIndex(
          (e) => e.category === category && e.key === key
        );
        if (existing >= 0) {
          const updated = [...state.entries];
          updated[existing] = entry;
          return { entries: updated };
        }
        return { entries: [...state.entries, entry] };
      });

      return entry;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save memory';
      set({ error: message });
      return null;
    }
  },

  deleteMemory: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));

      const { error } = await supabase.from('memory_entries').delete().eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete memory';
      set({ error: message });
    }
  },

  getByCategory: (category) => {
    return get().entries.filter((e) => e.category === category);
  },

  getMemoryContext: () => {
    const entries = get().entries;
    if (entries.length === 0) return '';

    const grouped = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, MemoryEntry[]>);

    const sections = Object.entries(grouped).map(([category, items]) => {
      const meta = MEMORY_CATEGORY_META[category as MemoryCategory];
      const label = meta?.label || category;
      const lines = items.map((item) => `  - ${item.key}: ${item.value}`).join('\n');
      return `[${label}]\n${lines}`;
    });

    return `=== BUSINESS MEMORY ===\n${sections.join('\n\n')}\n=== END BUSINESS MEMORY ===`;
  },

  bulkSetMemory: async (newEntries) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const rows = newEntries.map((e) => ({
        user_id: user.id,
        category: e.category,
        key: e.key,
        value: e.value,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('memory_entries')
        .upsert(rows, { onConflict: 'user_id,category,key' })
        .select();

      if (error) throw error;

      // Refresh all entries
      await get().fetchMemory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk save memory';
      set({ error: message });
    }
  },
}));
