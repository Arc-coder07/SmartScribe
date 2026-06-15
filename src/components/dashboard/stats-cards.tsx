'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Clock, FolderOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function StatsCards() {
  const [stats, setStats] = useState([
    {
      label: 'Documents Created',
      value: '0',
      change: '0%',
      up: true,
      icon: FileText,
      iconColor: 'var(--color-brand)',
      iconBg: 'rgba(16, 163, 127, 0.15)',
    },
    {
      label: 'AI Usage',
      value: '0',
      suffix: 'prompts',
      change: '0%',
      up: true,
      icon: Sparkles,
      iconColor: '#3B82F6',
      iconBg: 'rgba(59, 130, 246, 0.15)',
    },
    {
      label: 'Active Templates',
      value: '0',
      change: '0%',
      up: true,
      icon: FolderOpen,
      iconColor: '#F59E0B',
      iconBg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      label: 'Vault Entries',
      value: '0',
      change: '0%',
      up: true,
      icon: Clock,
      iconColor: '#10B981',
      iconBg: 'rgba(16, 185, 129, 0.15)',
    },
  ]);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Documents
      const { count: docsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Usage
      const { data: usageData } = await supabase
        .from('user_usage')
        .select('tokens_used_today')
        .eq('user_id', user.id)
        .single();

      // Templates
      const { count: templatesCount } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Vault
      const { count: vaultCount } = await supabase
        .from('vault_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats([
        {
          label: 'Documents Created',
          value: (docsCount || 0).toString(),
          change: '+0%',
          up: true,
          icon: FileText,
          iconColor: 'var(--color-brand)',
          iconBg: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
        },
        {
          label: 'AI Usage',
          value: (usageData?.tokens_used_today || 0).toString(),
          suffix: 'tokens',
          change: '+0%',
          up: true,
          icon: Sparkles,
          iconColor: '#3B82F6',
          iconBg: 'rgba(59, 130, 246, 0.15)',
        },
        {
          label: 'Active Templates',
          value: (templatesCount || 0).toString(),
          change: '+0%',
          up: true,
          icon: FolderOpen,
          iconColor: '#F59E0B',
          iconBg: 'rgba(245, 158, 11, 0.15)',
        },
        {
          label: 'Vault Entries',
          value: (vaultCount || 0).toString(),
          change: '+0%',
          up: true,
          icon: Clock,
          iconColor: '#10B981',
          iconBg: 'rgba(16, 185, 129, 0.15)',
        },
      ]);
    }

    loadStats();
  }, []);

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative cursor-default overflow-hidden rounded-xl bg-card border border-border p-5 shadow-sm"
          >
            {/* Subtle gradient accent on top border */}
            <div
              className="absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${stat.iconColor}, transparent)`,
              }}
            />

            <div className="flex items-start justify-between">
              {/* Icon */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: stat.iconColor }}
                />
              </div>

              {/* Change badge */}
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>

            {/* Value */}
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
                {'suffix' in stat && stat.suffix && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
