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
import { ThemeToggle } from '@/components/theme-toggle';
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
        'sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6',
        'glass-subtle'
      )}
    >
      {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                'transition-colors',
                index === breadcrumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
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
            'flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-all',
            'hover:border-border/80 hover:bg-muted/50 hover:text-foreground/70'
          )}
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="ml-1 hidden rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className={cn(
            'relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors',
            'hover:bg-muted hover:text-foreground'
          )}
        >
          <Bell className="size-4" />
          {/* Badge dot */}
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-background" />
        </button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-colors',
              'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50'
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
