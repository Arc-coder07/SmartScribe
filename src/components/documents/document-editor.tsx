'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const toolbarItems = [
  { icon: Bold, label: 'Bold', command: 'bold' },
  { icon: Italic, label: 'Italic', command: 'italic' },
  { icon: Underline, label: 'Underline', command: 'underline' },
  { type: 'separator' as const },
  { icon: Heading1, label: 'Heading 1', command: 'h1' },
  { icon: Heading2, label: 'Heading 2', command: 'h2' },
  { type: 'separator' as const },
  { icon: List, label: 'Bullet List', command: 'ul' },
  { icon: ListOrdered, label: 'Numbered List', command: 'ol' },
  { type: 'separator' as const },
  { icon: Quote, label: 'Quote', command: 'quote' },
  { icon: LinkIcon, label: 'Link', command: 'link' },
  { icon: Minus, label: 'Divider', command: 'hr' },
] as const;

export function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== content) {
      editorRef.current.innerText = content;
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerText);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string) => {
    switch (command) {
      case 'bold':
        window.document.execCommand('bold');
        break;
      case 'italic':
        window.document.execCommand('italic');
        break;
      case 'underline':
        window.document.execCommand('underline');
        break;
      case 'h1':
        window.document.execCommand('formatBlock', false, 'h1');
        break;
      case 'h2':
        window.document.execCommand('formatBlock', false, 'h2');
        break;
      case 'ul':
        window.document.execCommand('insertUnorderedList');
        break;
      case 'ol':
        window.document.execCommand('insertOrderedList');
        break;
      case 'quote':
        window.document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) window.document.execCommand('createLink', false, url);
        break;
      }
      case 'hr':
        window.document.execCommand('insertHorizontalRule');
        break;
    }
    editorRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div
        className={`sticky top-0 z-10 flex items-center gap-0.5 p-1.5 rounded-lg border transition-all duration-200 ${
          isFocused
            ? 'bg-surface border-border/80 shadow-lg shadow-black/20'
            : 'bg-surface/50 border-border/30'
        }`}
      >
        {toolbarItems.map((item, index) => {
          if ('type' in item && item.type === 'separator') {
            return <Separator key={index} orientation="vertical" className="h-5 mx-1" />;
          }
          if ('icon' in item) {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-surface-active"
                onClick={() => execCommand(item.command)}
                title={item.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            );
          }
          return null;
        })}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-brand hover:text-brand-light"
        >
          <Sparkles className="h-3 w-3" />
          AI Improve
        </Button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[500px] p-1 outline-none text-[15px] leading-relaxed text-foreground/90 selection:bg-brand/20 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>blockquote]:border-l-2 [&>blockquote]:border-brand [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:mb-3"
        data-placeholder="Start writing your document..."
      />

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
