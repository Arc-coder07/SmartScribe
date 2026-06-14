import { create } from 'zustand';
import type { Document, DocumentType, DocumentStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface DocumentFilters {
  type: DocumentType | 'all';
  status: DocumentStatus | 'all';
  search: string;
}

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  filters: DocumentFilters;
  isLoading: boolean;
  error: string | null;
}

interface DocumentActions {
  fetchDocuments: () => Promise<void>;
  getActiveDocument: () => Document | undefined;
  addDocument: (document: Partial<Document>) => Promise<Document | null>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setActiveDocument: (id: string | null) => void;
  setFilters: (filters: Partial<DocumentFilters>) => void;
}

type DocumentStore = DocumentState & DocumentActions;

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  filters: {
    type: 'all',
    status: 'all',
    search: '',
  },
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const mappedData = data.map((d: any) => ({
        ...d,
        healthScore: d.health_score || { overall: 0, professionalism: 0, readability: 0, completeness: 0, conversion: 0, suggestions: [] },
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        wordCount: d.content ? d.content.split(/\\s+/).filter(Boolean).length : 0,
        gaps: d.metadata?.gaps || [],
        versions: d.metadata?.versions || [],
        comments: d.metadata?.comments || [],
        excerpt: d.metadata?.excerpt || '',
      }));
      set({ documents: mappedData });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  getActiveDocument: () => {
    const { documents, activeDocumentId } = get();
    return documents.find((d) => d.id === activeDocumentId);
  },

  addDocument: async (docData) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({ ...docData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = {
        ...data,
        healthScore: data.health_score || { overall: 0, professionalism: 0, readability: 0, completeness: 0, conversion: 0, suggestions: [] },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        wordCount: data.content ? data.content.split(/\\s+/).filter(Boolean).length : 0,
        gaps: data.metadata?.gaps || [],
        versions: data.metadata?.versions || [],
        comments: data.metadata?.comments || [],
        excerpt: data.metadata?.excerpt || '',
      };
      
      set((state) => ({ documents: [mappedData as any, ...state.documents] }));
      return mappedData as any;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  updateDocument: async (id, updates) => {
    const supabase = createClient();
    try {
      // Optimistic update
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
      }));

      const { error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      // In a robust app, we'd roll back here
    }
  },

  deleteDocument: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
      }));

      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
}));
