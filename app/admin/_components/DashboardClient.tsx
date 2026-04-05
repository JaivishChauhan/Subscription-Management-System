"use client"

import { useEffect, useRef } from "react"
import { IconSparkles, IconDotsVertical } from "@tabler/icons-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { CountUp } from "countup.js"

interface DashboardClientProps {
  stats: {
    activeSubscriptions: number
    revenueMTD: number
    outstanding: number
    overdue: number
  }
  revenueData: Array<{ month: string; actual: number; forecast: number }>
  churnData: Array<{
    name: string
    sub: string
    initials: string | null
    status?: "high" | "ok"
  }>
  timeline: Array<{
    color: string
    title: string
    desc: string
    time: string
  }>
  planDist: Array<{ name: string; pct: string; color: string }>
  billingDist: Array<{ name: string; pct: string; color: string }>
  statusDist: Array<{ name: string; pct: string; color: string }>
}

export function DashboardClient({
  stats,
  revenueData,
  churnData,
  timeline,
  planDist,
  billingDist,
  statusDist,
}: DashboardClientProps) {
  const subsRef = useRef<HTMLHeadingElement>(null)
  const revRef = useRef<HTMLHeadingElement>(null)
  const outRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (subsRef.current)
      new CountUp(subsRef.current, stats.activeSubscriptions, {
        duration: 1.5,
        separator: ",",
      }).start()
    if (revRef.current)
      new CountUp(revRef.current, stats.revenueMTD, {
        duration: 1.5,
        prefix: "₹",
        separator: ",",
      }).start()
    if (outRef.current)
      new CountUp(outRef.current, stats.outstanding, {
        duration: 1.5,
        prefix: "₹",
        separator: ",",
      }).start()
  }, [stats])

  return (
    <div className="anim-up mx-auto w-full max-w-[1600px] space-y-8">
      {/* AI WEEKLY DIGEST */}
      <section className="border-border relative overflow-hidden rounded-r-lg border border-l-4 border-indigo-500 bg-white p-5 shadow-sm">
        <div className="absolute top-0 right-0 h-full w-64 opacity-10">
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-transparent"></div>
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1">
            <IconSparkles className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="f-syne text-foreground mb-1 text-[13px] font-bold">
              Weekly Intelligence Digest
            </h3>
            <p className="f-mono text-muted-foreground max-w-4xl text-[11px] leading-relaxed">
              8 new subscriptions this week (+23%).{" "}
              <span className="font-bold text-indigo-600">₹1.24L</span> revenue
              collected. 2 customers flagged as high churn risk based on
              activity patterns. Forecasted MRR growth remains stable at{" "}
              <span className="font-bold text-emerald-500">4.2%</span>.
            </p>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="group bg-card border-border relative overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-indigo-500"></div>
          <p className="f-mono text-muted-foreground mb-4 text-[11px] tracking-wider uppercase">
            Active Subscriptions
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={subsRef}
              className="f-syne text-foreground text-4xl font-extrabold"
            >
              0
            </h4>
            <span className="f-mono text-[11px] font-medium text-emerald-500">
              +12 growth
            </span>
          </div>
        </div>
        <div className="group bg-card border-border relative overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-transparent transition-colors group-hover:bg-indigo-500"></div>
          <p className="f-mono text-muted-foreground mb-4 text-[11px] tracking-wider uppercase">
            Revenue MTD
          </p>
          <div className="flex items-baseline gap-3">
            <h4
              ref={revRef}
              className="f-syne text-foreground text-4xl font-extrabold"
            >
              0
            </h4>
          </div>
        </div>
        <div className="group bg-card border-border relative overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-transparent transition-colors group-hover:bg-amber-500"></div>
          <p className="f-mono text-muted-foreground mb-4 text-[11px] tracking-wider uppercase">
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
        <div className="group bg-card border-border relative overflow-hidden rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-transparent transition-colors group-hover:bg-red-500"></div>
          <p className="f-mono text-muted-foreground mb-4 text-[11px] tracking-wider uppercase">
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
        <div className="bg-card border-border rounded-lg border p-6 shadow-sm lg:col-span-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="f-syne text-foreground text-lg font-bold">
                Revenue Overview
              </h3>
              <p className="f-mono text-muted-foreground text-[11px]">
                Real-time performance vs AI Forecast
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <span className="f-mono text-muted-foreground text-[10px]">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-dashed border-violet-500 bg-violet-400"></span>
                <span className="f-mono text-muted-foreground text-[10px]">
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
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
        <div className="bg-card border-border flex flex-col rounded-lg border p-6 shadow-sm lg:col-span-4">
          <h3 className="f-syne text-foreground mb-2 text-lg font-bold">
            Plan Distribution
          </h3>
          <p className="f-mono text-muted-foreground mb-8 text-[11px]">
            Active users by tier
          </p>
          <div className="relative flex min-h-[240px] flex-1 flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDist.map((p) => ({
                    ...p,
                    value: parseFloat(p.pct) || 0,
                  }))}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {planDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Active Users"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="f-syne text-foreground text-2xl font-bold">
                {planDist.length} Tiers
              </span>
              <span className="f-mono text-muted-foreground text-[10px]">
                Scale Ready
              </span>
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

      {/* ADDITIONAL DISTRIBUTIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Billing Period Distribution */}
        <div className="bg-card border-border flex flex-col rounded-lg border p-6 shadow-sm">
          <h3 className="f-syne text-foreground mb-2 text-lg font-bold">
            Billing Period
          </h3>
          <p className="f-mono text-muted-foreground mb-8 text-[11px]">
            Active users by period
          </p>
          <div className="relative flex min-h-[240px] flex-1 flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={billingDist.map((p) => ({
                    ...p,
                    value: parseFloat(p.pct) || 0,
                  }))}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {billingDist.map((entry, index) => (
                    <Cell key={`cell-billing-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Users"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="f-syne text-foreground text-2xl font-bold">
                {billingDist.length > 0 &&
                billingDist[0].name !== "No billing periods"
                  ? billingDist.length
                  : 0}{" "}
                Periods
              </span>
              <span className="f-mono text-muted-foreground text-[10px]">
                Distribution
              </span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {billingDist.map((p) => (
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

        {/* Status Distribution */}
        <div className="bg-card border-border flex flex-col rounded-lg border p-6 shadow-sm">
          <h3 className="f-syne text-foreground mb-2 text-lg font-bold">
            Subscription Status
          </h3>
          <p className="f-mono text-muted-foreground mb-8 text-[11px]">
            All subscriptions by status
          </p>
          <div className="relative flex min-h-[240px] flex-1 flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist.map((p) => ({
                    ...p,
                    value: parseFloat(p.pct) || 0,
                  }))}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Subscriptions"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="f-syne text-foreground text-2xl font-bold">
                {statusDist.length > 0 &&
                statusDist[0].name !== "No subscriptions"
                  ? statusDist.length
                  : 0}{" "}
                Statuses
              </span>
              <span className="f-mono text-muted-foreground text-[10px]">
                Overview
              </span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {statusDist.map((p) => (
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
        <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="f-syne text-foreground text-lg font-bold">
              Churn Risk Monitor
            </h3>
            <button className="f-mono text-[10px] text-indigo-600 uppercase hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {churnData.map((c, i) => (
              <div
                key={i}
                className="group bg-muted/40 hover:border-border hover:bg-muted flex items-center justify-between rounded border border-transparent p-3 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {c.initials ? (
                    <div className="f-syne bg-card border-border text-foreground/70 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold shadow-sm">
                      {c.initials}
                    </div>
                  ) : (
                    <div className="bg-muted h-8 w-8 rounded-full"></div>
                  )}
                  <div>
                    <p className="f-syne text-foreground text-sm font-medium">
                      {c.name}
                    </p>
                    <p className="f-mono text-muted-foreground text-[10px]">
                      {c.sub}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {c.status === "high" && (
                    <span className="f-mono rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-500 uppercase">
                      HIGH RISK
                    </span>
                  )}
                  {c.status === "ok" && (
                    <span className="f-mono rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 uppercase">
                      OK
                    </span>
                  )}
                  <IconDotsVertical className="text-muted-foreground group-hover:text-foreground h-5 w-5 cursor-pointer transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
          <h3 className="f-syne text-foreground mb-6 text-lg font-bold">
            Recent Activity
          </h3>
          <div className="before:bg-border relative space-y-8 before:absolute before:top-2 before:bottom-0 before:left-[11px] before:w-[1px]">
            {timeline.map((t, i) => (
              <div key={i} className="relative pl-10">
                <div className="border-card bg-card absolute top-1 left-0 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-4">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: t.color }}
                  ></div>
                </div>
                <div>
                  <p className="f-syne text-foreground text-sm font-medium">
                    {t.title}
                  </p>
                  <p className="f-mono text-muted-foreground mt-1 text-[11px]">
                    {t.desc}
                  </p>
                  <p className="f-mono text-muted-foreground/60 mt-2 text-[10px] uppercase">
                    {t.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
