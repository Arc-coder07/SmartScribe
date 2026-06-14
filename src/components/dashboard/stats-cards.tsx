'use client';

import { motion } from 'framer-motion';
import { FileText, Sparkles, Clock, FolderOpen, TrendingUp } from 'lucide-react';

// ─── Stats Data ─────────────────────────────────────────────────────────────

const stats = [
  {
    label: 'Documents Created',
    value: '47',
    change: '+12%',
    icon: FileText,
    iconColor: '#7C3AED',
    iconBg: 'rgba(124, 58, 237, 0.15)',
  },
  {
    label: 'AI Usage',
    value: '182',
    suffix: 'prompts',
    change: '+24%',
    icon: Sparkles,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    label: 'Saved Hours',
    value: '23.5',
    suffix: 'h',
    change: '+18%',
    icon: Clock,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.15)',
  },
  {
    label: 'Active Projects',
    value: '8',
    change: '+3%',
    icon: FolderOpen,
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.15)',
  },
] as const;

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
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function StatsCards() {
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
            whileHover={{
              y: -4,
              boxShadow: `0 8px 30px ${stat.iconBg}`,
            }}
            transition={{ duration: 0.2 }}
            className="glass group relative cursor-default overflow-hidden rounded-xl p-5"
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
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <TrendingUp className="h-3 w-3" />
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

            {/* Subtle "from last month" text */}
            <p className="mt-2 text-xs text-muted-foreground/60">
              from last month
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
