'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Send,
  FolderOpen,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DOCUMENT_TYPE_META, HEALTH_COLORS, HEALTH_THRESHOLDS } from '@/lib/constants';
import type { Document } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Briefcase,
  Users,
  Send,
  FolderOpen,
};

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  sent: 'bg-info/10 text-info border-info/20',
  archived: 'bg-muted text-muted-foreground',
};

function getHealthColor(score: number) {
  if (score >= HEALTH_THRESHOLDS.excellent) return HEALTH_COLORS.excellent;
  if (score >= HEALTH_THRESHOLDS.good) return HEALTH_COLORS.good;
  if (score >= HEALTH_THRESHOLDS.fair) return HEALTH_COLORS.fair;
  return HEALTH_COLORS.poor;
}

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
}

export function DocumentCard({ document, viewMode }: DocumentCardProps) {
  const meta = DOCUMENT_TYPE_META[document.type];
  const Icon = iconMap[meta.icon] || FileText;
  const healthColor = getHealthColor(document.healthScore.overall);

  if (viewMode === 'list') {
    return (
      <Link href={`/documents/${document.id}`}>
        <div className="group flex items-center gap-4 p-4 rounded-xl bg-surface/50 border border-border/50 hover:border-brand/30 hover:bg-surface transition-all duration-200 cursor-pointer">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: meta.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate group-hover:text-brand-light transition-colors">
              {document.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{document.excerpt}</p>
          </div>

          <Badge variant="outline" className={`text-xs ${statusStyles[document.status] || ''}`}>
            {document.status}
          </Badge>

          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: healthColor }}
            />
            <span className="text-muted-foreground">{document.healthScore.overall}</span>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1.5 rounded-md hover:bg-surface-active opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/documents/${document.id}`}>
      <div className="group relative rounded-xl bg-surface/50 border border-border/50 hover:border-brand/30 hover:bg-surface p-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: meta.color }} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1.5 rounded-md hover:bg-surface-active opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title & Excerpt */}
        <h3 className="font-medium mb-1.5 line-clamp-1 group-hover:text-brand-light transition-colors">
          {document.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {document.excerpt}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[11px] ${statusStyles[document.status] || ''}`}>
              {document.status}
            </Badge>
            {document.clientName && (
              <span className="text-xs text-muted-foreground">
                • {document.clientName}
              </span>
            )}
          </div>

          {/* Health Score */}
          <div className="flex items-center gap-1.5">
            <div className="relative w-6 h-6">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={healthColor}
                  strokeWidth="2"
                  strokeDasharray={`${(document.healthScore.overall / 100) * 62.83} 62.83`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: healthColor }}>
              {document.healthScore.overall}
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground">
            Updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
