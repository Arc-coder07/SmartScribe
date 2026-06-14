'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores/ui-store';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;

      const isMeta = event.metaKey || event.ctrlKey;

      // ⌘ + K → Command Palette
      if (isMeta && event.key === 'k') {
        event.preventDefault();
        useUIStore.getState().toggleCommandPalette();
        return;
      }

      // ⌘ + . → Copilot Toggle
      if (isMeta && event.key === '.') {
        event.preventDefault();
        useUIStore.getState().toggleCopilot();
        return;
      }

      // ⌘ + N → New Document (emit custom event for consumer to handle)
      if (isMeta && event.key === 'n') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('smartscribe:new-document'));
        return;
      }

      // / → Search (only when not already typing in an input)
      if (event.key === '/' && !isEditable) {
        event.preventDefault();
        useUIStore.getState().toggleSearch();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
