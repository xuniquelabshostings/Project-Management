"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed rounded-lg text-center p-6" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          No revenue recorded yet
        </p>
        <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--muted)", opacity: 0.8 }}>
          Revenue metrics and trends will automatically display once client invoices are settled.
        </p>
      </div>
    );
  }

  const chartData = data;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CC785C" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#CC785C" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
          <XAxis
            dataKey="month"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "6px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#CC785C"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#terracottaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
