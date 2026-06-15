'use client';

import { useEffect, useState } from 'react';
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
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ActivityItem } from '@/lib/types';

// ─── Activity Type Config ───────────────────────────────────────────────────

const activityTypeConfig: Record<
  string,
  { icon: typeof FilePlus; color: string; dotColor: string }
> = {
  created: {
    icon: FilePlus,
    color: '#10a37f',
    dotColor: 'bg-brand',
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
  default: {
    icon: FileText,
    color: '#71717A',
    dotColor: 'bg-zinc-500',
  }
};

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
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function loadActivities() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: docs } = await supabase
        .from('documents')
        .select('id, title, created_at, updated_at, type')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(8);

      if (docs) {
        const mappedActivities = docs.map((doc) => {
          const isEdited = doc.updated_at !== doc.created_at;
          return {
            id: doc.id,
            type: isEdited ? 'edited' : 'created',
            title: doc.title || 'Untitled Document',
            description: isEdited 
              ? `Updated document "${doc.title || 'Untitled'}"`
              : `Created new document "${doc.title || 'Untitled'}"`,
            user: { name: 'You' }, // Since it's their own document
            timestamp: doc.updated_at || doc.created_at,
          };
        });
        setActivities(mappedActivities);
      }
    }
    loadActivities();
  }, []);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="group flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Activity List */}
      <motion.div
        className="divide-y divide-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activities.length > 0 ? activities.map((activity) => {
          const config = activityTypeConfig[activity.type] || activityTypeConfig.default;
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
        }) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No recent activity
          </div>
        )}
      </motion.div>
    </div>
  );
}
