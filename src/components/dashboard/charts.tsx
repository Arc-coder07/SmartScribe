'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { DOCUMENT_TYPE_META } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: { day?: string; name?: string };
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-card border border-border px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">
        {label || payload[0]?.payload?.name}
      </p>
      <p className="mt-0.5 text-muted-foreground">
        {payload[0]?.value} {payload[0]?.name === 'value' ? '%' : 'docs'}
      </p>
    </div>
  );
}

// ─── Animation ──────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function Charts() {
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [typeData, setTypeData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: docs } = await supabase
        .from('documents')
        .select('created_at, type')
        .eq('user_id', user.id);

      if (docs) {
        // Aggregate Type Data
        const typeCounts = docs.reduce((acc, doc) => {
          const type = doc.type || 'other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const newTypeData = Object.entries(typeCounts).map(([type, count]) => {
          const meta = DOCUMENT_TYPE_META[type as keyof typeof DOCUMENT_TYPE_META];
          return {
            name: meta ? meta.label : type.charAt(0).toUpperCase() + type.slice(1),
            value: count,
            color: meta ? meta.color : '#71717A',
          };
        });
        setTypeData(newTypeData);
        setTotalDocs(docs.length);

        // Aggregate Weekly Data (last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekCounts = new Array(7).fill(0);
        const today = new Date();
        
        docs.forEach(doc => {
          const docDate = new Date(doc.created_at);
          const diffTime = Math.abs(today.getTime() - docDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            const dayIndex = docDate.getDay();
            weekCounts[dayIndex]++;
          }
        });

        const newWeeklyData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          newWeeklyData.push({
            day: days[d.getDay()],
            count: weekCounts[d.getDay()]
          });
        }
        setWeeklyData(newWeeklyData);
      }
    }
    loadData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
      {/* Area Chart — Documents Created */}
      <motion.div
        className="col-span-1 rounded-xl bg-card border border-border p-5 shadow-sm lg:col-span-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Documents Created (Last 7 Days)
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyData}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                dy={8}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'var(--color-border)',
                  strokeWidth: 1,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-brand)"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: 'var(--color-brand)',
                  stroke: 'var(--background)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Donut Chart — By Type */}
      <motion.div
        className="col-span-1 rounded-xl bg-card border border-border p-5 shadow-sm lg:col-span-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          By Type
        </h3>
        <div className="flex h-[200px] items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {totalDocs}
              </span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {typeData.length > 0 ? typeData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-muted-foreground">
                {entry.name}
              </span>
            </div>
          )) : (
            <span className="text-[11px] text-muted-foreground">No data</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
