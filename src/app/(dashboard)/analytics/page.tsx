'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  FileText,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DOCUMENT_TYPE_META } from '@/lib/constants';

// Initial empty data structures
const defaultWeeklyData = [
  { week: 'Week 1', documents: 0, aiUsage: 0 },
  { week: 'Week 2', documents: 0, aiUsage: 0 },
  { week: 'Week 3', documents: 0, aiUsage: 0 },
  { week: 'Week 4', documents: 0, aiUsage: 0 },
];

const defaultTypeData = [
  { name: 'Proposals', value: 0, color: DOCUMENT_TYPE_META.proposal.color },
  { name: 'Invoices', value: 0, color: DOCUMENT_TYPE_META.invoice.color },
  { name: 'Contracts', value: 0, color: DOCUMENT_TYPE_META.contract.color },
  { name: 'Reports', value: 0, color: DOCUMENT_TYPE_META.report.color },
  { name: 'Other', value: 0, color: 'var(--color-muted-foreground)' },
];

const defaultHealthTrend = [
  { month: 'Jan', score: 0 },
  { month: 'Feb', score: 0 },
  { month: 'Mar', score: 0 },
  { month: 'Apr', score: 0 },
];

const defaultTopTemplates: any[] = [];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {item.name}: <span className="text-foreground font-medium">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDocs: 0,
    aiPrompts: 0,
    hoursSaved: 0,
    avgHealth: 0,
  });
  
  const [typeData, setTypeData] = useState(defaultTypeData);
  const [topTemplates, setTopTemplates] = useState(defaultTopTemplates);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: docs } = await supabase
          .from('documents')
          .select('type, created_at, health_score')
          .eq('user_id', user.id);

        if (docs) {
          // Calculate quick stats
          const totalDocs = docs.length;
          let totalHealth = 0;
          let healthCount = 0;
          
          docs.forEach(d => {
            if (d.health_score && typeof d.health_score === 'object') {
               const score = (d.health_score as any).overallScore;
               if (typeof score === 'number') {
                 totalHealth += score;
                 healthCount++;
               }
            }
          });

          const avgHealth = healthCount > 0 ? Math.round(totalHealth / healthCount) : 0;
          // Dummy calculation for AI Prompts and Hours Saved since we don't track it properly yet
          const aiPrompts = totalDocs * 3; 
          const hoursSaved = Math.round(totalDocs * 1.5 * 10) / 10; // 1.5 hours per doc

          setStats({ totalDocs, aiPrompts, hoursSaved, avgHealth });

          // Calculate Type Data
          const counts: Record<string, number> = { proposal: 0, invoice: 0, contract: 0, report: 0, other: 0 };
          docs.forEach(d => {
            const t = d.type.toLowerCase();
            if (counts[t] !== undefined) {
              counts[t]++;
            } else {
              counts.other++;
            }
          });

          const newTypeData = [
            { name: 'Proposals', value: counts.proposal, color: DOCUMENT_TYPE_META.proposal.color },
            { name: 'Invoices', value: counts.invoice, color: DOCUMENT_TYPE_META.invoice.color },
            { name: 'Contracts', value: counts.contract, color: DOCUMENT_TYPE_META.contract.color },
            { name: 'Reports', value: counts.report, color: DOCUMENT_TYPE_META.report.color },
            { name: 'Other', value: counts.other, color: 'var(--color-muted-foreground)' },
          ].filter(item => item.value > 0); // Only show types that have documents

          if (newTypeData.length > 0) {
            setTypeData(newTypeData);
          } else {
            // Revert back to original array, but mapped with 0
            setTypeData(defaultTypeData.map(t => ({...t, value: 1}))); // Fallback to uniform circle when empty
          }
        }

        // Fetch top templates
        const { data: templates } = await supabase
          .from('templates')
          .select('name, usage_count')
          .eq('user_id', user.id)
          .order('usage_count', { ascending: false })
          .limit(5);

        if (templates && templates.length > 0) {
          setTopTemplates(templates.map(t => ({ name: t.name, uses: t.usage_count || 0, trend: 0 })));
        } else {
          setTopTemplates([]); // Empty array when no templates
        }

      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-brand" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your document creation, AI usage, and productivity metrics.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: stats.totalDocs.toString(), change: '+0%', up: true, icon: FileText, color: '#10a37f' },
          { label: 'AI Prompts Used', value: stats.aiPrompts.toString(), change: '+0%', up: true, icon: Sparkles, color: '#3B82F6' },
          { label: 'Hours Saved', value: `${stats.hoursSaved}h`, change: '+0%', up: true, icon: Clock, color: '#10B981' },
          { label: 'Avg Health Score', value: stats.avgHealth.toString(), change: '+0%', up: true, icon: TrendingUp, color: '#F59E0B' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="p-4 rounded-xl bg-card border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-success' : 'text-destructive'}`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Document Creation Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-4 p-5 rounded-xl bg-card border border-border shadow-sm"
        >
          <h3 className="text-sm font-medium mb-4">Document Creation Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={defaultWeeklyData}>
                <defs>
                  <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10a37f" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10a37f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="documents" name="Documents" stroke="#10a37f" fill="url(#docGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Documents by Type */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-3 p-5 rounded-xl bg-card border border-border shadow-sm"
        >
          <h3 className="text-sm font-medium mb-4">Documents by Type</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {typeData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Health Score Trend + Top Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="p-5 rounded-xl bg-card border border-border shadow-sm"
        >
          <h3 className="text-sm font-medium mb-4">Health Score Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultHealthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="p-5 rounded-xl bg-card border border-border shadow-sm"
        >
          <h3 className="text-sm font-medium mb-4">Top Templates</h3>
          <div className="space-y-3">
            {topTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No templates used yet.</p>
            ) : (
              topTemplates.map((tpl, i) => (
                <div key={tpl.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-sm">{tpl.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{tpl.uses} uses</span>
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${tpl.trend > 0 ? 'text-success' : tpl.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {tpl.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : tpl.trend < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                      {tpl.trend !== 0 ? `${Math.abs(tpl.trend)}%` : '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
