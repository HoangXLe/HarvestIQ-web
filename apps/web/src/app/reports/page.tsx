"use client";

import { useState } from "react";
import {
  EmptyState,
  RiskBadge,
  SeverityBadge,
  ViewHeader,
} from "@/components/ui";
import { SafeLeafImage } from "@/components/SafeLeafImage";
import { riskColor } from "@/lib/ai";
import { useApp } from "@/lib/store";

export default function ReportsPage() {
  const { farms, diagnoses, removeDiagnosis, toast } = useApp();
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  let items = [...diagnoses].sort((a, b) => b.timestamp - a.timestamp);
  if (filter !== "all") items = items.filter((d) => d.farmId === filter);

  return (
    <>
      <ViewHeader
        eyebrow="History"
        title="Diagnosis history"
        description="Every saved diagnosis and its risk forecast, stored locally in this browser."
        action={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-[7px] border-[1.5px] border-[var(--line)] bg-white px-3 py-2 text-[13px]"
          >
            <option value="all">All farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        }
      />

      {!items.length ? (
        <div className="card">
          <EmptyState
            icon="▦"
            title="No reports here yet"
            description="Saved diagnoses will appear in this list."
          />
        </div>
      ) : (
        items.map((d) => {
          const farm = farms.find((f) => f.id === d.farmId);
          const isOpen = openId === d.id;
          return (
            <div
              key={d.id}
              className="mb-2.5 overflow-hidden rounded-[9px] border border-[var(--line)] bg-[var(--card)]"
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3.5 px-[18px] py-3.5 text-left"
                onClick={() => setOpenId(isOpen ? null : d.id)}
              >
                <SafeLeafImage
                  src={d.imageDataUrl}
                  alt={`Saved diagnosis: ${d.diagnosis?.disease_name || "crop sample"}`}
                  className="h-[46px] w-[46px] shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">
                    {d.diagnosis.disease_name} ·{" "}
                    {farm?.name || "Unknown field"}
                  </div>
                  <div className="text-xs text-[var(--ink-faint)]">
                    {new Date(d.timestamp).toLocaleString()}
                  </div>
                </div>
                <SeverityBadge severity={d.diagnosis.severity} />
                {d.forecast && (
                  <RiskBadge level={d.forecast.overall_risk_level} />
                )}
                <span
                  className={`text-[var(--ink-faint)] transition-transform ${isOpen ? "rotate-90" : ""}`}
                >
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-[var(--line)] px-[18px] pb-[18px]">
                  <div className="grid grid-cols-1 gap-5 pt-4 md:grid-cols-2">
                    <DetailList
                      title="Symptoms"
                      items={d.diagnosis.symptoms_observed}
                    />
                    <DetailList
                      title="Treatment"
                      items={d.diagnosis.treatment_recommendations}
                    />
                  </div>
                  {d.forecast && (
                    <div className="mt-2">
                      <h5 className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--husk-dark)]">
                        7-day risk
                      </h5>
                      <div className="flex h-[90px] items-end gap-2.5">
                        {d.forecast.daily_risk.map((dr) => (
                          <div
                            key={dr.day}
                            className="flex h-full flex-1 flex-col items-center justify-end"
                          >
                            <div
                              className="w-full min-h-[3px] rounded-t"
                              style={{
                                height: `${Math.max(4, dr.risk_score)}%`,
                                background: riskColor(dr.risk_score),
                              }}
                            />
                            <div className="mt-1.5 font-mono text-[10px] text-[var(--ink-faint)]">
                              {dr.day.replace("Day ", "D")}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[12.5px] text-[var(--ink-soft)]">
                        {d.forecast.risk_summary}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger mt-3.5"
                    onClick={async () => {
                      try {
                        await removeDiagnosis(d.id);
                        toast("Report deleted");
                      } catch (e) {
                        // store already toasts persistence errors; keep UI stable
                        console.error(e);
                      }
                    }}
                  >
                    Delete this report
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h5 className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--husk-dark)]">
        {title}
      </h5>
      <ul className="list-none">
        {(items || []).map((s) => (
          <li
            key={s}
            className="relative mb-1.5 pl-4 text-[13px] leading-relaxed"
          >
            <span className="absolute left-0 text-[var(--ink-faint)]">—</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
