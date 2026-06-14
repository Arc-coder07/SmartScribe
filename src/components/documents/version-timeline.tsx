'use client';

import { motion } from 'framer-motion';
import { GitCommit, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { DocumentVersion } from '@/lib/types';

interface VersionTimelineProps {
  versions: DocumentVersion[];
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-3">
          <GitCommit className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-medium mb-1">No versions yet</h4>
        <p className="text-xs text-muted-foreground">
          Versions are saved automatically as you edit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Version History
      </h4>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border/50" />

        {/* Version entries */}
        <div className="space-y-0">
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative flex gap-3 py-3 group"
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors ${
                    index === 0
                      ? 'border-brand bg-brand/20'
                      : 'border-border bg-background group-hover:border-brand/50'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-brand' : 'bg-muted-foreground/40'
                    }`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      Version {version.version}
                      {index === 0 && (
                        <span className="ml-2 text-[10px] text-brand font-normal bg-brand/10 px-1.5 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {version.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">
                        {version.createdBy}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50">•</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
