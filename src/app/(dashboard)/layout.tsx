'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores/ui-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CopilotPanel } from '@/components/layout/copilot-panel';
import { CommandPalette } from '@/components/ai/command-palette';
import { SHORTCUTS } from '@/lib/constants';

// ─── Keyboard Shortcuts Hook ────────────────────────────────────────────────

function useKeyboardShortcuts() {
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleCopilot = useUIStore((s) => s.toggleCopilot);
  const toggleSearch = useUIStore((s) => s.toggleSearch);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K — Command Palette
      if (e.metaKey && e.key === SHORTCUTS.commandPalette.key) {
        e.preventDefault();
        toggleCommandPalette();
      }
      // ⌘. — Copilot
      if (e.metaKey && e.key === SHORTCUTS.copilot.key) {
        e.preventDefault();
        toggleCopilot();
      }
      // / — Search (only when not focused on input)
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        toggleSearch();
      }
      // ⌘B — Toggle Sidebar
      if (e.metaKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleCopilot, toggleSearch, toggleSidebar]);
}

// ─── Dashboard Layout ───────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebarOverlay />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Copilot Panel — hidden on mobile */}
      <div className="hidden lg:flex">
        <CopilotPanel />
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}

// ─── Mobile Sidebar Overlay ─────────────────────────────────────────────────

function MobileSidebarOverlay() {
  // On mobile, sidebar would overlay. For now, this is a placeholder.
  // Will be implemented with Sheet component when mobile support is added.
  return null;
}



