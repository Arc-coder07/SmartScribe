'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Send,
  FolderOpen,
  Search,
  LayoutDashboard,
  LayoutTemplate,
  Database,
  Settings,
  Download,
  Sparkles,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui-store';

interface CommandGroup {
  heading: string;
  items: {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onSelect: () => void;
  }[];
}

export function CommandPalette() {
  const router = useRouter();
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleCopilot = useUIStore((s) => s.toggleCopilot);

  const close = useCallback(() => {
    toggleCommandPalette();
  }, [toggleCommandPalette]);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      close();
    },
    [router, close]
  );

  const groups: CommandGroup[] = [
    {
      heading: 'Create',
      items: [
        { icon: FileText, label: 'New Proposal', onSelect: () => navigate('/documents') },
        { icon: Receipt, label: 'New Invoice', onSelect: () => navigate('/documents') },
        { icon: FileCheck, label: 'New Contract', onSelect: () => navigate('/documents') },
        { icon: BarChart3, label: 'New Report', onSelect: () => navigate('/documents') },
        { icon: Briefcase, label: 'New Business Plan', onSelect: () => navigate('/documents') },
        { icon: Send, label: 'New Client Update', onSelect: () => navigate('/documents') },
      ],
    },
    {
      heading: 'Navigate',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', shortcut: '⌘1', onSelect: () => navigate('/dashboard') },
        { icon: FileText, label: 'Documents', shortcut: '⌘2', onSelect: () => navigate('/documents') },
        { icon: LayoutTemplate, label: 'Templates', shortcut: '⌘3', onSelect: () => navigate('/templates') },
        { icon: Database, label: 'Knowledge Vault', shortcut: '⌘4', onSelect: () => navigate('/vault') },
        { icon: BarChart3, label: 'Analytics', shortcut: '⌘5', onSelect: () => navigate('/analytics') },
        { icon: Settings, label: 'Settings', shortcut: '⌘,', onSelect: () => navigate('/settings') },
      ],
    },
    {
      heading: 'AI Actions',
      items: [
        { icon: Sparkles, label: 'Open AI Copilot', shortcut: '⌘.', onSelect: () => { toggleCopilot(); close(); } },
        { icon: Sparkles, label: 'Generate Document with AI', onSelect: () => navigate('/documents') },
        { icon: Search, label: 'Search Documents', shortcut: '/', onSelect: () => navigate('/documents') },
      ],
    },
    {
      heading: 'Export',
      items: [
        { icon: Download, label: 'Export as PDF', onSelect: close },
        { icon: Download, label: 'Export as Markdown', onSelect: close },
        { icon: Download, label: 'Export as DOCX', onSelect: close },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Command Dialog */}
          <div className="flex items-start justify-center pt-[15vh]">
            <motion.div
              className="relative w-full max-w-[560px] mx-4"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Command
                className="rounded-xl border border-border bg-[#111113] shadow-2xl shadow-black/40 overflow-hidden"
                loop
              >
                {/* Search Input */}
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Command.Input
                    placeholder="Type a command or search..."
                    className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-[#71717A] outline-none"
                    autoFocus
                  />
                  <kbd className="hidden sm:flex h-5 items-center rounded bg-white/[0.06] px-1.5 font-mono text-[10px] text-[#71717A]">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-[360px] overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {groups.map((group) => (
                    <Command.Group
                      key={group.heading}
                      heading={group.heading}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#71717A] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                    >
                      {group.items.map((item) => (
                        <Command.Item
                          key={item.label}
                          onSelect={item.onSelect}
                          className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-foreground/80 cursor-pointer transition-colors aria-selected:bg-white/[0.06] aria-selected:text-foreground hover:bg-muted/50"
                        >
                          <item.icon className="h-4 w-4 text-[#71717A]" />
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut && (
                            <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-[#71717A]">
                              {item.shortcut}
                            </kbd>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                    <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[9px]">↑↓</kbd>
                    <span>Navigate</span>
                    <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[9px] ml-2">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#71717A]">
                    <Sparkles className="h-3 w-3" />
                    SmartScribe
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
