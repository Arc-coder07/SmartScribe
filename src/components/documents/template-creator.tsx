'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Sparkles,
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Send,
  FolderOpen,
  Loader2,
  Variable,
  Eye,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_TYPE_META } from '@/lib/constants';
import { useTemplateStore } from '@/lib/stores/template-store';
import type { DocumentType } from '@/lib/types';

// ─── Template Variables ─────────────────────────────────────────────────────

const TEMPLATE_VARIABLES = [
  { name: '{{company_name}}', description: 'Your company name' },
  { name: '{{client_name}}', description: 'Client\'s name' },
  { name: '{{client_company}}', description: 'Client\'s company' },
  { name: '{{date}}', description: 'Today\'s date' },
  { name: '{{services}}', description: 'Your services list' },
  { name: '{{pricing}}', description: 'Your pricing structure' },
  { name: '{{brand_voice}}', description: 'Your brand voice tone' },
] as const;

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  FileText, Receipt, FileCheck, BarChart3, Briefcase, Users, Send, FolderOpen,
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface TemplateCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialType?: DocumentType;
  mode?: 'create' | 'edit';
  templateId?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TemplateCreator({
  isOpen,
  onClose,
  initialContent = '',
  initialType = 'proposal',
  mode = 'create',
  templateId,
}: TemplateCreatorProps) {
  const { createTemplate, updateTemplate } = useTemplateStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DocumentType>(initialType);
  const [category, setCategory] = useState('Custom');
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(0); // 0 = details, 1 = content

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (mode === 'edit' && templateId) {
        await updateTemplate(templateId, { name, description, type, category, content, tags });
      } else {
        await createTemplate({ name, description, type, category, content, tags });
      }
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setContent('');
      setTags([]);
      setStep(0);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-background border border-border/50 shadow-2xl shadow-black/20 overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand" />
                    {mode === 'edit' ? 'Edit Template' : 'Create Template'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step === 0 ? 'Set up template details' : 'Write your template content'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-active text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step Tabs */}
              <div className="flex border-b border-border/30">
                {['Details', 'Content'].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setStep(i)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      step === i
                        ? 'text-brand border-b-2 border-brand'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {step === 0 ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Template Name</Label>
                      <Input
                        placeholder="e.g., Agency Proposal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-surface border-border/50 h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        placeholder="Brief description of when to use this template..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-surface border-border/50 min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Document Type</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(DOCUMENT_TYPE_META).map(([key, meta]) => {
                          const Icon = iconMap[meta.icon] || FileText;
                          return (
                            <button
                              key={key}
                              onClick={() => setType(key as DocumentType)}
                              className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
                                type === key
                                  ? 'bg-brand/10 border border-brand/30 text-brand-light'
                                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" style={{ color: type === key ? meta.color : undefined }} />
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category</Label>
                      <Input
                        placeholder="e.g., Agency, Legal, Custom"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-surface border-border/50 h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="bg-surface border-border/50 h-9 flex-1"
                        />
                        <Button onClick={addTag} size="sm" variant="outline" className="h-9">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                              onClick={() => removeTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Variable Shortcuts */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        <Variable className="h-3 w-3 inline mr-1" />
                        Insert Variable
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {TEMPLATE_VARIABLES.map((v) => (
                          <button
                            key={v.name}
                            onClick={() => insertVariable(v.name)}
                            className="px-2 py-1 rounded-md bg-brand/5 border border-brand/10 text-[10px] font-mono text-brand-light hover:bg-brand/10 transition-colors"
                            title={v.description}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Template Content (Markdown)</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsPreview(!isPreview)}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {isPreview ? 'Edit' : 'Preview'}
                        </Button>
                      </div>

                      {isPreview ? (
                        <div
                          className="p-4 rounded-xl bg-surface border border-border/50 min-h-[300px] prose prose-sm dark:prose-invert max-w-none text-sm"
                          dangerouslySetInnerHTML={{
                            __html: content
                              .replace(/{{(\w+)}}/g, '<span class="text-brand font-medium">[$1]</span>')
                              .replace(/\n/g, '<br />'),
                          }}
                        />
                      ) : (
                        <Textarea
                          placeholder={`# {{company_name}} — Proposal\n\n## Prepared for {{client_name}}\n\n## Executive Summary\n\nWrite your template content here using markdown...\n\nUse variables like {{company_name}} that will be auto-filled.`}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="bg-surface border-border/50 min-h-[300px] font-mono text-xs resize-none"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  {step === 0 ? '1 of 2 — Details' : '2 of 2 — Content'}
                </p>
                <div className="flex gap-2">
                  {step === 1 && (
                    <Button variant="outline" onClick={() => setStep(0)} className="h-9">
                      Back
                    </Button>
                  )}
                  {step === 0 ? (
                    <Button
                      onClick={() => setStep(1)}
                      disabled={!name.trim()}
                      className="h-9 bg-brand hover:bg-brand-light text-foreground"
                    >
                      Next: Content
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={!name.trim() || !content.trim() || isSaving}
                      className="h-9 bg-brand hover:bg-brand-light text-foreground gap-1.5"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {mode === 'edit' ? 'Save Changes' : 'Create Template'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
