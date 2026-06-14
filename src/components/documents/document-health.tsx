'use client';

import { motion } from 'framer-motion';
import { HEALTH_COLORS, HEALTH_THRESHOLDS } from '@/lib/constants';
import type { HealthScore } from '@/lib/types';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface DocumentHealthProps {
  healthScore: HealthScore;
}

function getHealthLabel(score: number) {
  if (score >= HEALTH_THRESHOLDS.excellent) return 'Excellent';
  if (score >= HEALTH_THRESHOLDS.good) return 'Good';
  if (score >= HEALTH_THRESHOLDS.fair) return 'Needs Work';
  return 'Poor';
}

function getHealthColor(score: number) {
  if (score >= HEALTH_THRESHOLDS.excellent) return HEALTH_COLORS.excellent;
  if (score >= HEALTH_THRESHOLDS.good) return HEALTH_COLORS.good;
  if (score >= HEALTH_THRESHOLDS.fair) return HEALTH_COLORS.fair;
  return HEALTH_COLORS.poor;
}

const categories = [
  { key: 'professionalism' as const, label: 'Professionalism', icon: '🎯' },
  { key: 'readability' as const, label: 'Readability', icon: '📖' },
  { key: 'completeness' as const, label: 'Completeness', icon: '✅' },
  { key: 'conversion' as const, label: 'Conversion', icon: '📈' },
];

export function DocumentHealth({ healthScore }: DocumentHealthProps) {
  const overallColor = getHealthColor(healthScore.overall);
  const overallLabel = getHealthLabel(healthScore.overall);
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (healthScore.overall / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Overall Score Circle */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={overallColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl font-bold"
              style={{ color: overallColor }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {healthScore.overall}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-sm font-medium mt-3" style={{ color: overallColor }}>
          {overallLabel}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Breakdown
        </h4>
        {categories.map(({ key, label, icon }, index) => {
          const score = healthScore[key];
          const color = getHealthColor(score);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-xs">{icon}</span>
                  {label}
                </span>
                <span className="font-medium" style={{ color }}>
                  {score}
                </span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Suggestions */}
      {healthScore.suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Suggestions
          </h4>
          {healthScore.suggestions
            .filter((s) => !s.resolved)
            .map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex gap-2.5 p-3 rounded-lg bg-surface/50 border border-border/30"
              >
                {suggestion.priority === 'high' ? (
                  <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm leading-snug">{suggestion.message}</p>
                  <span className="text-[11px] text-muted-foreground capitalize mt-1 inline-block">
                    {suggestion.category}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
