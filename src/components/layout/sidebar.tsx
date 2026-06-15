'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Database,
  BarChart3,
  Settings,
  Users,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { useUIStore } from '@/lib/stores/ui-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Icon Map ───────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Database,
  BarChart3,
  Settings,
  Users,
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const labelVariants = {
  show: { opacity: 1, x: 0, display: 'block' as const },
  hide: { opacity: 0, x: -8, transitionEnd: { display: 'none' as const } },
};

// ─── Sidebar Component ──────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        Icon: ICON_MAP[item.icon] || FileText,
        isActive:
          pathname === item.href || pathname.startsWith(item.href + '/'),
      })),
    [pathname]
  );

  return (
    <motion.aside
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-background',
        'select-none'
      )}
      variants={sidebarVariants}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg gradient-brand">
          <Sparkles className="size-4 text-foreground" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              className="gradient-brand-text text-lg font-bold tracking-tight"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, shortcut, Icon, isActive }) => {
          const linkContent = (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                'hover:bg-muted/50',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-muted/50"
                  style={{ borderLeft: '2px solid var(--color-brand)' }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                className={cn(
                  'relative z-10 size-[18px] shrink-0 transition-colors duration-200',
                  isActive ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground/70'
                )}
              />

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    className="relative z-10 flex-1 truncate"
                    variants={labelVariants}
                    initial="hide"
                    animate="show"
                    exit="hide"
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Shortcut hint */}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.kbd
                    className="relative z-10 hidden rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-block"
                    variants={labelVariants}
                    initial="hide"
                    animate="show"
                    exit="hide"
                    transition={{ duration: 0.15 }}
                  >
                    {shortcut}
                  </motion.kbd>
                )}
              </AnimatePresence>
            </Link>
          );

          // Show tooltip when collapsed
          if (sidebarCollapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={linkContent} />
                <TooltipContent side="right" sideOffset={8}>
                  <p>
                    {label}{' '}
                    <span className="ml-1 text-muted-foreground">
                      {shortcut}
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* ── Bottom: User + Collapse Toggle ────────────────────────────── */}
      <div className="border-t border-border p-3">
        {/* User */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar size="sm">
            <AvatarImage src="" alt="Alex Chen" />
            <AvatarFallback className="bg-brand/20 text-xs text-brand-light">
              AC
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex min-w-0 flex-col"
                variants={labelVariants}
                initial="hide"
                animate="show"
                exit="hide"
                transition={{ duration: 0.15 }}
              >
                <span className="truncate text-sm font-medium text-foreground">
                  Alex Chen
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Pro Plan
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground/80',
            sidebarCollapsed && 'px-0'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              <motion.span
                className="text-xs"
                variants={labelVariants}
                initial="hide"
                animate="show"
                exit="hide"
                transition={{ duration: 0.15 }}
              >
                Collapse
              </motion.span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
