'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Lightbulb,
  HeartPulse,
  Check,
  XIcon,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { useDocumentStore } from '@/lib/stores/document-store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AIMessage, HealthSuggestion, HealthScore } from '@/lib/types';

// ─── Initial AI Message ───────────────────────────────────────────────────────

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hi! I\'m your SmartScribe AI copilot. I can help you draft, refine, and optimize your business documents. What are you working on today?',
    timestamp: new Date().toISOString(),
  }
];


// ─── Suggestion Type Config ─────────────────────────────────────────────────

const SUGGESTION_TYPE_META: Record<
  HealthSuggestion['category'],
  { icon: typeof Sparkles; color: string }
> = {
  professionalism: { icon: MessageSquare, color: '#10a37f' },
  readability: { icon: Lightbulb, color: '#3B82F6' },
  completeness: { icon: Zap, color: '#F59E0B' },
  conversion: { icon: HeartPulse, color: '#EF4444' },
};

// ─── Panel Slide Animation ──────────────────────────────────────────────────

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 } as const,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 } as const,
  },
};

// ─── Copilot Panel ──────────────────────────────────────────────────────────

export function CopilotPanel() {
  const copilotOpen = useUIStore((s) => s.copilotOpen);
  const toggleCopilot = useUIStore((s) => s.toggleCopilot);

  return (
    <AnimatePresence>
      {copilotOpen && (
        <motion.aside
          className="flex h-screen w-[360px] shrink-0 flex-col border-l border-border bg-background"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md gradient-brand">
                <Sparkles className="size-3.5 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                AI Copilot
              </span>
            </div>
            <button
              onClick={toggleCopilot}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ── Tabs Content ───────────────────────────────────────── */}
          <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 w-auto bg-muted/50">
              <TabsTrigger value="chat" className="gap-1.5 text-xs">
                <MessageSquare className="size-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-1.5 text-xs">
                <Lightbulb className="size-3.5" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-1.5 text-xs">
                <HeartPulse className="size-3.5" />
                Health
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex flex-1 flex-col overflow-hidden">
              <ChatTab />
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="flex-1 overflow-y-auto">
              <SuggestionsTab />
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="flex-1 overflow-y-auto">
              <HealthTab />
            </TabsContent>
          </Tabs>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Chat Tab ───────────────────────────────────────────────────────────────

function ChatTab() {
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: AIMessage = { id: `user-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMsg: AIMessage = { id: `ai-${Date.now()}`, role: 'assistant', content: '', timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMsg]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          assistantMsg.content += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMsg };
            return updated;
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                message.role === 'user'
                  ? 'bg-brand/20 text-foreground'
                  : 'bg-muted/50 text-foreground/85'
              )}
            >
              {message.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 text-foreground/85 max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed">
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            className="h-10 bg-muted/50 border-border pr-10 text-xs text-foreground placeholder:text-zinc-600 focus-visible:border-[#10a37f]/50 focus-visible:ring-[#10a37f]/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            disabled={!input.trim() || isLoading}
          >
            <Send className="size-4" />
          </Button>
        </form>
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </div>
    </>
  );
}

// ─── Suggestions Tab ────────────────────────────────────────────────────────

function SuggestionsTab() {
  const { getActiveDocument } = useDocumentStore();
  const document = getActiveDocument();
  const activeSuggestions = document?.healthScore?.suggestions || [];

  const handleAccept = (id: string) => {
    // In a real app, this would apply the change via AI API and update the store
    console.log('Accepted suggestion', id);
  };

  const handleDismiss = (id: string) => {
    console.log('Dismissed suggestion', id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#71717A]">
          {activeSuggestions.length} suggestions
        </p>
      </div>

      {activeSuggestions.map((suggestion) => {
        const meta = SUGGESTION_TYPE_META[suggestion.category] || { icon: Sparkles, color: '#10B981' };
        const Icon = meta.icon;

        return (
          <motion.div
            key={suggestion.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50"
            style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
          >
            {/* Header */}
            <div className="mb-2 flex items-start gap-2">
              <div
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                <Icon
                  className="size-3.5"
                  style={{ color: meta.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-foreground capitalize">
                  {suggestion.category} Suggestion
                </h4>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {suggestion.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(suggestion.id)}
                className="flex items-center gap-1 rounded-md bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand-light transition-colors hover:bg-brand/25"
              >
                <Check className="size-3" />
                Accept
              </button>
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground/70"
              >
                <XIcon className="size-3" />
                Dismiss
              </button>
            </div>
          </motion.div>
        );
      })}

      {activeSuggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <Check className="size-5 text-success" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">All caught up!</p>
          <p className="mt-1 text-xs text-[#71717A]">
            No pending suggestions for this document.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Health Tab ─────────────────────────────────────────────────────────────

function HealthTab() {
  const { getActiveDocument } = useDocumentStore();
  const document = getActiveDocument();
  
  const health = document?.healthScore || {
    overall: 0,
    professionalism: 0,
    readability: 0,
    completeness: 0,
    conversion: 0,
    suggestions: []
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const healthColor = getHealthColor(health.overall);

  const categories = [
    { label: 'Professionalism', score: health.professionalism },
    { label: 'Readability', score: health.readability },
    { label: 'Completeness', score: health.completeness },
    { label: 'Conversion', score: health.conversion },
  ];

  // SVG circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.overall / 100) * circumference;

  return (
    <div className="p-4">
      {/* Circular Score */}
      <div className="flex flex-col items-center py-6">
        <div className="relative size-32">
          <svg
            className="-rotate-90"
            width="128"
            height="128"
            viewBox="0 0 128 128"
          >
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={healthColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {health.overall}
            </motion.span>
            <span className="text-[11px] text-muted-foreground">Health Score</span>
          </div>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium uppercase tracking-wider text-[#71717A]">
          Breakdown
        </h4>
        {categories.map(({ label, score }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{label}</span>
              <span
                className="text-sm font-medium"
                style={{ color: getHealthColor(score) }}
              >
                {score}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getHealthColor(score) }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
