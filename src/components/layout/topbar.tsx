'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  LogOut,
  Settings,
  User,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { NAV_ITEMS } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// ─── Topbar Component ───────────────────────────────────────────────────────

export function Topbar() {
  const pathname = usePathname();
  const toggleSearch = useUIStore((s) => s.toggleSearch);

  // Derive breadcrumb from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      // Try to match from NAV_ITEMS for proper label
      const navItem = NAV_ITEMS.find((item) => item.href === currentPath);
      crumbs.push({
        label: navItem?.label ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        href: currentPath,
      });
    }

    return crumbs;
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/[0.04] px-6',
        'glass-subtle'
      )}
    >
      {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 text-[#71717A]" />
            )}
            <span
              className={cn(
                'transition-colors',
                index === breadcrumbs.length - 1
                  ? 'font-medium text-white'
                  : 'text-[#71717A] hover:text-white/70'
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* ── Right Actions ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={toggleSearch}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-[#71717A] transition-all',
            'hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-white/70'
          )}
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="ml-1 hidden rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className={cn(
            'relative flex size-8 items-center justify-center rounded-lg text-[#71717A] transition-colors',
            'hover:bg-white/[0.04] hover:text-white/80'
          )}
        >
          <Bell className="size-4" />
          {/* Badge dot */}
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-[#0a0a0c]" />
        </button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-colors',
              'hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50'
            )}
          >
            <Avatar size="sm">
              <AvatarImage src="" alt="Alex Chen" />
              <AvatarFallback className="bg-brand/20 text-[10px] text-brand-light">
                AC
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">Alex Chen</p>
                <p className="text-xs text-muted-foreground">
                  alex@smartscribe.ai
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 size-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
