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
  const chartData =
    data.length > 0
      ? data
      : [
          { month: "Apr", amount: 14000 },
          { month: "May", amount: 22000 },
          { month: "Jun", amount: 19000 },
          { month: "Jul", amount: 28000 },
          { month: "Aug", amount: 35000 },
          { month: "Sep", amount: 42000 },
        ];

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
