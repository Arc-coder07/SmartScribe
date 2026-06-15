'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  Search,
  Star,
  Eye,
  Plus,
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Send,
  FolderOpen,
  TrendingUp,
  Copy,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_TYPE_META } from '@/lib/constants';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useDocumentStore } from '@/lib/stores/document-store';
import { TemplateCreator } from '@/components/documents/template-creator';
import type { DocumentType, Template } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
  FileText, Receipt, FileCheck, BarChart3, Briefcase, Users, Send, FolderOpen,
};

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, fetchTemplates, isLoading, duplicateTemplate, deleteTemplate, incrementUsage } = useTemplateStore();
  const { addDocument } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<DocumentType | 'all'>('all');
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Derive unique categories from templates
  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tpl.category === activeCategory;
    const matchesType = activeType === 'all' || tpl.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleUseTemplate = async (template: Template) => {
    setUsingTemplateId(template.id);
    try {
      // Increment usage count
      await incrementUsage(template.id);

      // Create a new document from the template
      const doc = await addDocument({
        title: template.name,
        type: template.type,
        status: 'draft',
        content: template.content,
        tags: template.tags,
        metadata: { templateId: template.id },
      } as Partial<import('@/lib/types').Document>);

      if (doc) {
        router.push(`/documents/${doc.id}`);
      }
    } finally {
      setUsingTemplateId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-brand" />
            Template Marketplace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start with a proven template and customize it to your needs.
          </p>
        </div>
        <Button
          onClick={() => setCreatorOpen(true)}
          className="bg-brand hover:bg-brand-light text-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface border-border/50 h-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-brand/15 text-brand-light border border-brand/20'
                : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-brand animate-spin" />
        </div>
      )}

      {/* Template Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, index) => {
            const meta = DOCUMENT_TYPE_META[template.type];
            const Icon = iconMap[meta.icon] || FileText;
            const isUsing = usingTemplateId === template.id;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group p-5 rounded-xl bg-surface/50 border border-border/50 hover:border-brand/20 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {template.isFeatured && (
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    )}
                    {template.isUserCreated && (
                      <Badge variant="outline" className="text-[10px] h-5">Custom</Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-medium mb-1.5 group-hover:text-brand-light transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${meta.color}30`, color: meta.color }}>
                    {meta.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {template.usageCount} uses
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    disabled={isUsing}
                    className="h-7 text-xs flex-1 bg-brand hover:bg-brand-light text-foreground gap-1"
                  >
                    {isUsing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); duplicateTemplate(template.id); }}
                    className="h-7 w-7 p-0"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {template.isUserCreated && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                      className="h-7 w-7 p-0 hover:text-destructive hover:border-destructive/30"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <LayoutTemplate className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-2">No templates found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            {templates.length === 0
              ? 'Create your first template to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
          {templates.length === 0 && (
            <Button
              onClick={() => setCreatorOpen(true)}
              className="bg-brand hover:bg-brand-light text-foreground gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          )}
        </div>
      )}

      {/* Template Creator Modal */}
      <TemplateCreator
        isOpen={creatorOpen}
        onClose={() => setCreatorOpen(false)}
      />
    </motion.div>
  );
}
