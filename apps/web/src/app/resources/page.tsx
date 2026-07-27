"use client";

import { useEffect, useState } from "react";
import { FieldError, ViewHeader } from "@/components/ui";
import { useApp } from "@/lib/store";
import { isAllowedMapsUrl } from "@/lib/security";
import { RESOURCE_CATEGORIES } from "@/lib/types";
import {
  hasErrors,
  validateResourcesForm,
  type FieldErrors,
} from "@/lib/validation";

export default function ResourcesPage() {
  const { farms, diagnoses, toast } = useApp();
  const [farmId, setFarmId] = useState(farms[0]?.id || "");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!farmId && farms[0]?.id) setFarmId(farms[0].id);
  }, [farms, farmId]);

  useEffect(() => {
    const farm = farms.find((f) => f.id === farmId);
    if (farm?.location) {
      setLocation(farm.location);
      setErrors({});
    }
  }, [farmId, farms]);

  const urgent = diagnoses.filter(
    (d) =>
      d.forecast &&
      (d.forecast.overall_risk_level === "high" ||
        d.forecast.overall_risk_level === "severe"),
  );

  function selectCategory(key: string) {
    try {
      const nextErrors = validateResourcesForm({ location });
      setErrors(nextErrors);
      if (hasErrors(nextErrors)) {
        toast("Enter a location before searching the map", true);
        return;
      }
      setActive(key);
    } catch (e) {
      toast(
        e instanceof Error
          ? e.message
          : "Could not open that resource category. Please try again.",
        true,
      );
    }
  }

  const cat = RESOURCE_CATEGORIES.find((c) => c.key === active);
  const searchQuery = cat
    ? cat.query + (location.trim() ? ` near ${location.trim()}` : "")
    : "";
  const embedSrc =
    searchQuery &&
    isAllowedMapsUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`,
    )
      ? `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`
      : "";
  const openLink =
    searchQuery &&
    isAllowedMapsUrl(
      `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`,
    )
      ? `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`
      : "";

  return (
    <>
      <ViewHeader
        eyebrow="Nearby help"
        title="Resources near your farm"
        description="Find agronomists, supply stores, and equipment mechanics close to your fields — useful for confirming a diagnosis or sourcing treatment fast."
      />

      {urgent.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 rounded-[9px] bg-[var(--blight-soft)] px-4 py-3.5 text-[13.5px] font-medium text-[var(--blight)] sm:flex-row sm:items-center sm:px-[18px]">
          <div className="flex-1">
            ⚠️ {urgent.length} saved diagnosis
            {urgent.length > 1 ? "es" : ""} currently read high or severe 7-day
            risk. Consider a certified agronomist visit before treating.
          </div>
          <button
            type="button"
            className="btn btn-primary w-full shrink-0 sm:w-auto"
            onClick={() => selectCategory("agronomist")}
          >
            Find agronomists
          </button>
        </div>
      )}

      <div className="card mb-[18px]">
        <div className="mb-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <div className="field mb-0">
            <label htmlFor="res-farm">Farm / field</label>
            <select
              id="res-farm"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
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
          </div>
          <div className="field mb-0">
            <label htmlFor="res-loc">Location</label>
            <input
              id="res-loc"
              value={location}
              aria-invalid={Boolean(errors.location)}
              className={errors.location ? "field-invalid" : undefined}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.location;
                  return n;
                });
                if (active) setActive(null);
              }}
              placeholder="e.g. Fresno County, CA"
            />
            <FieldError message={errors.location} />
          </div>
        </div>

        <div className="mb-[18px] flex flex-wrap gap-2">
          {RESOURCE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => selectCategory(c.key)}
              className={`rounded-[20px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all sm:px-[15px] sm:text-[13px] ${
                active === c.key
                  ? "border-[var(--canopy)] bg-[var(--canopy)] text-[var(--parchment)]"
                  : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--husk)] hover:text-[var(--ink)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative min-h-[260px] overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--parchment-2)] sm:min-h-[340px]">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={`Map of ${cat?.label}`}
              className="block h-[260px] w-full border-0 sm:h-[340px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-2 px-4 text-center text-[var(--ink-faint)] sm:h-[340px]">
              <div className="text-[30px]">📍</div>
              <div>Enter a location, then choose a category to see nearby options</div>
            </div>
          )}
        </div>

        {cat && (
          <>
            <div className="mt-3.5 rounded-lg border-l-[3px] border-[var(--husk)] bg-[var(--parchment)] px-4 py-3.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
              {cat.tip}
            </div>
            <a
              href={openLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--husk-dark)] hover:underline"
            >
              Open full results in Google Maps ↗
            </a>
          </>
        )}
      </div>
    </>
  );
}
