import { NextResponse } from "next/server";
import { demoForecast, type ForecastPayload } from "@/lib/ai";
import { getErrorMessage } from "@/lib/errors";
import { MAX_API_BODY_BYTES, sanitizePlainText } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_API_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_API_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    let payload: Partial<ForecastPayload>;
    try {
      payload = raw ? (JSON.parse(raw) as Partial<ForecastPayload>) : {};
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid forecast request. Please check field conditions and try again.",
        },
        { status: 400 },
      );
    }

    const crop = sanitizePlainText(payload.crop, 60);
    const disease = sanitizePlainText(payload.disease, 120);
    if (!crop || !disease) {
      return NextResponse.json(
        { error: "Crop and diagnosis are required to forecast risk." },
        { status: 400 },
      );
    }

    const safePayload: ForecastPayload = {
      crop,
      disease,
      severity: sanitizePlainText(payload.severity, 20) || "low",
      temp: payload.temp ?? 0,
      tempUnit: sanitizePlainText(payload.tempUnit, 8) || "°C",
      humidity: payload.humidity ?? 0,
      rainfall: payload.rainfall ?? 0,
      rainUnit: sanitizePlainText(payload.rainUnit, 8) || "mm",
      leafWetness: payload.leafWetness ?? 0,
      trend: sanitizePlainText(payload.trend, 80) || "mixed",
    };

    await new Promise((r) => setTimeout(r, 600));
    const forecast = demoForecast(safePayload);

    if (!forecast?.overall_risk_level || !Array.isArray(forecast.daily_risk)) {
      return NextResponse.json(
        { error: "Forecast could not be completed. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ forecast, mode: "demo" });
  } catch (e) {
    console.error("forecast API:", e);
    return NextResponse.json(
      {
        error: getErrorMessage(
          e,
          "Forecast service failed. Please try again in a moment.",
        ),
      },
      { status: 500 },
    );
  }
}
