"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EmptyState, RiskBadge, SeverityBadge, ViewHeader } from "@/components/ui";
import { SafeLeafImage } from "@/components/SafeLeafImage";
import { riskColor } from "@/lib/ai";
import { useApp } from "@/lib/store";

export default function DashboardPage() {
  const { profile, farms, diagnoses } = useApp();
  const firstName = profile.name.split(" ")[0] || "grower";

  const avgConfidence = useMemo(() => {
    if (!diagnoses.length) return null;
    const avg =
      diagnoses.reduce((s, d) => s + (d?.diagnosis?.confidence || 0), 0) /
      diagnoses.length;
    return Math.round(avg * 100);
  }, [diagnoses]);

  const highRisk = diagnoses.filter(
    (d) =>
      d.forecast &&
      (d.forecast.overall_risk_level === "high" ||
        d.forecast.overall_risk_level === "severe"),
  ).length;

  const recent = [...diagnoses]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const leaderboard = diagnoses
    .filter((d) => d.forecast)
    .sort((a, b) => {
      const order = { severe: 4, high: 3, moderate: 2, low: 1 } as const;
      return (
        (order[b.forecast!.overall_risk_level] || 0) -
        (order[a.forecast!.overall_risk_level] || 0)
      );
    })
    .slice(0, 6);

  const cropScores: Record<string, number[]> = {};
  const latestByFarm: Record<string, (typeof diagnoses)[0]> = {};
  diagnoses
    .filter((d) => d.forecast)
    .forEach((d) => {
      if (
        !latestByFarm[d.farmId] ||
        d.timestamp > latestByFarm[d.farmId].timestamp
      ) {
        latestByFarm[d.farmId] = d;
      }
    });
  Object.values(latestByFarm).forEach((d) => {
    const farm = farms.find((f) => f.id === d.farmId);
    if (!farm || !d.forecast) return;
    const avg = Math.round(
      (d.forecast.daily_risk || []).reduce((s, x) => s + x.risk_score, 0) /
        Math.max(1, (d.forecast.daily_risk || []).length),
    );
    if (!cropScores[farm.crop]) cropScores[farm.crop] = [];
    cropScores[farm.crop].push(avg);
  });

  const confidenceTrend = [...diagnoses]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-10);

  return (
    <>
      <ViewHeader
        eyebrow="Overview"
        title={
          <>
            Good to see you back, {firstName}.
          </>
        }
        description="A snapshot of your farms, diagnoses, and outstanding risk since your last visit."
        action={
          <Link href="/diagnose" className="btn btn-husk">
            ◎ New diagnosis
          </Link>
        }
      />

      <div className="mb-[22px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Farms tracked",
            value: String(farms.length),
            sub: "across all crop types",
          },
          {
            label: "Diagnoses run",
            value: String(diagnoses.length),
            sub: "saved to reports",
          },
          {
            label: "Avg. confidence",
            value: avgConfidence === null ? "—" : `${avgConfidence}%`,
            sub: "across saved scans",
          },
          {
            label: "Active high-risk alerts",
            value: String(highRisk),
            sub: "7-day forecast ≥ high",
            alert: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--card)] px-5 py-[18px] shadow-[var(--shadow)]"
          >
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
              {s.label}
            </div>
            <div
              className={`font-mono text-[28px] font-semibold ${s.alert ? "text-[var(--blight)]" : ""}`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-xs text-[var(--ink-faint)]">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <div className="mb-3.5 font-display text-lg font-semibold">
            Recent activity
          </div>
          {!recent.length ? (
            <EmptyState
              icon="◎"
              title="No diagnoses yet"
              description="Run your first crop scan to see activity here."
            />
          ) : (
            recent.map((d) => {
              const farm = farms.find((f) => f.id === d.farmId);
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] py-[11px] last:border-0"
                >
                  <SafeLeafImage
                    src={d.imageDataUrl}
                    alt={`Leaf scan: ${d.diagnosis?.disease_name || "crop sample"}`}
                    className="h-11 w-11 shrink-0 rounded-[7px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">
                      {d.diagnosis?.disease_name || "Unknown result"}
                    </div>
                    <div className="text-xs text-[var(--ink-faint)]">
                      {farm?.name || "Unknown field"} ·{" "}
                      {new Date(d.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <SeverityBadge severity={d.diagnosis?.severity || "low"} />
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <div className="mb-3.5 font-display text-lg font-semibold">
            Highest current risk
          </div>
          {!leaderboard.length ? (
            <EmptyState
              icon="⛅"
              title="No forecasts yet"
              description="Run a risk forecast during diagnosis to populate this list."
            />
          ) : (
            leaderboard.map((d) => {
              const farm = farms.find((f) => f.id === d.farmId);
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] py-[11px] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">
                      {farm?.name || "Unknown field"}
                    </div>
                    <div className="text-xs text-[var(--ink-faint)]">
                      {d.diagnosis.disease_name}
                    </div>
                  </div>
                  {d.forecast && (
                    <RiskBadge level={d.forecast.overall_risk_level} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        <div className="card">
          <div className="mb-3.5 font-display text-lg font-semibold">
            Risk by crop type
          </div>
          {!Object.keys(cropScores).length ? (
            <EmptyState
              icon="🌱"
              title="Not enough data yet"
              description="Run forecasts across your farms to compare risk by crop."
            />
          ) : (
            Object.entries(cropScores).map(([crop, vals]) => {
              const avg = Math.round(
                vals.reduce((a, b) => a + b, 0) / vals.length,
              );
              return (
                <div key={crop} className="mb-3 flex items-center gap-2.5">
                  <div className="w-[88px] shrink-0 text-[12.5px] font-semibold text-[var(--ink-soft)]">
                    {crop}
                  </div>
                  <div className="h-3.5 flex-1 overflow-hidden rounded-[7px] bg-[var(--parchment-2)]">
                    <div
                      className="h-full rounded-[7px] transition-[width] duration-500"
                      style={{
                        width: `${avg}%`,
                        background: riskColor(avg),
                      }}
                    />
                  </div>
                  <div className="w-[34px] shrink-0 text-right font-mono text-xs font-semibold">
                    {avg}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <div className="mb-3.5 font-display text-lg font-semibold">
            Confidence trend
          </div>
          {confidenceTrend.length < 2 ? (
            <EmptyState
              icon="📈"
              title="Not enough history yet"
              description="Save a few diagnoses to see your confidence trend over time."
            />
          ) : (
            <ConfidenceChart points={confidenceTrend} />
          )}
        </div>
      </div>
    </>
  );
}

function ConfidenceChart({
  points,
}: {
  points: { diagnosis: { confidence: number } }[];
}) {
  const w = 460;
  const h = 130;
  const pad = 16;
  const pts = points.map((d, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const conf = (d.diagnosis.confidence || 0) * 100;
    const y = h - pad - (conf / 100) * (h - pad * 2);
    return { x, y };
  });
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <>
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="var(--line)"
          strokeWidth="1"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--husk)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--husk)"
          />
        ))}
      </svg>
      <p className="mt-1.5 text-[11.5px] text-[var(--ink-faint)]">
        Last {points.length} saved diagnoses, oldest to most recent
      </p>
    </>
  );
}
