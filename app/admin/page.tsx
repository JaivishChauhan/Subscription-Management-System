import { DashboardClient } from "./_components/DashboardClient"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

// Force dynamic since we're displaying real-time data
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  await requireAdminPage()

  // Fetch real data from Prisma for aggregates
  const activeSubsCount = await prisma.subscription.count({
    where: { status: "active" },
  })

  const invoiceAgg = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: "paid" }, // Approximation for Revenue
  })

  const outstandingAgg = await prisma.invoice.aggregate({
    _sum: { amountDue: true },
    where: { status: "confirmed" }, // Not paid, but confirmed
  })

  const overdueCount = await prisma.invoice.count({
    where: {
      status: "confirmed",
      dueDate: { lt: new Date() },
    },
  })

  const stats = {
    activeSubscriptions: activeSubsCount || 0,
    revenueMTD: invoiceAgg._sum.total || 0,
    outstanding: outstandingAgg._sum.amountDue || 0,
    overdue: overdueCount || 0,
  }

  // 1. REVENUE DATA (Real calculation over past 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const recentInvoices = await prisma.invoice.findMany({
    where: {
      status: "paid",
      paidAt: { gte: sixMonthsAgo },
    },
    select: { paidAt: true, total: true },
  })

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ]
  const monthlyRevenue: Record<string, number> = {}

  const currentMonthIdx = new Date().getMonth()
  for (let i = 0; i < 6; i++) {
    let mIdx = currentMonthIdx - (5 - i)
    if (mIdx < 0) mIdx += 12
    monthlyRevenue[monthNames[mIdx]] = 0
  }

  recentInvoices.forEach((inv) => {
    if (inv.paidAt) {
      const m = monthNames[inv.paidAt.getMonth()]
      if (monthlyRevenue[m] !== undefined) {
        monthlyRevenue[m] += inv.total
      }
    }
  })

  let lastVal = 0
  const revenueData = Object.keys(monthlyRevenue).map((month) => {
    const actual = monthlyRevenue[month]
    let forecast = 0
    if (actual > 0) {
      forecast = actual * 1.05
      lastVal = actual
    } else {
      forecast = lastVal > 0 ? lastVal * 1.05 : 0
    }
    return { month, actual, forecast: Math.round(forecast) }
  })

  // 2. CHURN DATA
  const churnCustomers = await prisma.invoice.findMany({
    where: { status: "confirmed", dueDate: { lt: new Date() } },
    take: 4,
    include: { contact: true },
    orderBy: { dueDate: "asc" },
  })

  let churnData = churnCustomers.map((inv) => {
    const name =
      inv.contact?.company ||
      `${inv.contact?.firstName || ""} ${inv.contact?.lastName || ""}`.trim() ||
      "Unknown"
    const daysOverdue = inv.dueDate
      ? Math.floor((new Date().getTime() - inv.dueDate.getTime()) / 86400000)
      : 0
    return {
      name,
      sub: `Overdue by ${daysOverdue} days (₹${inv.amountDue.toLocaleString()})`,
      initials: name.substring(0, 2).toUpperCase(),
    }
  })

  if (churnData.length === 0) {
    churnData = [
      { name: "Healthy Accounts", sub: "No overdue payments", initials: "OK" },
    ]
  }

  // 3. TIMELINE
  const recentSubs = await prisma.subscription.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { contact: true, recurringPlan: true },
  })

  const colors = ["#00E5FF", "#7C3AED", "#EF4444", "#F59E0B"]
  let timeline = recentSubs.map((sub, i) => {
    const name = sub.contact?.company || sub.contact?.firstName || "A customer"
    return {
      color: colors[i % colors.length],
      title: "New Subscription",
      desc: `${name} started the "${sub.recurringPlan?.name || "Custom"}" plan.`,
      time: sub.createdAt.toLocaleDateString(),
    }
  })

  if (timeline.length === 0) {
    timeline = [
      {
        color: "#00E5FF",
        title: "System Ready",
        desc: "Awaiting new subscriptions.",
        time: "Just now",
      },
    ]
  }

  // 4. PLAN DISTRIBUTION
  const activeSubsForPlan = await prisma.subscription.findMany({
    where: { status: "active" },
    include: { recurringPlan: true },
  })

  const planCounts: Record<string, number> = {}
  let totalActive = 0
  activeSubsForPlan.forEach((sub) => {
    if (sub.recurringPlan) {
      planCounts[sub.recurringPlan.name] =
        (planCounts[sub.recurringPlan.name] || 0) + 1
      totalActive++
    }
  })

  const planColors = ["#00E5FF", "#7C3AED", "#1A2535", "#F59E0B", "#EF4444"]
  let planDist = Object.entries(planCounts).map(([name, count], idx) => ({
    name,
    pct: Math.round((count / totalActive) * 100) + "%",
    color: planColors[idx % planColors.length],
  }))

  if (planDist.length === 0) {
    planDist = [{ name: "No active plans", pct: "100%", color: "#1A2535" }]
  }

  return (
    <DashboardClient
      stats={stats}
      revenueData={revenueData}
      churnData={churnData}
      timeline={timeline}
      planDist={planDist}
    />
  )
}
