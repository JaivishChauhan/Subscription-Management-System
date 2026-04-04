"use client";

import { useState } from "react";
import Link from "next/link";
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
    addItem({
      id: `${p.id}-${Date.now()}`,
      name: p.name,
      price: isYearly ? p.yearlyPrice : p.price,
      quantity: 1,
      plan: isYearly ? "Yearly" : "Monthly",
    });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="grid-bg min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1E2D42]/40 bg-[#0D1117]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <span className="f-syne text-[22px] font-bold text-[#E8EDF5]">
            SubMS
          </span>
          <div className="hidden gap-6 md:flex">
            <span className="f-mono cursor-pointer text-sm font-bold text-[#00E5FF]">
              Store
            </span>
            <span className="f-mono cursor-pointer text-sm text-[#8A9BB5] transition-opacity hover:text-[#00E5FF]">
              Plans
            </span>
            <span className="f-mono cursor-pointer text-sm text-[#8A9BB5] transition-opacity hover:text-[#00E5FF]">
              Help
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A9BB5]">
              search
            </span>
            <input
              className="f-mono w-64 rounded-full border-none bg-[#111820] py-1.5 pl-10 pr-4 text-xs text-[#E8EDF5] outline-none focus:ring-1 focus:ring-[#00E5FF]"
              placeholder="Search products..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#8A9BB5] transition-colors hover:text-[#00E5FF]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link
              href="/cart"
              className="text-[#8A9BB5] transition-colors hover:text-[#00E5FF]"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <button className="f-syne rounded-full bg-[#00E5FF] px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#080B10]">
              Upgrade
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="anim-up relative overflow-hidden px-6 pb-20 pt-24">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5FF] opacity-10 blur-[140px]"></div>
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-[#7C3AED] opacity-10 blur-[160px]"></div>
        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <h1 className="f-syne mb-6 text-[52px] font-extrabold leading-[1.1] tracking-tight text-[#E8EDF5]">
            Choose your perfect
            <br />
            subscription plan
          </h1>
          <p className="f-mono mx-auto mb-10 max-w-lg text-[13px] text-[#8A9BB5]">
            Scale your infrastructure with surgical precision using our
            architectural tiers designed for high-velocity engineering teams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="f-syne rounded-full bg-[#00E5FF] px-8 py-3 font-bold text-[#080B10] transition-transform active:scale-95">
              Explore Plans →
            </button>
            <button className="f-syne rounded-full border border-[#A78BFA] px-8 py-3 font-bold text-[#A78BFA] transition-colors hover:bg-[#A78BFA]/10">
              Talk to AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto mb-12 max-w-7xl px-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`f-mono whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-colors ${
                filter === c
                  ? "bg-[#00E5FF] text-[#080B10]"
                  : "border border-[#1E2D42]/40 bg-[#111820] text-[#8A9BB5] hover:border-[#00E5FF]/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`group relative overflow-hidden rounded-lg bg-[#111820] transition-transform duration-300 hover:translate-y-[-4px] ${
                p.featured
                  ? "border-2 border-[#00E5FF]"
                  : "border border-[#1E2D42]/40 hover:border-[#00E5FF]/50"
              }`}
            >
              {p.featured && (
                <div className="absolute right-4 top-4 z-20">
                  <span className="f-syne rounded-full bg-[#00E5FF] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#080B10]">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="relative h-48 overflow-hidden bg-gradient-to-b from-[#1A2535] to-[#111820]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111820] via-transparent to-transparent"></div>
              </div>
              <div className="p-8">
                <h3 className="f-syne mb-2 text-[18px] font-bold text-[#E8EDF5]">
                  {p.name}
                </h3>
                {p.featured && (
                  <div className="mb-6 flex w-fit items-center gap-3 rounded-full border border-[#1E2D42]/40 bg-[#080B10] p-1">
                    <button
                      onClick={() => setBilling({ ...billing, [p.id]: false })}
                      className={`f-mono rounded-full px-3 py-1 text-[10px] font-bold ${
                        !billing[p.id]
                          ? "bg-[#1A2535] text-[#00E5FF]"
                          : "text-[#8A9BB5]"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBilling({ ...billing, [p.id]: true })}
                      className={`f-mono rounded-full px-3 py-1 text-[10px] font-bold ${
                        billing[p.id]
                          ? "bg-[#1A2535] text-[#00E5FF]"
                          : "text-[#8A9BB5]"
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                )}
                <div className="mb-6">
                  <span
                    className="f-syne text-[28px] font-extrabold"
                    style={{ color: p.featured ? "#00E5FF" : "#E8EDF5" }}
                  >
                    ₹
                    {(billing[p.id] ? p.yearlyPrice : p.price).toLocaleString()}
                  </span>
                  <span className="f-mono text-xs text-[#8A9BB5]">
                    {" "}
                    / month
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          p.featured ? "text-[#00E5FF]" : "text-[#8A9BB5]"
                        }`}
                      >
                        check_circle
                      </span>
                      <span
                        className={`f-mono text-xs ${
                          p.featured ? "text-[#E8EDF5]" : "text-[#8A9BB5]"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAdd(p)}
                  className={`f-syne w-full rounded-full py-3 font-bold transition-opacity ${
                    p.featured
                      ? "bg-[#00E5FF] text-[#080B10] hover:opacity-90"
                      : "border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10"
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
            className="flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-[#1E2D42]/60 shadow-2xl"
            style={{
              background: "rgba(26,37,53,0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center justify-between bg-[#7C3AED] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
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
                  <p className="f-mono text-[10px] text-white/70">
                    Online & ready
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col gap-1">
                <div className="rounded-lg rounded-tl-none border border-[#1E2D42]/40 bg-[#1A2535] p-3">
                  <p className="f-mono text-[11px] text-[#E8EDF5]">
                    Hello! I've analyzed your usage. I recommend the{" "}
                    <span className="font-bold text-[#00E5FF]">
                      Cloud Storage Pro
                    </span>{" "}
                    plan for 99.9% uptime during peak loads.
                  </p>
                </div>
                <span className="f-mono ml-1 text-[9px] text-[#8A9BB5]">
                  10:42 AM
                </span>
              </div>
            </div>
            <div className="border-t border-[#1E2D42]/40 bg-[#0D1117]/50 p-4">
              <div className="relative">
                <input
                  className="f-mono w-full rounded-lg border-none bg-[#111820] py-2.5 pl-3 pr-10 text-xs text-[#E8EDF5] outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  placeholder="Type your question..."
                  type="text"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C3AED]">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-transform hover:scale-110 active:scale-95"
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
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-[#1E2D42]/40 px-6 py-12 opacity-60 md:flex-row">
        <div className="flex items-center gap-4">
          <span className="f-mono text-[10px] text-[#8A9BB5]">
            SYSTEM STATUS
          </span>
          <div className="flex items-center gap-2">
            <span className="dot-live h-2 w-2 rounded-full bg-[#10B981]"></span>
            <span className="f-mono text-[10px] text-[#10B981]">
              OPERATIONAL
            </span>
          </div>
        </div>
        <p className="f-mono text-[10px] text-[#8A9BB5]">
          © {new Date().getFullYear()} SUBSCRIPTION MANAGEMENT SYSTEM. BUILT FOR SCALE.
        </p>
      </footer>
    </div>
  );
}
