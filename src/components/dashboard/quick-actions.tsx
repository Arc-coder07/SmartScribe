'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Plus,
} from 'lucide-react';
import { DOCUMENT_TYPE_META } from '@/lib/constants';
import type { DocumentType } from '@/lib/types';

// ─── Quick Action Items ─────────────────────────────────────────────────────

const iconMap: Record<string, typeof FileText> = {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
};

interface QuickAction {
  type: DocumentType;
  label: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    type: 'proposal',
    label: 'New Proposal',
    description: 'Create a winning pitch',
  },
  {
    type: 'invoice',
    label: 'New Invoice',
    description: 'Bill your clients',
  },
  {
    type: 'contract',
    label: 'New Contract',
    description: 'Draft an agreement',
  },
  {
    type: 'report',
    label: 'New Report',
    description: 'Analyze & summarize',
  },
  {
    type: 'business-plan',
    label: 'New Business Plan',
    description: 'Map your strategy',
  },
  {
    type: 'meeting-summary',
    label: 'New Meeting Summary',
    description: 'Capture key decisions',
  },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function QuickActions() {
  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Plus className="h-3 w-3" />
          Create new
        </div>
      </div>

      {/* Actions grid */}
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {quickActions.map((action) => {
          const meta = DOCUMENT_TYPE_META[action.type];
          const Icon = iconMap[meta.icon] || FileText;

          return (
            <motion.button
              key={action.type}
              variants={itemVariants}
              whileHover={{
                y: -2,
                boxShadow: `0 4px 20px ${meta.color}20`,
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              {/* Colored left border accent */}
              <div
                className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl opacity-60 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: meta.color }}
              />

              {/* Icon */}
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: meta.color }}
                />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
