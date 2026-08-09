/**
 * Sample workspace data so the dashboard / reports / farms pages
 * showcase a populated farmer experience on first visit.
 */

import type {
  DiagnosisRecord,
  Farm,
  ForecastResult,
  Profile,
} from "./types";

/** Tiny valid PNG fallback if canvas is unavailable. */
const FALLBACK_LEAF =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";

export const DEMO_PROFILE: Profile = {
  id: "local-grower",
  name: "Maria Lopez",
  farmname: "Lopez Family Farm",
};

export const DEMO_FARMS: Farm[] = [
  {
    id: "farm-north-tomato",
    name: "North Tomato Block",
    crop: "Tomato",
    acres: "12",
    location: "Dixon, IL",
  },
  {
    id: "farm-east-corn",
    name: "East Corn Field",
    crop: "Corn / Maize",
    acres: "40",
    location: "Lee County, IL",
  },
  {
    id: "farm-west-grape",
    name: "West Vineyard Row",
    crop: "Grape",
    acres: "6.5",
    location: "Galena, IL",
  },
  {
    id: "farm-south-soy",
    name: "South Soybean Strip",
    crop: "Soybean",
    acres: "28",
    location: "Amboy, IL",
  },
];

function sampleLeafDataUrl(variant: number): string {
  if (typeof document === "undefined") return FALLBACK_LEAF;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return FALLBACK_LEAF;

    const greens = ["#3d6b2f", "#4f7a38", "#5c7a3d", "#2f5a28"];
    const browns = ["#8b5a2b", "#a63a2e", "#c98a2c", "#6b4f2a"];
    const g = greens[variant % greens.length];
    const b = browns[variant % browns.length];

    const bg = ctx.createLinearGradient(0, 0, 320, 240);
    bg.addColorStop(0, "#e8e2d4");
    bg.addColorStop(1, "#d4cbb8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 320, 240);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(160, 120, 110, 70, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#2a4a22";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 160);
    ctx.quadraticCurveTo(160, 100, 250, 80);
    ctx.stroke();

    if (variant % 4 !== 2) {
      ctx.fillStyle = b;
      for (let i = 0; i < 4 + (variant % 3); i++) {
        const x = 100 + i * 28 + (variant % 5) * 3;
        const y = 90 + (i % 3) * 22;
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 10, 0.3 * i, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return FALLBACK_LEAF;
  }
}

function dailyRisk(
  base: number,
  wobble = 1,
): ForecastResult["daily_risk"] {
  return Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    risk_score: Math.max(
      5,
      Math.min(98, Math.round(base + Math.sin(i * 0.9) * 6 * wobble + i * 1.2)),
    ),
  }));
}

