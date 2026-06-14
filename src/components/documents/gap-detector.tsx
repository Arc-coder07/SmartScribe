'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GapDetection } from '@/lib/types';

interface GapDetectorProps {
  gaps: GapDetection[];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    label: 'Suggestion',
  },
};

export function GapDetector({ gaps }: GapDetectorProps) {
  const unresolvedGaps = gaps.filter((g) => !g.resolved);
  const resolvedGaps = gaps.filter((g) => g.resolved);

  if (gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h4 className="text-sm font-medium mb-1">All Clear</h4>
        <p className="text-xs text-muted-foreground">
          No gaps detected in this document.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">
            {unresolvedGaps.length} issue{unresolvedGaps.length !== 1 ? 's' : ''} found
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {resolvedGaps.length} resolved
          </p>
        </div>
        {unresolvedGaps.length > 0 && (
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 bg-brand hover:bg-brand-light text-white"
          >
            <Sparkles className="h-3 w-3" />
            Fix All
          </Button>
        )}
      </div>

      {/* Gap Cards */}
      <div className="space-y-2">
        {unresolvedGaps.map((gap, index) => {
          const config = severityConfig[gap.severity];
          const Icon = config.icon;

          return (
            <motion.div
              key={gap.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} group`}
            >
              <div className="flex gap-2.5">
                <Icon
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: config.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{gap.title}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        color: config.color,
                        backgroundColor: `${config.color}15`,
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {gap.description}
                  </p>
                  {gap.suggestedFix && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] gap-1 text-brand hover:text-brand-light mt-2 -ml-2 px-2"
                    >
                      <Sparkles className="h-3 w-3" />
                      Fix with AI
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resolved Section */}
      {resolvedGaps.length > 0 && (
        <div className="space-y-2 pt-2">
          <h5 className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            Resolved ({resolvedGaps.length})
          </h5>
          {resolvedGaps.map((gap) => (
            <div
              key={gap.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface/30 opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
              <span className="text-xs line-through">{gap.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
