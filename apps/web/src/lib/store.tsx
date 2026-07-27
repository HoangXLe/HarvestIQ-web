"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  StorageError,
  storageAvailable,
  storageDelete,
  storageGet,
  storageSet,
  uid,
} from "./storage";
import { isSafeImageDataUrl, sanitizePlainText } from "./security";
import {
  DEFAULT_PROFILE,
  type DiagnosisRecord,
  type Farm,
  type Profile,
} from "./types";

interface AppState {
  ready: boolean;
  loadError: string | null;
  saving: boolean;
  persistOk: boolean;
  profile: Profile;
  farms: Farm[];
  diagnoses: DiagnosisRecord[];
  unitsMetric: boolean;
  toast: (msg: string, isError?: boolean) => void;
  toastMessage: { id: number; msg: string; error: boolean } | null;
  clearToast: () => void;
  reload: () => Promise<void>;
  saveProfile: (p: Partial<Profile>) => Promise<void>;
  setUnitsMetric: (v: boolean) => Promise<void>;
  addFarm: (data: Omit<Farm, "id">) => Promise<void>;
  updateFarm: (id: string, data: Omit<Farm, "id">) => Promise<void>;
  removeFarm: (id: string) => Promise<void>;
  addDiagnosis: (record: Omit<DiagnosisRecord, "id">) => Promise<void>;
  removeDiagnosis: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

function errMessage(e: unknown, fallback: string) {
  if (e instanceof StorageError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [persistOk, setPersistOk] = useState(true);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [unitsMetric, setUnits] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    id: number;
    msg: string;
    error: boolean;
  } | null>(null);

  const toast = useCallback((msg: string, isError = false) => {
    setToastMessage({ id: Date.now(), msg, error: isError });
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  const reload = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      if (!storageAvailable()) {
        setPersistOk(false);
        setLoadError(
          "This browser blocked local storage. Your data will not persist after refresh.",
        );
        setReady(true);
        return;
      }
      setPersistOk(true);
      const p = await storageGet<Profile>("profile");
      const f = await storageGet<Farm[]>("farms");
      const d = await storageGet<DiagnosisRecord[]>("diagnoses");
      const u = await storageGet<{ metric: boolean }>("units");
      if (p && typeof p === "object") {
        setProfile({
          id: typeof p.id === "string" ? p.id : DEFAULT_PROFILE.id,
          name: typeof p.name === "string" && p.name.trim() ? p.name : DEFAULT_PROFILE.name,
          farmname:
            typeof p.farmname === "string" && p.farmname.trim()
              ? p.farmname
              : DEFAULT_PROFILE.farmname,
        });
      } else {
        setProfile(DEFAULT_PROFILE);
      }
      setFarms(Array.isArray(f) ? f.filter((x) => x && typeof x.id === "string") : []);
      setDiagnoses(
        Array.isArray(d)
          ? d.filter(
              (x) =>
                x &&
                typeof x.id === "string" &&
                x.diagnosis &&
                isSafeImageDataUrl(x.imageDataUrl),
            )
          : [],
      );
      setUnits(u === null ? true : Boolean(u.metric));
    } catch (e) {
      setLoadError(errMessage(e, "Failed to load saved workspace."));
      // Keep app usable with empty defaults
      setProfile(DEFAULT_PROFILE);
      setFarms([]);
      setDiagnoses([]);
      setUnits(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const withPersist = useCallback(
    async (fn: () => Promise<void>, successMsg?: string) => {
      setSaving(true);
      try {
        await fn();
        setPersistOk(true);
        if (successMsg) toast(successMsg);
      } catch (e) {
        setPersistOk(false);
        toast(errMessage(e, "Could not save. Changes may be lost on refresh."), true);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [toast],
  );

  const saveProfile = useCallback(
    async (partial: Partial<Profile>) => {
      const next = { ...profile, ...partial };
      await withPersist(async () => {
        await storageSet("profile", next);
        setProfile(next);
      });
    },
    [profile, withPersist],
  );

  const setUnitsMetric = useCallback(
    async (v: boolean) => {
      await withPersist(async () => {
        await storageSet("units", { metric: v });
        setUnits(v);
      });
    },
    [withPersist],
  );

  const addFarm = useCallback(
    async (data: Omit<Farm, "id">) => {
      const next = [...farms, { id: uid(), ...data }];
      await withPersist(async () => {
        await storageSet("farms", next);
        setFarms(next);
      });
    },
    [farms, withPersist],
  );

  const updateFarm = useCallback(
    async (id: string, data: Omit<Farm, "id">) => {
      const next = farms.map((f) => (f.id === id ? { ...f, ...data } : f));
      await withPersist(async () => {
        await storageSet("farms", next);
        setFarms(next);
      });
    },
    [farms, withPersist],
  );

  const removeFarm = useCallback(
    async (id: string) => {
      const next = farms.filter((f) => f.id !== id);
      await withPersist(async () => {
        await storageSet("farms", next);
        setFarms(next);
      });
    },
    [farms, withPersist],
  );

  const addDiagnosis = useCallback(
    async (record: Omit<DiagnosisRecord, "id">) => {
      if (!isSafeImageDataUrl(record.imageDataUrl)) {
        throw new StorageError(
          "That photo could not be saved securely. Please re-upload a JPG or PNG and try again.",
        );
      }
      const safeRecord: Omit<DiagnosisRecord, "id"> = {
        ...record,
        farmId: sanitizePlainText(record.farmId, 80),
        imageDataUrl: record.imageDataUrl,
        diagnosis: {
          ...record.diagnosis,
          disease_name: sanitizePlainText(record.diagnosis.disease_name, 120),
          description: sanitizePlainText(record.diagnosis.description, 2000),
          symptoms_observed: (record.diagnosis.symptoms_observed || [])
            .map((s) => sanitizePlainText(s, 200))
            .filter(Boolean),
          treatment_recommendations: (
            record.diagnosis.treatment_recommendations || []
          )
            .map((s) => sanitizePlainText(s, 300))
            .filter(Boolean),
          prevention_tips: (record.diagnosis.prevention_tips || [])
            .map((s) => sanitizePlainText(s, 300))
            .filter(Boolean),
        },
      };
      const next = [...diagnoses, { id: uid(), ...safeRecord }];
      await withPersist(async () => {
        await storageSet("diagnoses", next);
        setDiagnoses(next);
      });
    },
    [diagnoses, withPersist],
  );

  const removeDiagnosis = useCallback(
    async (id: string) => {
      const next = diagnoses.filter((d) => d.id !== id);
      await withPersist(async () => {
        await storageSet("diagnoses", next);
        setDiagnoses(next);
      });
    },
    [diagnoses, withPersist],
  );

  const clearAllData = useCallback(async () => {
    await withPersist(async () => {
      await storageDelete("farms");
      await storageDelete("diagnoses");
      await storageDelete("units");
      await storageDelete("profile");
      setFarms([]);
      setDiagnoses([]);
      setUnits(true);
      setProfile(DEFAULT_PROFILE);
      setPersistOk(true);
    });
  }, [withPersist]);

  const value = useMemo(
    () => ({
      ready,
      loadError,
      saving,
      persistOk,
      profile,
      farms,
      diagnoses,
      unitsMetric,
      toast,
      toastMessage,
      clearToast,
      reload,
      saveProfile,
      setUnitsMetric,
      addFarm,
      updateFarm,
      removeFarm,
      addDiagnosis,
      removeDiagnosis,
      clearAllData,
    }),
    [
      ready,
      loadError,
      saving,
      persistOk,
      profile,
      farms,
      diagnoses,
      unitsMetric,
      toast,
      toastMessage,
      clearToast,
      reload,
      saveProfile,
      setUnitsMetric,
      addFarm,
      updateFarm,
      removeFarm,
      addDiagnosis,
      removeDiagnosis,
      clearAllData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
