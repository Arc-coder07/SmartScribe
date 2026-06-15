'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  FilePlus,
  Pencil,
  MessageSquare,
  Download,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { ActivityItem } from '@/lib/types';

// ─── Activity Type Config ───────────────────────────────────────────────────

const activityTypeConfig: Record<
  ActivityItem['type'],
  { icon: typeof FilePlus; color: string; dotColor: string }
> = {
  created: {
    icon: FilePlus,
    color: '#10a37f',
    dotColor: 'bg-purple-500',
  },
  edited: {
    icon: Pencil,
    color: '#3B82F6',
    dotColor: 'bg-blue-500',
  },
  commented: {
    icon: MessageSquare,
    color: '#F59E0B',
    dotColor: 'bg-amber-500',
  },
  exported: {
    icon: Download,
    color: '#10B981',
    dotColor: 'bg-emerald-500',
  },
  'ai-generated': {
    icon: Sparkles,
    color: '#EC4899',
    dotColor: 'bg-pink-500',
  },
  approved: {
    icon: CheckCircle2,
    color: '#10B981',
    dotColor: 'bg-emerald-500',
  },
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const now = new Date();

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'ai-generated',
    title: 'Q3 Marketing Proposal',
    description: 'AI generated a new marketing proposal for Acme Corp',
    user: { id: 'u1', name: 'Alex', email: 'alex@smartscribe.ai', role: 'owner' },
    timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'edited',
    title: 'Website Redesign Contract',
    description: 'Updated payment terms in the website redesign contract',
    user: { id: 'u1', name: 'Alex', email: 'alex@smartscribe.ai', role: 'owner' },
    timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'approved',
    title: 'Annual Report 2024',
    description: 'Annual report was approved and finalized',
    user: { id: 'u2', name: 'Sarah', email: 'sarah@smartscribe.ai', role: 'admin' },
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'commented',
    title: 'Client Onboarding SOP',
    description: 'Sarah left a comment on the onboarding document',
    user: { id: 'u2', name: 'Sarah', email: 'sarah@smartscribe.ai', role: 'admin' },
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'created',
    title: 'Invoice #1042',
    description: 'Created a new invoice for GlobalTech Solutions',
    user: { id: 'u1', name: 'Alex', email: 'alex@smartscribe.ai', role: 'owner' },
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'exported',
    title: 'Partnership Agreement',
    description: 'Exported partnership agreement as PDF',
    user: { id: 'u1', name: 'Alex', email: 'alex@smartscribe.ai', role: 'owner' },
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'ai-generated',
    title: 'Meeting Summary — Sprint Review',
    description: 'AI summarized the sprint review meeting notes',
    user: { id: 'u1', name: 'Alex', email: 'alex@smartscribe.ai', role: 'owner' },
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    type: 'edited',
    title: 'Business Plan v2',
    description: 'Updated financial projections section',
    user: { id: 'u3', name: 'Mike', email: 'mike@smartscribe.ai', role: 'editor' },
    timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function RecentActivity() {
  return (
    <div className="glass rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="group flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Activity List */}
      <motion.div
        className="divide-y divide-white/[0.04]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockActivities.map((activity) => {
          const config = activityTypeConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
            >
              {/* Dot indicator */}
              <div className="relative mt-1.5 flex-shrink-0">
                <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
              </div>

              {/* Icon */}
              <div
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: config.color }}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground/90">
                  {activity.description}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.user.name} ·{' '}
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
