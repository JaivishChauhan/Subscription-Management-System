"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  featured: boolean;
}

interface ShopClientProps {
  products: Product[];
  categories: string[];
}

export function ShopClient({ products, categories }: ShopClientProps) {
  const [filter, setFilter] = useState("All");
  const [billing, setBilling] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (p: Product) => {
    const isYearly = billing[p.id];
    const uniqueId = `${p.id}-${crypto.randomUUID()}`;
    addItem({
      id: uniqueId,
      name: p.name,
      price: isYearly ? p.yearlyPrice : p.price,
      quantity: 1,
      plan: isYearly ? "Yearly" : "Monthly",
    });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="anim-up relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200 opacity-30 blur-[140px]"></div>
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-violet-200 opacity-30 blur-[160px]"></div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <h1 className="f-syne mb-6 text-[52px] font-extrabold leading-[1.1] tracking-tight text-foreground">
            Choose your perfect
            <br />
            subscription plan
          </h1>
          <p className="f-mono mx-auto mb-10 max-w-lg text-[13px] text-muted-foreground">
            Scale your infrastructure with surgical precision using our
            architectural tiers designed for high-velocity engineering teams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="f-syne rounded-full bg-indigo-600 px-8 py-3 font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-95">
              Explore Plans →
            </button>
            <button className="f-syne rounded-full border border-indigo-200 bg-white px-8 py-3 font-bold text-indigo-600 shadow-sm transition-colors hover:bg-slate-50">
              Talk to AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto mb-12 max-w-7xl px-6 relative z-10">
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setFilter(c)}
              className={`f-mono whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-colors ${
                filter === c
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground shadow-sm"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                p.featured
                  ? "border-2 border-indigo-500 shadow-indigo-500/10"
                  : "border border-border hover:border-indigo-300"
              }`}
            >
              {p.featured && (
                <div className="absolute right-4 top-4 z-20">
                  <span className="f-syne rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`relative h-32 overflow-hidden ${p.featured ? 'bg-indigo-500/10' : 'bg-muted/40'}`}>
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card"></div>
              </div>
              <div className="p-8 pt-4">
                <h3 className="f-syne mb-2 text-[18px] font-bold text-foreground">
                  {p.name}
                </h3>
                {p.featured && (
                  <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-border bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setBilling({ ...billing, [p.id]: false })}
                      className={`f-mono rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${
                        !billing[p.id]
                          ? "bg-card text-indigo-600 shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBilling({ ...billing, [p.id]: true })}
                      className={`f-mono rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${
                        billing[p.id]
                          ? "bg-card text-indigo-600 shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                )}
                <div className="mb-6">
                  <span
                    className="f-syne text-[36px] font-extrabold tracking-tight"
                    style={{ color: p.featured ? "#4F46E5" : "#111827" }}
                  >
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(billing[p.id] ? p.yearlyPrice : p.price)}
                  </span>
                  <span className="f-mono text-xs text-muted-foreground">
                    {" "}
                    / month
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`material-symbols-outlined text-lg translate-y-[2px] ${
                          p.featured ? "text-indigo-500" : "text-slate-400"
                        }`}
                      >
                        check_circle
                      </span>
                      <span
                        className={`f-mono text-[13px] ${
                          p.featured ? "text-slate-700 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  className={`f-syne w-full rounded-full py-3 font-bold transition-all ${
                    p.featured
                      ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20"
                      : "border-2 border-border text-foreground hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/5"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI FAB */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        {chatOpen && (
          <div
            className="flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 shadow-inner">
                  <span
                    className="material-symbols-outlined text-sm text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div>
                  <p className="f-syne text-xs font-bold leading-none text-white">
                    AI Assistant
                  </p>
                  <p className="f-mono mt-1 text-[10px] text-indigo-100">
                    Online &amp; ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="text-indigo-100 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              <div className="flex flex-col gap-1">
                <div className="rounded-xl rounded-tl-none border border-indigo-500/20 bg-indigo-500/10 p-3 shadow-sm">
                  <p className="f-mono text-[11px] text-foreground">
                    Hello! I&apos;ve analyzed your usage. I recommend the{" "}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Cloud Storage Pro
                    </span>{" "}
                    plan for 99.9% uptime during peak loads.
                  </p>
                </div>
                <span className="f-mono ml-1 text-[9px] text-muted-foreground">
                  10:42 AM
                </span>
              </div>
            </div>
            <div className="border-t border-border bg-card p-4">
              <div className="relative">
                <input
                  className="f-mono w-full rounded-lg border border-border bg-muted py-2.5 pl-3 pr-10 text-xs text-foreground outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-card transition-colors"
                  placeholder="Type your question..."
                  type="text"
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 transition-transform hover:scale-110 active:scale-95"
        >
          <span
            className="material-symbols-outlined text-3xl text-white transition-transform group-hover:rotate-12"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-border px-6 py-12 md:flex-row relative z-10">
        <div className="flex items-center gap-4">
          <span className="f-mono text-[10px] text-muted-foreground font-medium">
            SYSTEM STATUS
          </span>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
            <span className="dot-live h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="f-mono text-[10px] font-bold text-emerald-500">
              OPERATIONAL
            </span>
          </div>
        </div>
        <p className="f-mono text-[10px] text-muted-foreground font-medium">
          © {new Date().getFullYear()} SUBSCRIPTION MANAGEMENT SYSTEM. BUILT FOR SCALE.
        </p>
      </footer>
    </div>
  );
}
