export type Severity = "none" | "low" | "moderate" | "high";
export type RiskLevel = "low" | "moderate" | "high" | "severe";

export interface Profile {
  id: string;
  name: string;
  farmname: string;
}

export interface Farm {
  id: string;
  name: string;
  crop: string;
  acres: string;
  location: string;
}

export interface DiagnosisResult {
  disease_name: string;
  confidence: number;
  severity: Severity;
  description: string;
  symptoms_observed: string[];
  treatment_recommendations: string[];
  prevention_tips: string[];
}

export interface DailyRisk {
  day: string;
  risk_score: number;
}

export interface ForecastResult {
  overall_risk_level: RiskLevel;
  risk_summary: string;
  daily_risk: DailyRisk[];
  recommended_actions: string[];
}

export interface EnvInputs {
  temp: number;
  humidity: number;
  rainfall: number;
  leafWetness: number;
  trend: string;
}

export interface DiagnosisRecord {
  id: string;
  farmId: string;
  timestamp: number;
  imageDataUrl: string;
  diagnosis: DiagnosisResult;
  forecast: ForecastResult | null;
  envInputs?: EnvInputs;
}

export const CROP_OPTIONS = [
  "Tomato",
  "Corn / Maize",
  "Wheat",
  "Soybean",
  "Potato",
  "Grape",
  "Apple",
  "Rice",
  "Cotton",
  "Other",
] as const;

export const RESOURCE_CATEGORIES = [
  {
    key: "agronomist",
    label: "Certified Agronomist",
    query: "certified agronomist crop consultant",
    tip: "For moderate, high, or severe risk forecasts, an in-person visit from a certified agronomist is the most reliable way to confirm an AI screening result before spending on treatment.",
  },
  {
    key: "extension",
    label: "Extension Office",
    query: "agricultural extension office",
    tip: "University and county extension offices often provide free or low-cost soil testing, disease confirmation, and region-specific guidance.",
  },
  {
    key: "supply",
    label: "Crop Supply Store",
    query: "farm supply store fertilizer pesticide",
    tip: "Local supply stores can source fungicides, bactericides, or amendments referenced in your treatment recommendations.",
  },
  {
    key: "mechanic",
    label: "Equipment Mechanic",
    query: "farm equipment repair mechanic",
    tip: "Well-maintained sprayers and irrigation equipment apply treatment more evenly — worth a service check after a new diagnosis.",
  },
  {
    key: "dealer",
    label: "Equipment Dealer",
    query: "farm equipment dealer",
    tip: "Dealers can advise on precision-ag attachments that reduce disease risk over future seasons.",
  },
] as const;

export const DEFAULT_PROFILE: Profile = {
  id: "local-grower",
  name: "Maria Lopez",
  farmname: "Lopez Family Farm",
};
