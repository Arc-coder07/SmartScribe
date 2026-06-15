import type { DocumentType, VaultCategory } from './types';

// ─── Document Type Metadata ─────────────────────────────────────────────────

export const DOCUMENT_TYPE_META: Record<
  DocumentType,
  { label: string; icon: string; color: string; description: string }
> = {
  proposal: {
    label: 'Proposal',
    icon: 'FileText',
    color: '#10a37f',
    description: 'Business proposals and pitches',
  },
  invoice: {
    label: 'Invoice',
    icon: 'Receipt',
    color: '#3B82F6',
    description: 'Payment invoices and billing',
  },
  contract: {
    label: 'Contract',
    icon: 'FileCheck',
    color: '#10B981',
    description: 'Legal contracts and agreements',
  },
  report: {
    label: 'Report',
    icon: 'BarChart3',
    color: '#F59E0B',
    description: 'Business and project reports',
  },
  'business-plan': {
    label: 'Business Plan',
    icon: 'Briefcase',
    color: '#EC4899',
    description: 'Strategic business plans',
  },
  'meeting-summary': {
    label: 'Meeting Summary',
    icon: 'Users',
    color: '#12b78e',
    description: 'Meeting notes and summaries',
  },
  'client-update': {
    label: 'Client Update',
    icon: 'Send',
    color: '#06B6D4',
    description: 'Client communication updates',
  },
  'project-doc': {
    label: 'Project Doc',
    icon: 'FolderOpen',
    color: '#F97316',
    description: 'Project documentation',
  },
};

// ─── Vault Category Metadata ────────────────────────────────────────────────

export const VAULT_CATEGORY_META: Record<
  VaultCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  company: {
    label: 'Company Details',
    icon: 'Building2',
    color: '#10a37f',
    description: 'Company information and branding',
  },
  team: {
    label: 'Team Members',
    icon: 'Users',
    color: '#3B82F6',
    description: 'Team member profiles and roles',
  },
  services: {
    label: 'Services',
    icon: 'Layers',
    color: '#10B981',
    description: 'Services and offerings',
  },
  pricing: {
    label: 'Pricing',
    icon: 'DollarSign',
    color: '#F59E0B',
    description: 'Pricing structures and rates',
  },
  clients: {
    label: 'Clients',
    icon: 'UserCheck',
    color: '#EC4899',
    description: 'Client information and history',
  },
  brand: {
    label: 'Brand Voice',
    icon: 'Palette',
    color: '#12b78e',
    description: 'Brand guidelines and tone',
  },
};

// ─── Navigation Items ───────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', shortcut: '⌘1' },
  { label: 'Documents', href: '/documents', icon: 'FileText', shortcut: '⌘2' },
  { label: 'Templates', href: '/templates', icon: 'LayoutTemplate', shortcut: '⌘3' },
  { label: 'Knowledge Vault', href: '/vault', icon: 'Database', shortcut: '⌘4' },
  { label: 'Clients', href: '/clients', icon: 'Users', shortcut: '⌘5' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3', shortcut: '⌘6' },
  { label: 'Settings', href: '/settings', icon: 'Settings', shortcut: '⌘,' },
] as const;

// ─── App Constants ──────────────────────────────────────────────────────────

export const APP_NAME = 'SmartScribe';
export const APP_TAGLINE = 'Intelligent Business Document OS';
export const APP_DESCRIPTION =
  'AI-powered workspace to generate, manage, and optimize professional business documents.';

// ─── Keyboard Shortcuts ─────────────────────────────────────────────────────

export const SHORTCUTS = {
  commandPalette: { key: 'k', meta: true, label: '⌘K' },
  search: { key: '/', meta: false, label: '/' },
  copilot: { key: '.', meta: true, label: '⌘.' },
  newDocument: { key: 'n', meta: true, label: '⌘N' },
  save: { key: 's', meta: true, label: '⌘S' },
  export: { key: 'e', meta: true, shift: true, label: '⇧⌘E' },
} as const;

// ─── Health Score Thresholds ────────────────────────────────────────────────

export const HEALTH_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 0,
} as const;

export const HEALTH_COLORS = {
  excellent: '#10B981',
  good: '#3B82F6',
  fair: '#F59E0B',
  poor: '#EF4444',
} as const;
