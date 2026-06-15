import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { DocumentType, Template } from '@/lib/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TemplateState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
}

interface TemplateActions {
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: Partial<Template>) => Promise<Template | null>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<Template | null>;
  incrementUsage: (id: string) => Promise<void>;
}

type TemplateStore = TemplateState & TemplateActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch both system templates and user templates
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .order('is_featured', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((t: Record<string, unknown>) => ({
        id: t.id as string,
        name: t.name as string,
        description: t.description as string || '',
        type: t.type as DocumentType,
        category: t.category as string || 'Custom',
        content: t.content as string || '',
        tags: t.tags as string[] || [],
        usageCount: t.usage_count as number || 0,
        isFeatured: t.is_featured as boolean || false,
        isUserCreated: !(t.is_system as boolean),
        createdAt: t.created_at as string,
      }));

      set({ templates: mapped });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (data) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const row = {
        user_id: user.id,
        name: data.name || 'Untitled Template',
        description: data.description || '',
        type: data.type || 'proposal',
        category: data.category || 'Custom',
        content: data.content || '',
        tags: data.tags || [],
        is_featured: false,
        is_system: false,
      };

      const { data: result, error } = await supabase
        .from('templates')
        .insert(row)
        .select()
        .single();

      if (error) throw error;

      const template: Template = {
        id: result.id,
        name: result.name,
        description: result.description || '',
        type: result.type as DocumentType,
        category: result.category || 'Custom',
        content: result.content || '',
        tags: result.tags || [],
        usageCount: 0,
        isFeatured: false,
        isUserCreated: true,
        createdAt: result.created_at,
      };

      set((state) => ({ templates: [template, ...state.templates] }));
      return template;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      set({ error: message });
      return null;
    }
  },

  updateTemplate: async (id, updates) => {
    const supabase = createClient();
    try {
      // Optimistic update
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));

      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('templates')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update template';
      set({ error: message });
    }
  },

  deleteTemplate: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));

      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      set({ error: message });
    }
  },

  duplicateTemplate: async (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return null;

    return get().createTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      type: template.type,
      category: 'Custom',
      content: template.content,
      tags: template.tags,
    });
  },

  incrementUsage: async (id) => {
    const supabase = createClient();
    try {
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
        ),
      }));

      // Use raw SQL increment via RPC or simple update
      const template = get().templates.find((t) => t.id === id);
      if (template) {
        await supabase
          .from('templates')
          .update({ usage_count: template.usageCount })
          .eq('id', id);
      }
    } catch {
      // Non-critical, ignore errors
    }
  },
}));
