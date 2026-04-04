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
      <section className="relative overflow-hidden rounded-r-lg border-l-4 border-[#7C3AED] bg-[#111820] p-5">
        <div className="absolute right-0 top-0 h-full w-64 opacity-10">
          <div className="h-full w-full bg-gradient-to-br from-[#7C3AED] to-transparent"></div>
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1">
            <span
              className="material-symbols-outlined text-[#7C3AED]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h3 className="f-syne mb-1 text-[13px] font-bold text-[#E8EDF5]">
              Weekly Intelligence Digest
            </h3>
            <p className="f-mono max-w-4xl text-[11px] leading-relaxed text-[#8A9BB5]">
              8 new subscriptions this week (+23%).{" "}
              <span className="text-[#00E5FF]">₹1.24L</span> revenue collected.
              2 customers flagged as high churn risk based on activity patterns.
              Forecasted MRR growth remains stable at{" "}
              <span className="text-green-400">4.2%</span>.
            </p>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-lg bg-[#111820] p-6">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-[#00E5FF]"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-[#8A9BB5]">
            Active Subscriptions
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={subsRef}
              className="f-syne text-4xl font-extrabold text-[#E8EDF5]"
            >
              0
            </h4>
            <span className="f-mono text-[11px] font-medium text-green-400">
              +12 growth
            </span>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-[#111820] p-6">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-[#00E5FF]"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-[#8A9BB5]">
            Revenue MTD
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={revRef}
              className="f-syne text-4xl font-extrabold text-[#E8EDF5]"
            >
              0
            </h4>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-[#111820] p-6">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-[#00E5FF]"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-[#8A9BB5]">
            Outstanding
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={outRef}
              className="f-syne text-4xl font-extrabold text-[#F59E0B]"
            >
              0
            </h4>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg bg-[#111820] p-6">
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-transparent transition-colors group-hover:bg-[#00E5FF]"></div>
          <p className="f-mono mb-4 text-[11px] uppercase tracking-wider text-[#8A9BB5]">
            Overdue
          </p>
          <div className="flex items-baseline gap-3">
            <h4 className="f-syne text-4xl font-extrabold text-[#EF4444]">
              {stats.overdue}
            </h4>
            <span className="f-mono text-[11px] font-medium text-[#EF4444]">
              Critical
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS (60/40) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Revenue Overview */}
        <div className="rounded-lg bg-[#111820] p-6 lg:col-span-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="f-syne text-lg font-bold text-[#E8EDF5]">
                Revenue Overview
              </h3>
              <p className="f-mono text-[11px] text-[#8A9BB5]">
                Real-time performance vs AI Forecast
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00E5FF]"></span>
                <span className="f-mono text-[10px] text-[#8A9BB5]">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]"></span>
                <span className="f-mono text-[10px] text-[#8A9BB5]">
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
                <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#1E2D42"
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#4A5D78", fontSize: 10, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4A5D78", fontSize: 10, fontFamily: "DM Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#111820",
                  border: "1px solid #1E2D42",
                  borderRadius: 4,
                  fontFamily: "DM Mono",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#00E5FF"
                strokeWidth={3}
                fill="url(#cyanFill)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#7C3AED"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="flex flex-col rounded-lg bg-[#111820] p-6 lg:col-span-4">
          <h3 className="f-syne mb-2 text-lg font-bold text-[#E8EDF5]">
            Plan Distribution
          </h3>
          <p className="f-mono mb-8 text-[11px] text-[#8A9BB5]">
            Active users by tier
          </p>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative h-48 w-48 rounded-full border-[16px] border-[#1A2535]">
              <div className="absolute inset-0 rotate-45 rounded-full border-[16px] border-[#00E5FF] border-r-transparent border-t-transparent"></div>
              <div className="absolute inset-0 -rotate-12 rounded-full border-[16px] border-[#7C3AED] border-b-transparent border-l-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="f-syne text-2xl font-bold">3 Tiers</span>
                <span className="f-mono text-[10px] text-[#8A9BB5]">
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
                  <span className="text-[#8A9BB5]">{p.name}</span>
                </div>
                <span className="text-[#E8EDF5]">{p.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW (50/50) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Churn Risk Monitor */}
        <div className="rounded-lg bg-[#111820] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="f-syne text-lg font-bold text-[#E8EDF5]">
              Churn Risk Monitor
            </h3>
            <button className="f-mono text-[10px] uppercase text-[#00E5FF] hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {churnData.map((c, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded bg-[#0D1117] p-3 transition-colors hover:bg-[#1A2535]"
              >
                <div className="flex items-center gap-4">
                  {c.initials ? (
                    <div className="f-syne flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2535] text-[10px] font-bold text-[#8A9BB5]">
                      {c.initials}
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#1A2535]"></div>
                  )}
                  <div>
                    <p className="f-syne text-sm font-medium text-[#E8EDF5]">
                      {c.name}
                    </p>
                    <p className="f-mono text-[10px] text-[#4A5D78]">
                      {c.sub}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="f-mono rounded border border-[#EF4444]/20 bg-[#EF4444]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[#EF4444]">
                    HIGH RISK
                  </span>
                  <span className="material-symbols-outlined cursor-pointer text-lg text-[#4A5D78] transition-colors group-hover:text-[#E8EDF5]">
                    more_vert
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="rounded-lg bg-[#111820] p-6">
          <h3 className="f-syne mb-6 text-lg font-bold text-[#E8EDF5]">
            Recent Activity
          </h3>
          <div className="relative space-y-8 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[1px] before:bg-[#1E2D42]">
            {timeline.map((t, i) => (
              <div key={i} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-4 border-[#111820]"
                  style={{ backgroundColor: t.color }}
                ></div>
                <div>
                  <p className="f-syne text-sm font-medium text-[#E8EDF5]">
                    {t.title}
                  </p>
                  <p className="f-mono mt-1 text-[11px] text-[#8A9BB5]">
                    {t.desc}
                  </p>
                  <p className="f-mono mt-2 text-[10px] uppercase text-[#4A5D78]">
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
