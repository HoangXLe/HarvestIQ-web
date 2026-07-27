"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FieldError, ViewHeader } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  hasErrors,
  validateProfileForm,
  type FieldErrors,
} from "@/lib/validation";

export default function SettingsPage() {
  const router = useRouter();
  const {
    profile,
    unitsMetric,
    saveProfile,
    setUnitsMetric,
    clearAllData,
    toast,
    saving,
  } = useApp();
  const [name, setName] = useState(profile.name);
  const [farmname, setFarmname] = useState(profile.farmname);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setFarmname(profile.farmname);
  }, [profile]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validateProfileForm({ name, farmname });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast("Please fix the highlighted fields", true);
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfile({
        name: name.trim(),
        farmname: farmname.trim(),
      });
      toast("Profile updated");
    } catch {
      /* store toast */
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <>
      <ViewHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your workspace profile, units, and locally stored data."
      />

      <form onSubmit={onSaveProfile} noValidate className="card mb-[18px]">
        <div className="mb-3.5 font-display text-lg font-semibold">Profile</div>
        <div className="mb-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <div className="field mb-0">
            <label htmlFor="settings-name">Name</label>
            <input
              id="settings-name"
              value={name}
              aria-invalid={Boolean(errors.name)}
              className={errors.name ? "field-invalid" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.name;
                  return n;
                });
              }}
            />
            <FieldError message={errors.name} />
          </div>
          <div className="field mb-0">
            <label htmlFor="settings-farm">Farm / cooperative</label>
            <input
              id="settings-farm"
              value={farmname}
              aria-invalid={Boolean(errors.farmname)}
              className={errors.farmname ? "field-invalid" : undefined}
              onChange={(e) => {
                setFarmname(e.target.value);
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.farmname;
                  return n;
                });
              }}
            />
            <FieldError message={errors.farmname} />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={savingProfile || saving}
        >
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <div className="card mb-[18px]">
        <div className="mb-3.5 font-display text-lg font-semibold">Units</div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Use metric units</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--ink-soft)]">
              °C, mm rainfall — off shows °F, inches
            </div>
          </div>
          <button
            type="button"
            aria-pressed={unitsMetric}
            disabled={saving}
            onClick={async () => {
              try {
                await setUnitsMetric(!unitsMetric);
                toast("Units updated");
              } catch {
                /* store toast */
              }
            }}
            className={`relative h-6 w-[42px] shrink-0 rounded-[14px] border-none ${
              unitsMetric ? "bg-[var(--sprout)]" : "bg-[var(--line)]"
            }`}
          >
            <span
              className={`absolute top-[2.5px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
                unitsMetric ? "translate-x-[18px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-3.5 font-display text-lg font-semibold">Data</div>
        <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Clear all local data</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--ink-soft)]">
              Removes farms, diagnoses, preferences, and your profile from this
              browser. Data currently persists across refresh via local storage.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger w-full shrink-0 sm:w-auto"
            disabled={clearing || saving}
            onClick={async () => {
              if (
                !confirm(
                  "This removes your farms, diagnoses, preferences, and profile from this browser. Continue?",
                )
              )
                return;
              setClearing(true);
              try {
                await clearAllData();
                toast("Local workspace cleared");
                router.push("/");
              } catch {
                /* store toast */
              } finally {
                setClearing(false);
              }
            }}
          >
            {clearing ? "Clearing…" : "Clear data"}
          </button>
        </div>
      </div>

      <p className="mt-9 border-t border-[var(--line)] pt-[18px] text-center text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
        HarvestIQ is an AI-assisted screening tool. Disease classification and
        outbreak forecasts are generated as decision support — not a certified
        agronomic diagnosis.
      </p>
    </>
  );
}
