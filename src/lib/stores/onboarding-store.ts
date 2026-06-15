import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OnboardingProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_website: string;
  company_description: string;
  industry: string;
  services: string[];
  pricing_structure: string;
  team_size: string;
  brand_voice: string;
  onboarding_completed: boolean;
  ai_generated_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingFormData {
  // Step 1: Company Info
  company_name: string;
  company_website: string;
  company_description: string;
  industry: string;
  // Step 2: Services & Pricing
  services: string[];
  pricing_structure: string;
  team_size: string;
  // Step 3: Brand Voice
  brand_voice: string;
}

interface OnboardingState {
  step: number;
  totalSteps: number;
  formData: OnboardingFormData;
  profile: OnboardingProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  error: string | null;
  hasChecked: boolean;
}

interface OnboardingActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  checkOnboardingStatus: () => Promise<boolean>;
  saveProfile: () => Promise<void>;
  generateAISummary: () => Promise<string>;
  completeOnboarding: () => Promise<void>;
}

type OnboardingStore = OnboardingState & OnboardingActions;

// ─── Constants ──────────────────────────────────────────────────────────────

export const INDUSTRIES = [
  'Technology',
  'Marketing & Advertising',
  'Consulting',
  'Design & Creative',
  'Finance & Accounting',
  'Legal',
  'Healthcare',
  'Education',
  'Real Estate',
  'E-Commerce',
  'Manufacturing',
  'Non-Profit',
  'Other',
] as const;

export const TEAM_SIZES = [
  'Solo (just me)',
  '2-5 people',
  '6-15 people',
  '16-50 people',
  '51-200 people',
  '200+ people',
] as const;

export const BRAND_VOICES = [
  'Professional & Formal',
  'Friendly & Conversational',
  'Bold & Confident',
  'Technical & Precise',
  'Creative & Playful',
  'Warm & Empathetic',
] as const;

export const PRICING_STRUCTURES = [
  'Hourly Rate',
  'Fixed Project Fee',
  'Monthly Retainer',
  'Value-Based Pricing',
  'Subscription / SaaS',
  'Mixed / Custom',
] as const;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  step: 0,
  totalSteps: 4,
  formData: {
    company_name: '',
    company_website: '',
    company_description: '',
    industry: '',
    services: [],
    pricing_structure: '',
    team_size: '',
    brand_voice: '',
  },
  profile: null,
  isLoading: false,
  isSaving: false,
  isGenerating: false,
  error: null,
  hasChecked: false,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, s.totalSteps - 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  updateFormData: (data) =>
    set((s) => ({ formData: { ...s.formData, ...data } })),

  checkOnboardingStatus: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ hasChecked: true, isLoading: false });
        return false;
      }

      const { data, error } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (data) {
        set({
          profile: data as OnboardingProfile,
          formData: {
            company_name: data.company_name || '',
            company_website: data.company_website || '',
            company_description: data.company_description || '',
            industry: data.industry || '',
            services: data.services || [],
            pricing_structure: data.pricing_structure || '',
            team_size: data.team_size || '',
            brand_voice: data.brand_voice || '',
          },
          hasChecked: true,
        });
        return data.onboarding_completed === true;
      }

      set({ hasChecked: true });
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to check onboarding status';
      set({ error: message, hasChecked: true });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async () => {
    set({ isSaving: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formData = get().formData;

      const { data, error } = await supabase
        .from('onboarding_profiles')
        .upsert(
          {
            user_id: user.id,
            ...formData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      set({ profile: data as OnboardingProfile });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      set({ error: message });
    } finally {
      set({ isSaving: false });
    }
  },

  generateAISummary: async () => {
    set({ isGenerating: true, error: null });
    try {
      const formData = get().formData;

      const prompt = `Based on the following business information, generate a concise professional company profile summary (3-4 paragraphs) that SmartScribe AI can use as context when generating business documents:

Company Name: ${formData.company_name}
Website: ${formData.company_website}
Description: ${formData.company_description}
Industry: ${formData.industry}
Services: ${formData.services.join(', ')}
Pricing Model: ${formData.pricing_structure}
Team Size: ${formData.team_size}
Brand Voice: ${formData.brand_voice}

Write the summary in third person, highlighting the company's expertise, services, and brand personality. This will be used as permanent context for AI document generation.`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'summary' }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const result = await response.json();
      return result.content || '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate AI summary';
      set({ error: message });
      return '';
    } finally {
      set({ isGenerating: false });
    }
  },

  completeOnboarding: async () => {
    set({ isSaving: true, error: null });
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formData = get().formData;

      // 1. Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('onboarding_profiles')
        .upsert(
          {
            user_id: user.id,
            ...formData,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;

      // 2. Populate memory_entries from onboarding data
      const memoryEntries = [
        { category: 'company', key: 'Company Name', value: formData.company_name },
        { category: 'company', key: 'Website', value: formData.company_website },
        { category: 'company', key: 'Description', value: formData.company_description },
        { category: 'company', key: 'Industry', value: formData.industry },
        { category: 'company', key: 'Team Size', value: formData.team_size },
        { category: 'services', key: 'Services Offered', value: formData.services.join(', ') },
        { category: 'pricing', key: 'Pricing Structure', value: formData.pricing_structure },
        { category: 'brand', key: 'Brand Voice', value: formData.brand_voice },
      ].filter((e) => e.value && e.value.trim() !== '');

      const rows = memoryEntries.map((e) => ({
        user_id: user.id,
        category: e.category,
        key: e.key,
        value: e.value,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        const { error: memoryError } = await supabase
          .from('memory_entries')
          .upsert(rows, { onConflict: 'user_id,category,key' });

        if (memoryError) throw memoryError;
      }

      set({
        profile: {
          ...(get().profile || {}),
          onboarding_completed: true,
        } as OnboardingProfile,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      set({ error: message });
    } finally {
      set({ isSaving: false });
    }
  },
}));
