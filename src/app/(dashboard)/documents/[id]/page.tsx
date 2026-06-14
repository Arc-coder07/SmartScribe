'use client';

import { useState, useCallback, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Download,
  MoreHorizontal,
  Clock,
  MessageSquare,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentEditor } from '@/components/documents/document-editor';
import { DocumentHealth } from '@/components/documents/document-health';
import { GapDetector } from '@/components/documents/gap-detector';
import { VersionTimeline } from '@/components/documents/version-timeline';
import { DocumentComments } from '@/components/documents/comments';
import { useDocumentStore } from '@/lib/stores/document-store';
import { useVaultStore } from '@/lib/stores/vault-store';
import { DOCUMENT_TYPE_META } from '@/lib/constants';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { documents, updateDocument } = useDocumentStore();
  const { entries } = useVaultStore();
  const document = documents.find((d) => d.id === id);
  const [activeTab, setActiveTab] = useState('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingHealth, setIsGeneratingHealth] = useState(false);
  const [isGeneratingGaps, setIsGeneratingGaps] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
  }, []);

  const handleContentChange = useCallback(
    (content: string) => {
      if (document) {
        updateDocument(document.id, {
          content,
          updated_at: new Date().toISOString(),
        } as any);
      }
    },
    [document, updateDocument]
  );

  const generateHealthScore = async () => {
    if (!document || !document.content) return;
    setIsGeneratingHealth(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: document.content, 
          type: 'health-score',
          vaultContext: entries.map(e => `${e.title}: ${e.content}`).join('\n')
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newScore = {
          overall: data.score,
          professionalism: data.metrics.professionalism,
          readability: data.metrics.readability,
          completeness: data.metrics.completeness,
          conversion: 80,
          suggestions: data.suggestions.map((s: string, i: number) => ({
            id: `sg-${Date.now()}-${i}`,
            category: 'readability',
            message: s,
            priority: 'medium',
            resolved: false
          }))
        };
        updateDocument(document.id, { health_score: newScore } as any);
      }
    } finally {
      setIsGeneratingHealth(false);
    }
  };

  const generateGaps = async () => {
    if (!document || !document.content) return;
    setIsGeneratingGaps(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: document.content, 
          type: 'gap-detection',
          vaultContext: entries.map(e => `${e.title}: ${e.content}`).join('\n')
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newGaps = data.gaps.map((g: any, i: number) => ({
          ...g,
          id: `gap-${Date.now()}-${i}`,
          type: 'missing-section',
          resolved: false,
          suggestedFix: 'Consider addressing this gap by updating the content.'
        }));
        
        const metadata = document.metadata || {};
        updateDocument(document.id, { metadata: { ...metadata, gaps: newGaps } } as any);
      }
    } finally {
      setIsGeneratingGaps(false);
    }
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
        <h3 className="text-lg font-medium mb-2">Document not found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          The document you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/documents">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const meta = DOCUMENT_TYPE_META[document.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-[calc(100vh-56px)]"
    >
      {/* Document Header */}
      <div className="flex items-center justify-between px-1 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link href="/documents">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <Sparkles className="h-4 w-4" style={{ color: meta.color }} />
          </div>
          <div>
            <h1 className="text-sm font-medium">{document.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{meta.label}</span>
              <span>•</span>
              <span>{document.wordCount} words</span>
              {isSaving && (
                <>
                  <span>•</span>
                  <span className="text-brand animate-pulse">Saving...</span>
                </>
              )}
              {!isSaving && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Saved
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Health Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border/50">
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-border"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={document.healthScore.overall >= 75 ? '#10B981' : '#F59E0B'}
                  strokeWidth="2.5"
                  strokeDasharray={`${(document.healthScore.overall / 100) * 62.83} 62.83`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">{document.healthScore.overall}/100</span>
          </div>

          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Editor Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-6">
            <DocumentEditor
              content={document.content}
              onChange={handleContentChange}
            />
          </div>
        </div>

        {/* Right Panel (tabs) */}
        <div className="w-[320px] border-l border-border/50 flex flex-col bg-surface/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="h-10 w-full rounded-none border-b border-border/50 bg-transparent px-2 justify-start gap-0">
              <TabsTrigger
                value="editor"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-brand px-3"
              >
                <AlertTriangle className="h-3 w-3" />
                Gaps
                {document.gaps.filter((g) => !g.resolved).length > 0 && (
                  <Badge variant="destructive" className="h-4 min-w-4 text-[10px] px-1">
                    {document.gaps.filter((g) => !g.resolved).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-brand px-3"
              >
                <CheckCircle2 className="h-3 w-3" />
                Health
              </TabsTrigger>
              <TabsTrigger
                value="versions"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-brand px-3"
              >
                <GitBranch className="h-3 w-3" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-brand data-[state=active]:shadow-none gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-brand px-3"
              >
                <MessageSquare className="h-3 w-3" />
                <span>{document.comments.length}</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="editor" className="m-0 p-4 h-full">
                {document.gaps && document.gaps.length > 0 ? (
                  <GapDetector gaps={document.gaps} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <p className="text-sm text-muted-foreground">No gaps detected yet.</p>
                    <Button onClick={generateGaps} disabled={isGeneratingGaps} variant="outline" size="sm" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {isGeneratingGaps ? 'Analyzing...' : 'Detect Gaps'}
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="health" className="m-0 p-4 h-full">
                {document.healthScore && document.healthScore.overall > 0 ? (
                  <DocumentHealth healthScore={document.healthScore} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Document health not calculated.</p>
                    <Button onClick={generateHealthScore} disabled={isGeneratingHealth} variant="outline" size="sm" className="gap-2">
                      <HeartPulse className="h-4 w-4" />
                      {isGeneratingHealth ? 'Analyzing...' : 'Calculate Health'}
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="versions" className="m-0 p-4 h-full">
                <VersionTimeline versions={document.versions} />
              </TabsContent>
              <TabsContent value="comments" className="m-0 p-4 h-full">
                <DocumentComments comments={document.comments} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
