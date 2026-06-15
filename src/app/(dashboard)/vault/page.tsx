'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Building2,
  Users,
  Layers,
  DollarSign,
  UserCheck,
  Palette,
  Plus,
  Search,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVaultStore } from '@/lib/stores/vault-store';
import { VAULT_CATEGORY_META } from '@/lib/constants';
import type { VaultCategory } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
  Building2, Users, Layers, DollarSign, UserCheck, Palette,
};

export default function VaultPage() {
  const { entries, fetchEntries, isLoading, error } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<VaultCategory | 'all'>('all');

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = Object.keys(VAULT_CATEGORY_META).reduce((acc, key) => {
    acc[key as VaultCategory] = entries.filter((e) => e.category === key).length;
    return acc;
  }, {} as Record<VaultCategory, number>);

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
            <Database className="h-6 w-6 text-brand" />
            Knowledge Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your business memory — AI uses this context across all documents.
          </p>
        </div>
        <Button className="bg-brand hover:bg-brand-light text-foreground gap-2">
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* AI Memory Indicator */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand/5 border border-brand/10">
        <Sparkles className="h-4 w-4 text-brand" />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{entries.length} entries</span> stored. AI will automatically reference this data when generating documents.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-brand/15 text-brand-light border border-brand/20'
              : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({entries.length})
        </button>
        {Object.entries(VAULT_CATEGORY_META).map(([key, meta]) => {
          const Icon = iconMap[meta.icon] || Database;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key as VaultCategory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === key
                  ? 'bg-brand/15 text-brand-light border border-brand/20'
                  : 'bg-surface border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {meta.label} ({categoryCounts[key as VaultCategory] || 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vault entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-surface border-border/50 h-9"
        />
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((entry, index) => {
          const meta = VAULT_CATEGORY_META[entry.category];
          const Icon = iconMap[meta.icon] || Database;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-4 rounded-xl bg-surface/50 border border-border/50 hover:border-brand/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${meta.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-surface-active text-muted-foreground hover:text-foreground transition-colors">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-surface-active text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1">{entry.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                {entry.content}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {meta.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  Used in {entry.usageCount} doc{entry.usageCount !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <Database className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-2">No entries found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add your company details, pricing, and team info to help AI generate better documents.
          </p>
        </div>
      )}
    </motion.div>
  );
}
