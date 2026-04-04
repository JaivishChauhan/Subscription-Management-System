"use client";

import { useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CountUp } from "countup.js";

interface DashboardClientProps {
  stats: {
    activeSubscriptions: number;
    revenueMTD: number;
    outstanding: number;
    overdue: number;
  };
  revenueData: Array<{ month: string; actual: number; forecast: number }>;
  churnData: Array<{ name: string; sub: string; initials: string | null }>;
  timeline: Array<{
    color: string;
    title: string;
    desc: string;
    time: string;
  }>;
  planDist: Array<{ name: string; pct: string; color: string }>;
}

export function DashboardClient({
  stats,
  revenueData,
  churnData,
  timeline,
  planDist,
}: DashboardClientProps) {
  const subsRef = useRef<HTMLHeadingElement>(null);
  const revRef = useRef<HTMLHeadingElement>(null);
  const outRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (subsRef.current)
      new CountUp(subsRef.current, stats.activeSubscriptions, {
        duration: 1.5,
        separator: ",",
      }).start();
    if (revRef.current)
      new CountUp(revRef.current, stats.revenueMTD, {
        duration: 1.5,
        prefix: "₹",
        separator: ",",
      }).start();
    if (outRef.current)
      new CountUp(outRef.current, stats.outstanding, {
        duration: 1.5,
        prefix: "₹",
        separator: ",",
      }).start();
  }, [stats]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 anim-up">
      {/* AI WEEKLY DIGEST */}
      <section className="relative overflow-hidden rounded-r-lg border-l-4 border-indigo-500 bg-white shadow-sm p-5 border border-border">
        <div className="absolute right-0 top-0 h-full w-64 opacity-10">
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-transparent"></div>
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1">
            <span
              className="material-symbols-outlined text-indigo-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h3 className="f-syne mb-1 text-[13px] font-bold text-foreground">
              Weekly Intelligence Digest
            </h3>
            <p className="f-mono max-w-4xl text-[11px] leading-relaxed text-muted-foreground">
              8 new subscriptions this week (+23%).{" "}
              <span className="text-indigo-600 font-bold">₹1.24L</span> revenue collected.
              2 customers flagged as high churn risk based on activity patterns.
              Forecasted MRR growth remains stable at{" "}
              <span className="text-emerald-500 font-bold">4.2%</span>.
            </p>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-indigo-500"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Active Subscriptions
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={subsRef}
              className="f-syne text-4xl font-extrabold text-foreground"
            >
              0
            </h4>
            <span className="f-mono text-[11px] font-medium text-emerald-500">
              +12 growth
            </span>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-indigo-500"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Revenue MTD
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={revRef}
              className="f-syne text-4xl font-extrabold text-foreground"
            >
              0
            </h4>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-amber-500"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Outstanding
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={outRef}
              className="f-syne text-4xl font-extrabold text-amber-500"
            >
              0
            </h4>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-red-500"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Overdue
          </p>
          <div className="flex items-baseline gap-3">
            <h4 className="f-syne text-4xl font-extrabold text-red-500">
              {stats.overdue}
            </h4>
            <span className="f-mono text-[11px] font-medium text-red-500">
              Critical
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS (60/40) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Revenue Overview */}
        <div className="rounded-lg bg-card border border-border shadow-sm p-6 lg:col-span-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="f-syne text-lg font-bold text-foreground">
                Revenue Overview
              </h3>
              <p className="f-mono text-[11px] text-muted-foreground">
                Real-time performance vs AI Forecast
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <span className="f-mono text-[10px] text-muted-foreground">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400 border border-violet-500 border-dashed"></span>
                <span className="f-mono text-[10px] text-muted-foreground">
                  Forecast
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="indigoFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontFamily: "DM Mono",
                  fontSize: 12,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                labelStyle={{ color: "var(--foreground)" }}
                itemStyle={{ color: "var(--muted-foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#indigoFill)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="flex flex-col rounded-lg bg-card shadow-sm border border-border p-6 lg:col-span-4">
          <h3 className="f-syne mb-2 text-lg font-bold text-foreground">
            Plan Distribution
          </h3>
          <p className="f-mono mb-8 text-[11px] text-muted-foreground">
            Active users by tier
          </p>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative h-48 w-48 rounded-full border-[16px] border-slate-100">
              <div className="absolute inset-0 rotate-45 rounded-full border-[16px] border-indigo-500 border-r-transparent border-t-transparent"></div>
              <div className="absolute inset-0 -rotate-12 rounded-full border-[16px] border-violet-500 border-b-transparent border-l-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="f-syne text-2xl font-bold text-foreground">3 Tiers</span>
                <span className="f-mono text-[10px] text-muted-foreground">
                  Scale Ready
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {planDist.map((p) => (
              <div
                key={p.name}
                className="f-mono flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: p.color }}
                  ></span>
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <span className="text-foreground font-bold">{p.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW (50/50) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Churn Risk Monitor */}
        <div className="rounded-lg bg-card border border-border shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="f-syne text-lg font-bold text-foreground">
              Churn Risk Monitor
            </h3>
            <button className="f-mono text-[10px] uppercase text-indigo-600 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {churnData.map((c, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded bg-muted/40 border border-transparent p-3 transition-colors hover:border-border hover:bg-muted"
              >
                <div className="flex items-center gap-4">
                  {c.initials ? (
                    <div className="f-syne flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm text-[10px] font-bold text-foreground/70">
                      {c.initials}
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                  )}
                  <div>
                    <p className="f-syne text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="f-mono text-[10px] text-muted-foreground">
                      {c.sub}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="f-mono rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-red-500">
                    HIGH RISK
                  </span>
                  <span className="material-symbols-outlined cursor-pointer text-lg text-muted-foreground transition-colors group-hover:text-foreground">
                    more_vert
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="rounded-lg bg-card border border-border shadow-sm p-6">
          <h3 className="f-syne mb-6 text-lg font-bold text-foreground">
            Recent Activity
          </h3>
          <div className="relative space-y-8 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[1px] before:bg-border">
            {timeline.map((t, i) => (
              <div key={i} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-4 border-card bg-card"
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }}></div>
                </div>
                <div>
                  <p className="f-syne text-sm font-medium text-foreground">
                    {t.title}
                  </p>
                  <p className="f-mono mt-1 text-[11px] text-muted-foreground">
                    {t.desc}
                  </p>
                  <p className="f-mono mt-2 text-[10px] uppercase text-muted-foreground/60">
                    {t.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