export function buildDemoDiagnoses(now = Date.now()): DiagnosisRecord[] {
  const day = 86_400_000;

  return [
    {
      id: "dx-tomato-blight",
      farmId: "farm-north-tomato",
      timestamp: now - 1 * day,
      imageDataUrl: sampleLeafDataUrl(0),
      diagnosis: {
        disease_name: "Early Blight",
        confidence: 0.88,
        severity: "moderate",
        description:
          "Concentric brown lesions and yellowing around leaf margins are consistent with early blight pressure on tomato.",
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
      forecast: {
        overall_risk_level: "high",
        risk_summary:
          "Warm, humid nights and lingering leaf wetness favor early blight spread across the north tomato block over the next week.",
        daily_risk: dailyRisk(62),
        recommended_actions: [
          "Scout the block every 48 hours",
          "Confirm spray choice with a local agronomist",
          "Shift irrigation earlier in the day",
        ],
      },
      envInputs: {
        temp: 27,
        humidity: 78,
        rainfall: 12,
        leafWetness: 8,
        trend: "Warm and humid",
      },
    },
    {
      id: "dx-grape-mildew",
      farmId: "farm-west-grape",
      timestamp: now - 2 * day,
      imageDataUrl: sampleLeafDataUrl(1),
      diagnosis: {
        disease_name: "Powdery Mildew",
        confidence: 0.83,
        severity: "low",
        description:
          "A pale powdery film on grape foliage is typical of powdery mildew. Pressure is still early but worth monitoring.",
        symptoms_observed: [
          "White powdery patches on upper leaf",
          "Slight leaf curling",
          "Localized yellow flecks",
        ],
        treatment_recommendations: [
          "Apply sulfur or potassium bicarbonate spray per label",
          "Prune crowded shoots for better light",
          "Monitor neighboring vines for early spots",
        ],
        prevention_tips: [
          "Avoid overhead irrigation late in the day",
          "Choose resistant cultivars next season",
          "Space plants for airflow",
        ],
      },
      forecast: {
        overall_risk_level: "moderate",
        risk_summary:
          "Moderate humidity with drying afternoons keeps powdery mildew risk elevated but manageable in the west vineyard.",
        daily_risk: dailyRisk(44, 0.8),
        recommended_actions: [
          "Continue canopy thinning",
          "Re-check treated rows in 3 days",
          "Photograph progressive leaves for comparison",
        ],
      },
      envInputs: {
        temp: 24,
        humidity: 62,
        rainfall: 2,
        leafWetness: 3,
        trend: "Drying after light rain",
      },
    },
    {
      id: "dx-corn-healthy",
      farmId: "farm-east-corn",
      timestamp: now - 3 * day,
      imageDataUrl: sampleLeafDataUrl(2),
      diagnosis: {
        disease_name: "Healthy / No Disease Detected",
        confidence: 0.79,
        severity: "none",
        description:
          "Leaf color and surface texture look within a normal range for corn. No clear necrotic lesions were identified.",
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
      forecast: {
        overall_risk_level: "low",
        risk_summary:
          "Dry outlook and low leaf wetness keep near-term disease pressure low on the east corn field.",
        daily_risk: dailyRisk(22, 0.6),
        recommended_actions: [
          "Maintain current scouting cadence",
          "Watch for storm-driven wetness spikes",
        ],
      },
      envInputs: {
        temp: 29,
        humidity: 48,
        rainfall: 0,
        leafWetness: 1,
        trend: "Dry and clear",
      },
    },
    {
      id: "dx-soy-severe",
      farmId: "farm-south-soy",
      timestamp: now - 5 * day,
      imageDataUrl: sampleLeafDataUrl(3),
      diagnosis: {
        disease_name: "Septoria Leaf Spot",
        confidence: 0.91,
        severity: "high",
        description:
          "Numerous angular brown lesions with yellow halos on soybean leaves suggest advanced septoria pressure in the south strip.",
        symptoms_observed: [
          "Angular brown lesions",
          "Yellow halos around spots",
          "Lower-canopy defoliation starting",
        ],
        treatment_recommendations: [
          "Prioritize an agronomist confirmation before a full spray program",
          "Consider a labeled fungicide timed to growth stage",
          "Flag the most affected rows for follow-up",
        ],
        prevention_tips: [
          "Improve residue management after harvest",
          "Rotate to a non-host crop next season",
          "Avoid working fields when foliage is wet",
        ],
      },
      forecast: {
        overall_risk_level: "severe",
        risk_summary:
          "High humidity, recent rainfall, and long leaf-wetness hours create severe near-term outbreak risk for septoria on soybean.",
        daily_risk: dailyRisk(78, 1.1),
        recommended_actions: [
          "Contact a certified agronomist this week",
          "Isolate heavily symptomatic areas when practical",
          "Document spread with dated photos",
        ],
      },
      envInputs: {
        temp: 26,
        humidity: 85,
        rainfall: 22,
        leafWetness: 11,
        trend: "Wet and unsettled",
      },
    },
    {
      id: "dx-tomato-followup",
      farmId: "farm-north-tomato",
      timestamp: now - 8 * day,
      imageDataUrl: sampleLeafDataUrl(4),
      diagnosis: {
        disease_name: "Early Blight",
        confidence: 0.72,
        severity: "low",
        description:
          "Earlier screening caught light early blight symptoms on older tomato foliage before canopy pressure increased.",
        symptoms_observed: [
          "Small concentric spots on older leaves",
          "Mild yellowing",
        ],
        treatment_recommendations: [
          "Remove symptomatic lower leaves",
          "Monitor humidity overnight",
        ],
        prevention_tips: [
          "Keep mulch in place",
          "Avoid late-day overhead watering",
        ],
      },
      forecast: {
        overall_risk_level: "moderate",
        risk_summary:
          "Baseline humidity kept moderate risk on tomato before the later high-risk follow-up scan.",
        daily_risk: dailyRisk(40, 0.7),
        recommended_actions: [
          "Continue removing lower infected leaves",
          "Re-scan after the next rain event",
        ],
      },
      envInputs: {
        temp: 25,
        humidity: 66,
        rainfall: 4,
        leafWetness: 5,
        trend: "Mild and unsettled",
      },
    },
  ];
}

export function buildDemoWorkspace() {
  return {
    profile: DEMO_PROFILE,
    farms: DEMO_FARMS,
    diagnoses: buildDemoDiagnoses(),
    unitsMetric: true,
  };
}
