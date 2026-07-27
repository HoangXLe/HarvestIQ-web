"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  EmptyState,
  ErrorBanner,
  FieldError,
  LoadingBlock,
  RiskBadge,
  SeverityBadge,
  ViewHeader,
} from "@/components/ui";
import { resizeImageFile, riskColor } from "@/lib/ai";
import { getErrorMessage } from "@/lib/errors";
import { useApp } from "@/lib/store";
import type { DiagnosisResult, ForecastResult } from "@/lib/types";
import {
  hasErrors,
  validateEnvForm,
  type FieldErrors,
} from "@/lib/validation";

export default function DiagnosePage() {
  const router = useRouter();
  const { farms, unitsMetric, addDiagnosis, toast, saving } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [farmId, setFarmId] = useState(farms[0]?.id || "");
  const [farmError, setFarmError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!farmId && farms[0]?.id) setFarmId(farms[0].id);
  }, [farms, farmId]);
  const [image, setImage] = useState<{
    dataUrl: string;
    base64: string;
    mediaType: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [envErrors, setEnvErrors] = useState<FieldErrors>({});
  const [env, setEnv] = useState({
    temp: unitsMetric ? 24 : 75,
    humidity: 70,
    rainfall: unitsMetric ? 5 : 0.2,
    leafWetness: 4,
    trend: "Continued warm and wet",
  });

  const farm = farms.find((f) => f.id === farmId);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file (JPG or PNG)", true);
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast("Image is too large. Please use a file under 12 MB.", true);
      return;
    }
    setUploading(true);
    setDiagError(null);
    try {
      const resized = await resizeImageFile(file);
      setImage(resized);
      setDiagnosis(null);
      setForecast(null);
      setForecastError(null);
      setStep(2);
    } catch {
      toast("Could not read that image. Try another photo.", true);
    } finally {
      setUploading(false);
    }
  }

  async function runDiagnosis() {
    if (!farmId || !farm) {
      setFarmError("Select a farm before running diagnosis");
      toast("Add and select a farm first", true);
      return;
    }
    if (!image) {
      toast("Upload a leaf photo first", true);
      return;
    }
    setFarmError("");
    setStep(3);
    setLoadingDiag(true);
    setDiagError(null);
    setDiagnosis(null);
    setForecast(null);
    setForecastError(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: farm.crop,
          // Images stay in the browser for this MVP demo API (no secrets / no large uploads).
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Diagnosis request failed (${res.status})`,
        );
      }
      if (!data.diagnosis) throw new Error("No diagnosis returned from server");
      setDiagnosis(data.diagnosis);
    } catch (e) {
      const msg = getErrorMessage(
        e,
        "Diagnosis failed. Please try again with another photo.",
      );
      setDiagError(msg);
      toast(msg, true);
    } finally {
      setLoadingDiag(false);
    }
  }

  async function runForecast() {
    if (!farm || !diagnosis) return;
    const nextErrors = validateEnvForm(env, unitsMetric);
    setEnvErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast("Please fix the field condition values", true);
      return;
    }
    setLoadingForecast(true);
    setForecastError(null);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: farm.crop,
          disease: diagnosis.disease_name,
          severity: diagnosis.severity,
          temp: env.temp,
          tempUnit: unitsMetric ? "°C" : "°F",
          humidity: env.humidity,
          rainfall: env.rainfall,
          rainUnit: unitsMetric ? "mm" : "in",
          leafWetness: env.leafWetness,
          trend: env.trend,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Forecast request failed (${res.status})`,
        );
      }
      if (!data.forecast) throw new Error("No forecast returned from server");
      setForecast(data.forecast);
      setStep(4);
    } catch (e) {
      const msg = getErrorMessage(
        e,
        "Forecast failed. Check your field conditions and try again.",
      );
      setForecastError(msg);
      toast(msg, true);
    } finally {
      setLoadingForecast(false);
    }
  }

  async function saveReport() {
    if (!diagnosis || !image || !farmId) return;
    setSavingReport(true);
    try {
      await addDiagnosis({
        farmId,
        timestamp: Date.now(),
        imageDataUrl: image.dataUrl,
        diagnosis,
        forecast,
        envInputs: {
          temp: Number(env.temp),
          humidity: Number(env.humidity),
          rainfall: Number(env.rainfall),
          leafWetness: Number(env.leafWetness),
          trend: env.trend,
        },
      });
      toast("Saved to reports");
      router.push("/reports");
    } catch (e) {
      toast(
        getErrorMessage(e, "Could not save this report. Please try again."),
        true,
      );
    } finally {
      setSavingReport(false);
    }
  }

  function updateEnv<K extends keyof typeof env>(key: K, value: (typeof env)[K]) {
    setEnv((prev) => ({ ...prev, [key]: value }));
    setEnvErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const steps = [
    "1 · Select field",
    "2 · Upload",
    "3 · Classify",
    "4 · Risk forecast",
  ];

  return (
    <>
      <ViewHeader
        eyebrow="Upload → Classify → Forecast → Recommend"
        title="Diagnose a crop photo"
        description="Photograph a single leaf against a plain background, in even light, for the most reliable read."
      />

      <div className="mb-6 flex gap-0 overflow-x-auto">
        {steps.map((label, i) => {
          const n = i + 1;
          const cls =
            n < step
              ? "text-[var(--sprout)] border-[var(--sprout)]/40"
              : n === step
                ? "border-[var(--husk)] text-[var(--canopy)]"
                : "border-[var(--line)] text-[var(--ink-faint)]";
          return (
            <div
              key={label}
              className={`min-w-[88px] flex-1 border-b-[3px] px-1 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.04em] sm:min-w-0 sm:text-xs ${cls}`}
            >
              <span className="sm:hidden">{n}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="card mb-[18px]">
        <div className="field mb-0">
          <label htmlFor="diag-farm">Farm / field</label>
          <select
            id="diag-farm"
            value={farmId}
            aria-invalid={Boolean(farmError)}
            className={farmError ? "field-invalid" : undefined}
            onChange={(e) => {
              setFarmId(e.target.value);
              setFarmError("");
              setStep(1);
            }}
          >
            {!farms.length && (
              <option value="">— Add a farm first —</option>
            )}
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.crop})
              </option>
            ))}
          </select>
          <FieldError message={farmError} />
        </div>
      </div>

      <div className="card mb-[18px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        {!image ? (
          <button
            type="button"
            disabled={uploading}
            className="w-full cursor-pointer rounded-[var(--radius)] border-2 border-dashed border-[var(--ink-faint)] px-4 py-8 text-center transition-colors hover:border-[var(--husk)] hover:bg-[rgba(184,134,59,0.06)] disabled:cursor-wait sm:px-6 sm:py-11"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(184,134,59,0.03) 0 10px, transparent 10px 20px)",
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) void handleFile(f);
            }}
          >
            {uploading ? (
              <LoadingBlock label="Preparing your photo…" />
            ) : (
              <>
                <div className="mb-3 text-4xl">📷</div>
                <h4 className="mb-1.5 font-display text-base font-semibold sm:text-[17px]">
                  Drop a leaf photo here, or click to browse
                </h4>
                <p className="text-[13px] text-[var(--ink-soft)]">
                  JPG or PNG, ideally a single leaf filling most of the frame
                </p>
              </>
            )}
          </button>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-[var(--radius)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.dataUrl}
                alt="Uploaded leaf"
                className="block max-h-[340px] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-3.5 rounded-md border-[1.5px] border-white/85" />
            </div>
            <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                className="btn btn-husk w-full sm:w-auto"
                onClick={() => void runDiagnosis()}
                disabled={loadingDiag}
              >
                {loadingDiag ? "Analyzing…" : "◎ Run diagnosis"}
              </button>
              <button
                type="button"
                className="btn btn-ghost w-full sm:w-auto"
                disabled={loadingDiag}
                onClick={() => {
                  setImage(null);
                  setDiagnosis(null);
                  setForecast(null);
                  setDiagError(null);
                  setForecastError(null);
                  setStep(1);
                }}
              >
                Choose different photo
              </button>
            </div>
          </>
        )}
      </div>

      {loadingDiag && (
        <LoadingBlock label="Analyzing leaf image for disease markers…" />
      )}

      {diagError && (
        <ErrorBanner
          title="Diagnosis failed"
          message={diagError}
          onRetry={() => void runDiagnosis()}
          onDismiss={() => setDiagError(null)}
        />
      )}

      {diagnosis && image && (
        <div className="mb-5 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow)]">
          <div
            className="h-3.5 bg-[var(--canopy)]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--parchment) 3px, transparent 3.5px)",
              backgroundSize: "16px 16px",
              backgroundPosition: "6px center",
            }}
          />
          <div className="flex flex-col gap-5 p-6 md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataUrl}
              alt=""
              className="h-[120px] w-[120px] shrink-0 rounded-lg border-[3px] border-[var(--parchment-2)] object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                Field specimen · classification
              </div>
              <h3 className="my-1 font-display text-[23px] font-medium italic">
                {diagnosis.disease_name}
              </h3>
              <div className="mb-3 flex gap-[26px]">
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-faint)]">
                    Confidence
                  </div>
                  <div className="font-mono text-[19px] font-semibold">
                    {Math.round((diagnosis.confidence || 0) * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-faint)]">
                    Severity
                  </div>
                  <div className="mt-1">
                    <SeverityBadge severity={diagnosis.severity} />
                  </div>
                </div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                {diagnosis.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 px-6 pb-6 md:grid-cols-2">
            <ListBlock
              title="Symptoms observed"
              items={diagnosis.symptoms_observed}
            />
            <ListBlock
              title="Treatment recommendations"
              items={diagnosis.treatment_recommendations}
            />
          </div>
          <div className="px-6 pb-6">
            <ListBlock
              title="Prevention tips"
              items={diagnosis.prevention_tips}
            />
          </div>
        </div>
      )}

      {diagnosis && (
        <div className="card mb-[18px]">
          <div className="mb-3.5 font-display text-lg font-semibold">
            Current field conditions
          </div>
          <p className="mb-4 text-[13px] text-[var(--ink-soft)]">
            Enter today&apos;s readings to forecast 7-day outbreak risk
            (weather-driven prediction per MVP spec).
          </p>
          <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="field mb-0">
              <label>Temperature ({unitsMetric ? "°C" : "°F"})</label>
              <input
                type="number"
                value={env.temp}
                aria-invalid={Boolean(envErrors.temp)}
                className={envErrors.temp ? "field-invalid" : undefined}
                onChange={(e) => updateEnv("temp", Number(e.target.value))}
              />
              <FieldError message={envErrors.temp} />
            </div>
            <div className="field mb-0">
              <label>Relative humidity (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={env.humidity}
                aria-invalid={Boolean(envErrors.humidity)}
                className={envErrors.humidity ? "field-invalid" : undefined}
                onChange={(e) => updateEnv("humidity", Number(e.target.value))}
              />
              <FieldError message={envErrors.humidity} />
            </div>
            <div className="field mb-0">
              <label>Rainfall, last 24h ({unitsMetric ? "mm" : "in"})</label>
              <input
                type="number"
                step={0.1}
                value={env.rainfall}
                aria-invalid={Boolean(envErrors.rainfall)}
                className={envErrors.rainfall ? "field-invalid" : undefined}
                onChange={(e) => updateEnv("rainfall", Number(e.target.value))}
              />
              <FieldError message={envErrors.rainfall} />
            </div>
            <div className="field mb-0">
              <label>Leaf wetness (hrs/day)</label>
              <input
                type="number"
                step={0.5}
                value={env.leafWetness}
                aria-invalid={Boolean(envErrors.leafWetness)}
                className={envErrors.leafWetness ? "field-invalid" : undefined}
                onChange={(e) =>
                  updateEnv("leafWetness", Number(e.target.value))
                }
              />
              <FieldError message={envErrors.leafWetness} />
            </div>
          </div>
          <div className="field">
            <label>Forecast trend, next 3 days</label>
            <select
              value={env.trend}
              aria-invalid={Boolean(envErrors.trend)}
              className={envErrors.trend ? "field-invalid" : undefined}
              onChange={(e) => updateEnv("trend", e.target.value)}
            >
              <option>Continued warm and wet</option>
              <option>Cooling and drying</option>
              <option>Hot and dry</option>
              <option>Mixed rain and sun</option>
              <option>Cold snap expected</option>
            </select>
            <FieldError message={envErrors.trend} />
          </div>
          <button
            type="button"
            className="btn btn-husk w-full sm:w-auto"
            onClick={() => void runForecast()}
            disabled={loadingForecast}
          >
            {loadingForecast ? "Forecasting…" : "⛅ Forecast outbreak risk"}
          </button>
          {loadingForecast && (
            <LoadingBlock label="Modeling 7-day disease pressure…" />
          )}
          {forecastError && (
            <div className="mt-4">
              <ErrorBanner
                title="Forecast failed"
                message={forecastError}
                onRetry={() => void runForecast()}
                onDismiss={() => setForecastError(null)}
              />
            </div>
          )}
        </div>
      )}

      {forecast && (
        <>
          <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
            <div className="card">
              <div className="mb-3.5 font-display text-lg font-semibold">
                7-day outbreak risk
              </div>
              <div className="flex h-[150px] items-end gap-2.5 px-1.5 pt-2.5">
                {forecast.daily_risk.map((d) => (
                  <div
                    key={d.day}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-1 font-mono text-[10.5px] font-semibold">
                      {d.risk_score}
                    </div>
                    <div
                      className="w-full min-h-[3px] rounded-t"
                      style={{
                        height: `${Math.max(4, d.risk_score)}%`,
                        background: riskColor(d.risk_score),
                      }}
                    />
                    <div className="mt-1.5 font-mono text-[10px] text-[var(--ink-faint)]">
                      {d.day.replace("Day ", "D")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card text-center">
              {(() => {
                const avg = Math.round(
                  forecast.daily_risk.reduce((s, d) => s + d.risk_score, 0) /
                    Math.max(1, forecast.daily_risk.length),
                );
                return (
                  <>
                    <Gauge score={avg} />
                    <div
                      className="mt-[-92px] font-mono text-[38px] font-semibold"
                      style={{ color: riskColor(avg) }}
                    >
                      {avg}
                    </div>
                    <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                      avg. risk score
                    </div>
                    <div className="mt-2.5">
                      <RiskBadge level={forecast.overall_risk_level} />
                    </div>
                    <p className="mt-2 px-1.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                      {forecast.risk_summary}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="card mt-[18px]">
            <div className="mb-3.5 font-display text-lg font-semibold">
              Recommended actions
            </div>
            <ul className="list-none">
              {forecast.recommended_actions.map((a) => (
                <li
                  key={a}
                  className="relative mb-2 pl-[18px] text-[13.5px] leading-relaxed"
                >
                  <span className="absolute left-0 text-[var(--husk-dark)]">
                    ✓
                  </span>
                  {a}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary mt-3.5 w-full sm:w-auto"
              onClick={() => void saveReport()}
              disabled={savingReport || saving}
            >
              {savingReport ? "Saving…" : "💾 Save to reports"}
            </button>
          </div>
        </>
      )}

      {!farms.length && (
        <div className="card mt-4">
          <EmptyState
            icon="⌂"
            title="Add a farm first"
            description="Create a field profile before running a diagnosis."
            action={
              <Link href="/farms" className="btn btn-primary">
                Go to My Farms
              </Link>
            }
          />
        </div>
      )}
    </>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
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

function Gauge({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = c * (1 - pct);
  const color = riskColor(score);
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className="mx-auto">
      <circle
        cx="75"
        cy="75"
        r={r}
        fill="none"
        stroke="var(--parchment-2)"
        strokeWidth="12"
      />
      <circle
        cx="75"
        cy="75"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 75 75)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}
