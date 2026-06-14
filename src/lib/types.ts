// ─── Document Types ─────────────────────────────────────────────────────────

export type DocumentType =
  | 'proposal'
  | 'invoice'
  | 'contract'
  | 'report'
  | 'business-plan'
  | 'meeting-summary'
  | 'client-update'
  | 'project-doc';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'sent' | 'archived';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  content: string;
  excerpt: string;
  healthScore: HealthScore;
  gaps: GapDetection[];
  versions: DocumentVersion[];
  comments: Comment[];
  tags: string[];
  clientName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  wordCount: number;
}

// ─── Health Score ────────────────────────────────────────────────────────────

export interface HealthScore {
  overall: number;
  professionalism: number;
  readability: number;
  completeness: number;
  conversion: number;
  suggestions: HealthSuggestion[];
}

export interface HealthSuggestion {
  id: string;
  category: 'professionalism' | 'readability' | 'completeness' | 'conversion';
  message: string;
  priority: 'high' | 'medium' | 'low';
  resolved: boolean;
}

// ─── Gap Detection ──────────────────────────────────────────────────────────

export interface GapDetection {
  id: string;
  type: 'missing-section' | 'incomplete' | 'risk' | 'recommendation';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestedFix?: string;
  resolved: boolean;
}

// ─── Version History ────────────────────────────────────────────────────────

export interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  summary: string;
  createdAt: string;
  createdBy: string;
}

// ─── Comments ───────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  content: string;
  author: User;
  type: 'comment' | 'approval' | 'change-request';
  resolved: boolean;
  createdAt: string;
  replies?: Comment[];
}

// ─── Knowledge Vault ────────────────────────────────────────────────────────

export type VaultCategory =
  | 'company'
  | 'team'
  | 'services'
  | 'pricing'
  | 'clients'
  | 'brand';

export interface VaultEntry {
  id: string;
  category: VaultCategory;
  title: string;
  content: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  category: string;
  content: string;
  tags: string[];
  usageCount: number;
  isFeatured: boolean;
  isUserCreated: boolean;
  createdAt: string;
}

// ─── AI ─────────────────────────────────────────────────────────────────────

export interface AISuggestion {
  id: string;
  type: 'wording' | 'structure' | 'pricing' | 'risk' | 'tone';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  accepted: boolean;
  dismissed: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GenerationRequest {
  type: DocumentType;
  companyName: string;
  industry: string;
  clientName: string;
  objectives: string;
  additionalContext?: string;
  templateId?: string;
}

// ─── User & Workspace ───────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  description: string;
  members: User[];
  createdAt: string;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsData {
  documentsCreated: number;
  aiUsage: number;
  savedHours: number;
  activeProjects: number;
  documentsByType: Record<DocumentType, number>;
  creationTrend: { date: string; count: number }[];
  healthTrend: { date: string; score: number }[];
}

// ─── Activity ───────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: 'created' | 'edited' | 'commented' | 'exported' | 'ai-generated' | 'approved';
  title: string;
  description: string;
  documentId?: string;
  user: User;
  timestamp: string;
}

// ─── Command Palette ────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category: 'create' | 'navigate' | 'search' | 'export' | 'ai';
  action: () => void;
}
