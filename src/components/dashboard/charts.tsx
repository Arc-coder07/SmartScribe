'use client';

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

// ─── Area Chart Data ────────────────────────────────────────────────────────

const weeklyData = [
  { day: 'Mon', count: 3 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 2 },
  { day: 'Thu', count: 7 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 1 },
  { day: 'Sun', count: 6 },
];

// ─── Donut Chart Data ───────────────────────────────────────────────────────

const typeData = [
  { name: 'Proposals', value: 35, color: DOCUMENT_TYPE_META.proposal.color },
  { name: 'Invoices', value: 25, color: DOCUMENT_TYPE_META.invoice.color },
  { name: 'Contracts', value: 15, color: DOCUMENT_TYPE_META.contract.color },
  { name: 'Reports', value: 15, color: DOCUMENT_TYPE_META.report.color },
  { name: 'Other', value: 10, color: '#71717A' },
];

const totalDocs = typeData.reduce((sum, d) => sum + d.value, 0);

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
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
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
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
      {/* Area Chart — Documents Created */}
      <motion.div
        className="glass col-span-1 rounded-xl p-5 lg:col-span-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Documents Created
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyData}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10a37f" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10a37f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11 }}
                dy={8}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'rgba(124, 58, 237, 0.2)',
                  strokeWidth: 1,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10a37f"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#10a37f',
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
        className="glass col-span-1 rounded-xl p-5 lg:col-span-3"
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
          {typeData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-muted-foreground">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
