'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_TYPE_META } from '@/lib/constants';
import type { DocumentType, Template } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
  FileText, Receipt, FileCheck, BarChart3, Briefcase, Users, Send, FolderOpen,
};

const mockTemplates: Template[] = [
  {
    id: 'tpl-001', name: 'Startup Pitch Proposal', description: 'A compelling proposal template for startups pitching their services to enterprise clients. Includes executive summary, scope, timeline, and pricing.',
    type: 'proposal', category: 'Popular', content: '', tags: ['startup', 'pitch', 'enterprise'], usageCount: 342, isFeatured: true, isUserCreated: false, createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'tpl-002', name: 'Freelancer Invoice', description: 'Clean invoice template for freelancers with itemized billing, payment terms, and bank details section.',
    type: 'invoice', category: 'Popular', content: '', tags: ['freelance', 'billing'], usageCount: 518, isFeatured: true, isUserCreated: false, createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'tpl-003', name: 'SaaS Service Agreement', description: 'Comprehensive service agreement for SaaS companies covering terms, SLAs, data protection, and IP ownership.',
    type: 'contract', category: 'Legal', content: '', tags: ['saas', 'legal', 'agreement'], usageCount: 189, isFeatured: false, isUserCreated: false, createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tpl-004', name: 'Monthly Client Report', description: 'Professional monthly report template with KPIs, achievements, blockers, and next steps sections.',
    type: 'report', category: 'Reports', content: '', tags: ['monthly', 'client', 'KPI'], usageCount: 267, isFeatured: true, isUserCreated: false, createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'tpl-005', name: 'Lean Business Plan', description: 'Concise business plan focused on value proposition, revenue model, market analysis, and financial projections.',
    type: 'business-plan', category: 'Strategy', content: '', tags: ['lean', 'strategy', 'startup'], usageCount: 156, isFeatured: false, isUserCreated: false, createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'tpl-006', name: 'Agency Retainer Proposal', description: 'Template for agencies proposing ongoing retainer agreements with scope, deliverables, and pricing tiers.',
    type: 'proposal', category: 'Agency', content: '', tags: ['agency', 'retainer', 'ongoing'], usageCount: 203, isFeatured: false, isUserCreated: false, createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'tpl-007', name: 'Sprint Status Update', description: 'Agile sprint update template with completed items, in-progress work, blockers, and sprint metrics.',
    type: 'client-update', category: 'Agile', content: '', tags: ['sprint', 'agile', 'status'], usageCount: 421, isFeatured: true, isUserCreated: false, createdAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'tpl-008', name: 'Investor Update', description: 'Monthly investor update covering financials, KPIs, product milestones, team changes, and asks.',
    type: 'report', category: 'Fundraising', content: '', tags: ['investor', 'fundraising', 'monthly'], usageCount: 98, isFeatured: false, isUserCreated: false, createdAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 'tpl-009', name: 'My Custom SOW', description: 'Statement of work template customized for our development projects.',
    type: 'contract', category: 'Custom', content: '', tags: ['custom', 'SOW'], usageCount: 12, isFeatured: false, isUserCreated: true, createdAt: '2026-05-01T00:00:00Z',
  },
];

const categories = ['All', 'Popular', 'Legal', 'Reports', 'Strategy', 'Agency', 'Agile', 'Fundraising', 'Custom'];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<DocumentType | 'all'>('all');

  const filteredTemplates = mockTemplates.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tpl.category === activeCategory;
    const matchesType = activeType === 'all' || tpl.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

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
        <Button variant="outline" className="gap-2">
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

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => {
          const meta = DOCUMENT_TYPE_META[template.type];
          const Icon = iconMap[meta.icon] || FileText;
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
                <Button size="sm" className="h-7 text-xs flex-1 bg-brand hover:bg-brand-light text-white gap-1">
                  Use Template
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <LayoutTemplate className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-2">No templates found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </motion.div>
  );
}
