"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";

const NAV = [
  { href: "/", label: "Dashboard", short: "Home", icon: "▤" },
  { href: "/farms", label: "My Farms", short: "Farms", icon: "⌂" },
  { href: "/diagnose", label: "Diagnose", short: "Scan", icon: "◎" },
  { href: "/reports", label: "Reports", short: "Reports", icon: "▦" },
  { href: "/resources", label: "Resources", short: "Help", icon: "📍" },
  { href: "/settings", label: "Settings", short: "Settings", icon: "⚙" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (profile.name || "G").trim()[0]?.toUpperCase() || "G";

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside className="sticky top-0 z-40 shrink-0 bg-[var(--canopy)] text-[var(--parchment)] md:flex md:h-screen md:w-[230px] md:flex-col md:px-4 md:py-[22px]">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--parchment)] font-display text-[15px] font-semibold text-[var(--canopy)]">
            H
          </div>
          <div className="font-display text-lg font-semibold">
            Harvest
            <span className="italic text-[var(--husk)]">IQ</span>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border border-[rgba(241,235,218,0.25)] px-3 py-2 text-xs font-semibold"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Desktop brand */}
      <div className="mb-[18px] hidden items-center gap-2.5 border-b border-[rgba(241,235,218,0.15)] px-2 pb-[22px] md:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--parchment)] font-display text-[15px] font-semibold text-[var(--canopy)]">
          H
        </div>
        <div className="font-display text-lg font-semibold">
          Harvest
          <span className="italic text-[var(--husk)]">IQ</span>
        </div>
      </div>

      {/* Nav — horizontal scroll on mobile when open / always on desktop */}
      <nav
        className={`${
          menuOpen ? "flex" : "hidden"
        } max-h-[70vh] flex-col gap-1 overflow-y-auto border-t border-[rgba(241,235,218,0.12)] px-3 pb-3 pt-2 md:mt-1 md:mb-5 md:flex md:max-h-none md:flex-col md:gap-0.5 md:overflow-visible md:border-0 md:px-0 md:pb-0 md:pt-0`}
      >
        <div className="mb-2 hidden px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[rgba(241,235,218,0.45)] md:block">
          Workspace
        </div>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-2.5 text-sm font-medium transition-colors md:w-full ${
                active
                  ? "bg-[rgba(241,235,218,0.14)] text-[var(--parchment)]"
                  : "text-[rgba(241,235,218,0.78)] hover:bg-[rgba(241,235,218,0.08)] hover:text-[var(--parchment)]"
              }`}
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center">
                {item.icon}
              </span>
              <span className="md:hidden">{item.short}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom quick nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-[rgba(241,235,218,0.12)] px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`m-${item.href}`}
              href={item.href}
              className={`flex min-w-[64px] flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-semibold ${
                active
                  ? "bg-[rgba(241,235,218,0.14)] text-[var(--parchment)]"
                  : "text-[rgba(241,235,218,0.7)]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.short}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-[rgba(241,235,218,0.15)] pt-3.5 md:block">
        <div className="flex items-center gap-2 rounded-[7px] px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--husk)] font-mono text-xs font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium">{profile.name}</div>
            <div className="truncate text-[11px] text-[rgba(241,235,218,0.55)]">
              {profile.farmname}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
