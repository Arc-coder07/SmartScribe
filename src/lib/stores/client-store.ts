import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
}

interface ClientActions {
  fetchClients: () => Promise<void>;
  addClient: (data: Partial<Client>) => Promise<Client | null>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
}

type ClientStore = ClientState & ClientActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      set({ clients: (data || []) as Client[] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addClient: async (data) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: data.name || '',
          company: data.company || '',
          email: data.email || '',
          phone: data.phone || '',
          notes: data.notes || '',
        })
        .select()
        .single();

      if (error) throw error;
      const client = result as Client;
      set((state) => ({ clients: [...state.clients, client] }));
      return client;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add client';
      set({ error: message });
      return null;
    }
  },

  updateClient: async (id, updates) => {
    const supabase = createClient();
    try {
      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));

      const { error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      set({ error: message });
    }
  },

  deleteClient: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));

      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      set({ error: message });
    }
  },

  getClient: (id) => get().clients.find((c) => c.id === id),
}));
