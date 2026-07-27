"use client";

import { useState, type FormEvent } from "react";
import { EmptyState, FieldError, ViewHeader } from "@/components/ui";
import { useApp } from "@/lib/store";
import { CROP_OPTIONS, type Farm } from "@/lib/types";
import {
  hasErrors,
  validateFarmForm,
  type FieldErrors,
} from "@/lib/validation";

export default function FarmsPage() {
  const { farms, diagnoses, addFarm, updateFarm, removeFarm, toast, saving } =
    useApp();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    name: "",
    crop: CROP_OPTIONS[0] as string,
    acres: "",
    location: "",
  });

  function openAdd() {
    setEditId(null);
    setErrors({});
    setForm({ name: "", crop: CROP_OPTIONS[0], acres: "", location: "" });
    setOpen(true);
  }

  function openEdit(f: Farm) {
    setEditId(f.id);
    setErrors({});
    setForm({
      name: f.name,
      crop: f.crop,
      acres: f.acres,
      location: f.location,
    });
    setOpen(true);
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validateFarmForm(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast("Please fix the highlighted fields", true);
      return;
    }
    const data = {
      name: form.name.trim(),
      crop: form.crop,
      acres: form.acres.trim(),
      location: form.location.trim(),
    };
    setSubmitting(true);
    try {
      if (editId) await updateFarm(editId, data);
      else await addFarm(data);
      setOpen(false);
      toast("Farm saved");
    } catch {
      /* toast already shown by store */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ViewHeader
        eyebrow="Farm management"
        title="My Farms"
        description="Keep field profiles current so diagnoses and forecasts stay grouped correctly."
        action={
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={openAdd}
          >
            + Add farm
          </button>
        }
      />

      {!farms.length ? (
        <div className="card">
          <EmptyState
            icon="⌂"
            title="No farms yet"
            description="Add a farm or field profile to start organizing diagnoses."
            action={
              <button type="button" className="btn btn-primary" onClick={openAdd}>
                + Add your first farm
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {farms.map((f) => {
            const count = diagnoses.filter((d) => d.farmId === f.id).length;
            return (
              <div
                key={f.id}
                className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:p-5"
              >
                <div className="absolute top-4 right-4 max-w-[40%] truncate rounded-[14px] bg-[var(--canopy)] px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] text-[var(--parchment)]">
                  {f.crop}
                </div>
                <h3 className="mb-1 pr-[70px] font-display text-lg font-semibold sm:text-[19px]">
                  {f.name}
                </h3>
                <div className="mb-3.5 text-[12.5px] text-[var(--ink-soft)]">
                  {f.location || "No location set"}
                </div>
                <div className="mb-4 flex gap-[18px]">
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-faint)]">
                      Acreage
                    </div>
                    <div className="font-mono text-[15px] font-semibold">
                      {f.acres || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-faint)]">
                      Diagnoses
                    </div>
                    <div className="font-mono text-[15px] font-semibold">
                      {count}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost px-3 py-1.5 text-[12.5px]"
                    onClick={() => openEdit(f)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-3 py-1.5 text-[12.5px]"
                    disabled={saving}
                    onClick={async () => {
                      try {
                        await removeFarm(f.id);
                        toast("Farm removed");
                      } catch {
                        /* store toast */
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(21,17,10,0.55)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <form
            onSubmit={onSave}
            noValidate
            className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-t-[16px] bg-[var(--card)] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.4)] sm:rounded-[var(--radius)] sm:p-7"
          >
            <h3 className="mb-[18px] font-display text-[21px] font-semibold">
              {editId ? "Edit farm" : "Add farm"}
            </h3>
            <div className="field">
              <label htmlFor="farm-name">Farm / field name</label>
              <input
                id="farm-name"
                value={form.name}
                aria-invalid={Boolean(errors.name)}
                className={errors.name ? "field-invalid" : undefined}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. North Forty"
              />
              <FieldError message={errors.name} />
            </div>
            <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="field mb-0">
                <label htmlFor="farm-crop">Primary crop</label>
                <select
                  id="farm-crop"
                  value={form.crop}
                  aria-invalid={Boolean(errors.crop)}
                  className={errors.crop ? "field-invalid" : undefined}
                  onChange={(e) => updateField("crop", e.target.value)}
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <FieldError message={errors.crop} />
              </div>
              <div className="field mb-0">
                <label htmlFor="farm-acres">Acreage</label>
                <input
                  id="farm-acres"
                  type="number"
                  min={0}
                  value={form.acres}
                  aria-invalid={Boolean(errors.acres)}
                  className={errors.acres ? "field-invalid" : undefined}
                  onChange={(e) => updateField("acres", e.target.value)}
                  placeholder="e.g. 35"
                />
                <FieldError message={errors.acres} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="farm-location">Location</label>
              <input
                id="farm-location"
                value={form.location}
                aria-invalid={Boolean(errors.location)}
                className={errors.location ? "field-invalid" : undefined}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Fresno County, CA"
              />
              <FieldError message={errors.location} />
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-ghost w-full sm:w-auto"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save farm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
