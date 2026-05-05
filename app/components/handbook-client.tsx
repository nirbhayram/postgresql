"use client";

import { useEffect, useMemo, useState } from "react";
import { HANDBOOK_SECTIONS } from "./handbook-sections";
import type { HandbookSection } from "./handbook-sections";

const TOP_NAV = [
  "Install",
  "Databases",
  "Tables",
  "Insert",
  "SELECT",
  "Update/Delete",
  "Constraints",
  "Functions",
  "Transactions",
  "Keys",
  "JOINs",
  "Views/Union",
  "Subqueries",
  "Procedures",
  "EXPLAIN",
  "Perf Tuning",
  "Locking",
  "Partitioning",
  "JSONB",
  "Full-Text",
  "Adv Types",
  "Extensions",
  "Schemas",
  "PL Errors",
  "Backups",
  "Replication",
  "Monitoring",
];

const SIDE_GROUPS = [
  {
    title: "Foundations",
    items: [
      { idx: 0, label: "Installing PostgreSQL" },
      { idx: 1, label: "Databases & Tables" },
      { idx: 2, label: "Working with Tables" },
    ],
  },
  {
    title: "Data Operations",
    items: [
      { idx: 3, label: "Inserting Data" },
      { idx: 4, label: "Querying - SELECT" },
      { idx: 5, label: "UPDATE & DELETE" },
    ],
  },
  {
    title: "Structure & Integrity",
    items: [
      { idx: 6, label: "Constraints" },
      { idx: 7, label: "SQL Functions" },
      { idx: 8, label: "Transactions" },
      { idx: 9, label: "Primary & Foreign Keys" },
    ],
  },
  {
    title: "Advanced Querying",
    items: [
      { idx: 10, label: "JOINs" },
      { idx: 11, label: "Views, Union & Indexes" },
      { idx: 12, label: "Subqueries & GROUP BY" },
      { idx: 13, label: "Procedures & Triggers" },
    ],
  },
  {
    title: "Performance",
    items: [
      { idx: 14, label: "EXPLAIN & Query Planning" },
      { idx: 15, label: "Performance Tuning" },
      { idx: 16, label: "Locking & Concurrency" },
      { idx: 17, label: "Table Partitioning" },
    ],
  },
  {
    title: "Modern Features",
    items: [
      { idx: 18, label: "JSONB & JSON Operators" },
      { idx: 19, label: "Full-Text Search" },
      { idx: 20, label: "Advanced Data Types" },
      { idx: 21, label: "Extensions" },
    ],
  },
  {
    title: "Programmability",
    items: [
      { idx: 22, label: "Schemas & Permissions" },
      { idx: 23, label: "Error Handling (PL/pgSQL)" },
    ],
  },
  {
    title: "Production & Ops",
    items: [
      { idx: 24, label: "Backups & Restore" },
      { idx: 25, label: "Replication & HA" },
      { idx: 26, label: "Monitoring & Maintenance" },
    ],
  },
];

function getSectionByIndex(sections: HandbookSection[], activeSection: number) {
  return sections.find((section) => section.id === activeSection) ?? sections[0];
}

export default function HandbookClient() {
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);

  const current = useMemo(
    () => getSectionByIndex(HANDBOOK_SECTIONS, activeSection),
    [activeSection]
  );

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const fullHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = fullHeight <= 0 ? 0 : (scrollTop / fullHeight) * 100;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    const onCopy = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const btn = target?.closest(".code-copy") as HTMLButtonElement | null;
      if (!btn) return;

      const code = btn.closest(".code-block")?.querySelector("pre.code") as HTMLElement | null;
      if (!code) return;

      navigator.clipboard.writeText(code.innerText).then(() => {
        const prev = btn.textContent ?? "copy";
        btn.textContent = "copied";
        btn.classList.add("copied");
        window.setTimeout(() => {
          btn.textContent = prev;
          btn.classList.remove("copied");
        }, 1200);
      });
    };

    document.addEventListener("click", onCopy);
    return () => document.removeEventListener("click", onCopy);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div
        className="fixed left-0 top-0 z-[999] h-[3px] bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 shadow-[0_1px_6px_rgba(37,99,235,0.35)]"
        style={{ width: `${progress}%` }}
      />

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-stretch overflow-x-auto px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="sticky left-0 z-[6] mr-1 flex shrink-0 items-center border-r border-slate-200 bg-white px-4 py-4 text-4xl font-extrabold tracking-tight text-slate-700 shadow-[10px_0_12px_-12px_rgba(15,23,42,0.35)] md:pl-6">
            PG//
          </div>

          {TOP_NAV.map((label, idx) => (
            <button
              key={label}
              onClick={() => setActiveSection(idx)}
              className={`relative shrink-0 px-4 py-4 text-sm font-medium transition ${
                idx === activeSection ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
              <span
                className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-t ${
                  idx === activeSection ? "bg-blue-600" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-16 pt-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden self-start py-6 lg:block">
          {SIDE_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="mb-2 border-b border-slate-200 px-4 pb-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {group.title}
              </div>
              {group.items.map((item) => {
                const active = item.idx === activeSection;
                return (
                  <button
                    key={item.idx}
                    onClick={() => setActiveSection(item.idx)}
                    className={`flex w-full items-center gap-2 rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border-l-blue-600 bg-blue-50 text-blue-700"
                        : "border-l-transparent text-slate-600 hover:bg-blue-50/60 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-[10px] text-slate-500">
                      {String(item.idx + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <main className="max-w-[760px]">
          {!current ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No sections found in source file.
            </div>
          ) : (
            <current.Component />
          )}
        </main>
      </div>
    </div>
  );
}
