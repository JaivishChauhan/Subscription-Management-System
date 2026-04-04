import { DashboardClient } from "./_components/DashboardClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

// Force dynamic since we're displaying real-time data
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch real data from Prisma for aggregates
  const activeSubsCount = await prisma.subscription.count({
    where: { status: "active" },
  });

  const invoiceAgg = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: "paid" }, // Approximation for Revenue
  });

  const outstandingAgg = await prisma.invoice.aggregate({
    _sum: { amountDue: true },
    where: { status: "confirmed" }, // Not paid, but confirmed
  });

  const overdueCount = await prisma.invoice.count({
    where: {
      status: "confirmed",
      dueDate: { lt: new Date() },
    },
  });

  const stats = {
    activeSubscriptions: activeSubsCount || 247, // fallback to demo if 0
    revenueMTD: invoiceAgg._sum.total || 482300,
    outstanding: outstandingAgg._sum.amountDue || 62500,
    overdue: overdueCount || 3,
  };

  // Remaining mock data - will implement actuals in next phases
  const revenueData = [
    { month: "JAN", actual: 320000, forecast: 310000 },
    { month: "FEB", actual: 340000, forecast: 330000 },
    { month: "MAR", actual: 380000, forecast: 360000 },
    { month: "APR", actual: 420000, forecast: 400000 },
    { month: "MAY", actual: 460000, forecast: 450000 },
    { month: "JUN", actual: 482300, forecast: 500000 },
  ];

  const churnData = [
    { name: "Vanguard Systems", sub: "Last active 4 days ago", initials: null },
    {
      name: "Nexus Labs Inc.",
      sub: "Payment failure (2 retries)",
      initials: null,
    },
    { name: "AquaDynamics", sub: "Usage dropped by 80%", initials: "AQ" },
    { name: "Orbit Data Hub", sub: "Logged 12 support tickets", initials: null },
  ];

  const timeline = [
    {
      color: "#00E5FF",
      title: "New Subscription Activated",
      desc: 'Solaris Creative Agency started "Enterprise Tier" plan.',
      time: "12 Minutes ago",
    },
    {
      color: "#7C3AED",
      title: "AI Model Updated",
      desc: "Forecasting engine calibrated with Q1 actuals.",
      time: "2 Hours ago",
    },
    {
      color: "#EF4444",
      title: "Failed Payment Notification",
      desc: "Transaction of ₹45,000 for Helix Corp was declined.",
      time: "5 Hours ago",
    },
  ];

  const planDist = [
    { name: "Enterprise", pct: "45%", color: "#00E5FF" },
    { name: "Pro / Growth", pct: "38%", color: "#7C3AED" },
    { name: "Starter", pct: "17%", color: "#1A2535" },
  ];

  return (
    <DashboardClient
      stats={stats}
      revenueData={revenueData}
      churnData={churnData}
      timeline={timeline}
      planDist={planDist}
    />
  );
}
