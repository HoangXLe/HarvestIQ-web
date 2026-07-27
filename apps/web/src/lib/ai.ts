import type { DiagnosisResult, ForecastResult, Severity } from "./types";

export function demoDiagnosis(cropType?: string): DiagnosisResult {
  const crop = (cropType || "crop").toLowerCase();
  const catalog: DiagnosisResult[] = [
    {
      disease_name: "Early Blight",
      confidence: 0.86,
      severity: "moderate",
      description:
        "Concentric brown lesions and yellowing around leaf margins are consistent with early blight pressure. The pattern suggests a fungal infection progressing from older foliage.",
      symptoms_observed: [
        "Concentric target-like lesions",
        "Chlorosis around leaf edges",
        "Dry necrotic spots on mid-leaf",
      ],
      treatment_recommendations: [
        "Remove and destroy heavily infected leaves",
        "Apply a labeled fungicide suited to early blight",
        "Improve airflow by thinning dense canopy",
      ],
      prevention_tips: [
        "Rotate out of solanaceous crops for 2–3 seasons",
        "Water at soil level to keep foliage dry",
        "Mulch to reduce soil splash onto leaves",
      ],
    },
    {
      disease_name: "Powdery Mildew",
      confidence: 0.81,
      severity: "low",
      description:
        "A pale powdery film on the leaf surface is typical of powdery mildew. Conditions look favorable for slow spread if humidity stays moderate overnight.",
      symptoms_observed: [
        "White powdery patches on upper leaf",
        "Slight leaf curling",
        "Localized yellow flecks",
      ],
      treatment_recommendations: [
        "Apply sulfur or potassium bicarbonate spray per label",
        "Prune crowded shoots for better light",
        "Monitor neighboring plants for early spots",
      ],
      prevention_tips: [
        "Avoid overhead irrigation late in the day",
        "Choose resistant cultivars next season",
        "Space plants for airflow",
      ],
    },
    {
      disease_name: "Healthy / No Disease Detected",
      confidence: 0.74,
      severity: "none",
      description:
        "Leaf color and surface texture look within a normal range for this crop. No clear necrotic lesions or widespread chlorosis were identified in the photo.",
      symptoms_observed: [
        "Even green coloration",
        "Intact leaf margins",
        "No obvious fungal sporulation",
      ],
      treatment_recommendations: [
        "Continue routine scouting twice weekly",
        "Keep current irrigation schedule",
        "Photograph the same plant in 3–5 days for comparison",
      ],
      prevention_tips: [
        "Maintain balanced fertility",
        "Sanitize tools between fields",
        "Scout after rain events",
      ],
    },
  ];

  let pick = catalog[Math.floor(Math.random() * catalog.length)];
  if (crop.includes("grape") || crop.includes("wheat")) pick = catalog[1];
  if (crop.includes("tomato") || crop.includes("potato")) pick = catalog[0];
  return structuredClone(pick);
}

export interface ForecastPayload {
  crop: string;
  disease: string;
  severity: Severity | string;
  temp: number | string;
  tempUnit: string;
  humidity: number | string;
  rainfall: number | string;
  rainUnit: string;
  leafWetness: number | string;
  trend: string;
}

export function demoForecast(payload: ForecastPayload): ForecastResult {
  const humidity = Number(payload.humidity) || 50;
  const wetness = Number(payload.leafWetness) || 2;
  const rain = Number(payload.rainfall) || 0;
  let base = 25 + humidity * 0.35 + wetness * 6 + Math.min(rain * 3, 20);
  const sev = String(payload.severity).toLowerCase();
  if (sev === "high") base += 18;
  if (sev === "moderate") base += 10;
  const trend = String(payload.trend).toLowerCase();
  if (trend.includes("dry")) base -= 15;
  if (trend.includes("wet")) base += 12;
  base = Math.max(8, Math.min(92, Math.round(base)));

  const daily = Array.from({ length: 7 }, (_, i) => {
    const wobble = Math.round(Math.sin(i * 0.9) * 6 + i * 1.5);
    return {
      day: `Day ${i + 1}`,
      risk_score: Math.max(5, Math.min(98, base + wobble)),
    };
  });

  const avg = Math.round(daily.reduce((s, d) => s + d.risk_score, 0) / 7);
  const level =
    avg >= 75 ? "severe" : avg >= 55 ? "high" : avg >= 35 ? "moderate" : "low";

  return {
    overall_risk_level: level,
    risk_summary: `Based on ${payload.humidity}% humidity, ${payload.leafWetness} hours of leaf wetness, and a ${String(payload.trend).toLowerCase()} outlook, near-term pressure for ${payload.disease} on ${payload.crop} is ${level}. Field scouting over the next week remains the safest confirmation step.`,
    daily_risk: daily,
    recommended_actions: [
      "Scout the affected block every 48 hours and photograph progressive leaves",
      "Confirm product choice with a local agronomist before a spray program",
      "Adjust irrigation timing to reduce overnight leaf wetness where possible",
      "Isolate heavily symptomatic plants when practical",
    ],
  };
}

export function riskColor(score: number): string {
  if (score >= 70) return "#A63A2E";
  if (score >= 40) return "#C98A2C";
  return "#5C7A3D";
}

export function resizeImageFile(
  file: File,
): Promise<{ dataUrl: string; base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        const base64 = dataUrl.split(",")[1];
        resolve({ dataUrl, base64, mediaType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
