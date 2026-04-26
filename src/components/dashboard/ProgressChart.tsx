"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  week: number;
  weight: number;
}

interface ProgressChartProps {
  data: DataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.23 0.007 255)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tickFormatter={(v) => `W${v}`}
            tick={{ fontSize: 11, fill: "oklch(0.58 0.007 255)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(0.58 0.007 255)" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `${v}kg`}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.135 0.005 255)",
              border: "1px solid oklch(0.23 0.007 255)",
              borderRadius: "8px",
              fontSize: 12,
              color: "oklch(0.935 0.004 255)",
            }}
            labelFormatter={(v) => `Week ${v}`}
            formatter={(v) => [`${v}kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="oklch(0.72 0.19 58)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.72 0.19 58)", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "oklch(0.72 0.19 58)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
