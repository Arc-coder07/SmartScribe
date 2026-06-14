'use client';

import { motion } from 'framer-motion';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Charts } from '@/components/dashboard/charts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';

// ─── Greeting Helper ────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Page Animation ─────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// ─── Page Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {getGreeting()}, Alex
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your documents
        </p>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────── */}
      <StatsCards />

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <Charts />

      {/* ── Quick Actions + Recent Activity ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </motion.div>
  );
}
