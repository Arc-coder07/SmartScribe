'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Globe,
  Layers,
  DollarSign,
  Palette,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Briefcase,
  Zap,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useOnboardingStore,
  INDUSTRIES,
  TEAM_SIZES,
  BRAND_VOICES,
  PRICING_STRUCTURES,
} from '@/lib/stores/onboarding-store';

// ─── Step Components ────────────────────────────────────────────────────────

function StepCompanyInfo() {
  const { formData, updateFormData } = useOnboardingStore();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="company_name" className="text-sm font-medium">
          Company Name
        </Label>
        <Input
          id="company_name"
          placeholder="e.g., TechVenture Solutions"
          value={formData.company_name}
          onChange={(e) => updateFormData({ company_name: e.target.value })}
          className="bg-surface border-border/50 h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_website" className="text-sm font-medium">
          Website
        </Label>
        <Input
          id="company_website"
          placeholder="https://yourcompany.com"
          value={formData.company_website}
          onChange={(e) => updateFormData({ company_website: e.target.value })}
          className="bg-surface border-border/50 h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className="text-sm font-medium">
          Industry
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => updateFormData({ industry })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                formData.industry === industry
                  ? 'bg-brand/15 text-brand-light border border-brand/30 shadow-sm'
                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_description" className="text-sm font-medium">
          What does your company do?
        </Label>
        <Textarea
          id="company_description"
          placeholder="Describe your business in a few sentences. This helps SmartScribe personalize your documents..."
          value={formData.company_description}
          onChange={(e) => updateFormData({ company_description: e.target.value })}
          className="bg-surface border-border/50 min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
}

function StepServicesPricing() {
  const { formData, updateFormData } = useOnboardingStore();
  const [newService, setNewService] = useState('');

  const addService = () => {
    if (newService.trim()) {
      updateFormData({ services: [...formData.services, newService.trim()] });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    updateFormData({
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Services You Offer</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Web Development, Consulting..."
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
            className="bg-surface border-border/50 h-9 flex-1"
          />
          <Button
            onClick={addService}
            size="sm"
            className="bg-brand hover:bg-brand-light text-foreground h-9 px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.services.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.services.map((service, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand/10 text-brand-light border border-brand/20"
              >
                {service}
                <button
                  onClick={() => removeService(i)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Team Size</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TEAM_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateFormData({ team_size: size })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                formData.team_size === size
                  ? 'bg-brand/15 text-brand-light border border-brand/30 shadow-sm'
                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Users className="h-3.5 w-3.5 mb-1 opacity-60" />
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Pricing Structure</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRICING_STRUCTURES.map((pricing) => (
            <button
              key={pricing}
              onClick={() => updateFormData({ pricing_structure: pricing })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                formData.pricing_structure === pricing
                  ? 'bg-brand/15 text-brand-light border border-brand/30 shadow-sm'
                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 mb-1 opacity-60" />
              {pricing}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBrandVoice() {
  const { formData, updateFormData } = useOnboardingStore();

  const voiceDescriptions: Record<string, string> = {
    'Professional & Formal': 'Authoritative, polished, suitable for enterprise clients and legal documents.',
    'Friendly & Conversational': 'Warm, approachable, like chatting with a knowledgeable colleague.',
    'Bold & Confident': 'Direct, assertive, high-energy — perfect for pitches and proposals.',
    'Technical & Precise': 'Detail-oriented, data-driven, ideal for technical reports and SOWs.',
    'Creative & Playful': 'Imaginative, witty, great for creative agencies and marketing.',
    'Warm & Empathetic': 'Caring, understanding, perfect for healthcare, education, non-profit.',
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Choose your brand voice
        </Label>
        <p className="text-xs text-muted-foreground">
          This defines the tone SmartScribe uses when generating your documents.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {BRAND_VOICES.map((voice) => (
            <button
              key={voice}
              onClick={() => updateFormData({ brand_voice: voice })}
              className={`p-4 rounded-xl text-left transition-all ${
                formData.brand_voice === voice
                  ? 'bg-brand/10 border-2 border-brand/30 shadow-sm'
                  : 'bg-surface border border-border/50 hover:border-border hover:bg-surface-active'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Palette className={`h-4 w-4 ${formData.brand_voice === voice ? 'text-brand' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{voice}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {voiceDescriptions[voice]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview() {
  const { formData, isGenerating } = useOnboardingStore();

  const sections = [
    {
      icon: Building2,
      label: 'Company',
      items: [
        { key: 'Name', value: formData.company_name },
        { key: 'Website', value: formData.company_website },
        { key: 'Industry', value: formData.industry },
        { key: 'Description', value: formData.company_description },
      ],
    },
    {
      icon: Layers,
      label: 'Services & Team',
      items: [
        { key: 'Services', value: formData.services.join(', ') || 'None added' },
        { key: 'Team Size', value: formData.team_size },
        { key: 'Pricing', value: formData.pricing_structure },
      ],
    },
    {
      icon: Palette,
      label: 'Brand Voice',
      items: [{ key: 'Tone', value: formData.brand_voice }],
    },
  ];

  return (
    <div className="space-y-4">
      {isGenerating && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand/5 border border-brand/10">
          <Loader2 className="h-4 w-4 text-brand animate-spin" />
          <p className="text-sm text-muted-foreground">
            SmartScribe is learning about your business...
          </p>
        </div>
      )}

      {sections.map((section) => (
        <div
          key={section.label}
          className="p-4 rounded-xl bg-surface/50 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <section.icon className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-medium">{section.label}</h3>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.key} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">
                  {item.key}
                </span>
                <span className="text-xs text-foreground">
                  {item.value || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step Config ────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Tell us about your company',
    subtitle: 'Basic information helps SmartScribe personalize every document.',
    icon: Building2,
    component: StepCompanyInfo,
  },
  {
    title: 'Services & Pricing',
    subtitle: 'What you offer and how you charge — this powers your proposals.',
    icon: Briefcase,
    component: StepServicesPricing,
  },
  {
    title: 'Brand Voice',
    subtitle: 'Define the tone that represents your brand across all documents.',
    icon: Palette,
    component: StepBrandVoice,
  },
  {
    title: 'Review & Launch',
    subtitle: 'Verify your details. SmartScribe will remember this forever.',
    icon: Sparkles,
    component: StepReview,
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const {
    step,
    nextStep,
    prevStep,
    formData,
    isSaving,
    isGenerating,
    saveProfile,
    completeOnboarding,
    checkOnboardingStatus,
  } = useOnboardingStore();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const completed = await checkOnboardingStatus();
      if (completed) {
        router.replace('/dashboard');
      }
      setIsChecking(false);
    };
    check();
  }, [checkOnboardingStatus, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-brand animate-spin" />
      </div>
    );
  }

  const currentStep = STEPS[step];
  const StepComponent = currentStep.component;
  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.company_name.trim() !== '' && formData.industry !== '';
      case 1:
        return formData.services.length > 0;
      case 2:
        return formData.brand_voice !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      await completeOnboarding();
      router.push('/dashboard');
    } else {
      await saveProfile();
      nextStep();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Logo & Progress */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
              <Zap className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SmartScribe</h1>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    i < step
                      ? 'bg-brand text-foreground'
                      : i === step
                      ? 'bg-brand/15 text-brand border-2 border-brand/30'
                      : 'bg-surface text-muted-foreground border border-border/50'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all ${
                      i < step ? 'bg-brand' : 'bg-border/50'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-surface/50 border border-border/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <currentStep.icon className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-semibold">{currentStep.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={isFirstStep}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSaving || isGenerating}
              className="gap-1.5 bg-brand hover:bg-brand-light text-foreground min-w-[140px]"
            >
              {isSaving || isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isGenerating ? 'Generating...' : 'Saving...'}
                </>
              ) : isLastStep ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Launch SmartScribe
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now — you can set this up later in Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
