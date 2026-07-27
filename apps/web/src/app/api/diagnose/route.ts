import { NextResponse } from "next/server";
import { demoDiagnosis } from "@/lib/ai";
import { getErrorMessage } from "@/lib/errors";
import {
  MAX_API_BODY_BYTES,
  sanitizeCropType,
} from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_API_BODY_BYTES) {
      return NextResponse.json(
        {
          error:
            "Request too large. Image data is not sent to the diagnose API in this MVP — send crop type only.",
        },
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

    let body: { cropType?: string; imageBase64?: string } = {};
    try {
      body = raw ? (JSON.parse(raw) as typeof body) : {};
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please try again." },
        { status: 400 },
      );
    }

    // Never accept or process client image blobs on this demo endpoint
    // (prevents DoS via multi‑MB payloads and accidental secret/exfil surfaces).
    if (body.imageBase64) {
      return NextResponse.json(
        {
          error:
            "Image payloads are not accepted by this endpoint. Classification uses crop metadata only in demo mode.",
        },
        { status: 400 },
      );
    }

    const cropType = sanitizeCropType(body.cropType);

    await new Promise((r) => setTimeout(r, 700));

    const diagnosis = demoDiagnosis(cropType);
    if (!diagnosis?.disease_name) {
      return NextResponse.json(
        { error: "Diagnosis could not be completed. Please try another photo." },
        { status: 500 },
      );
    }

    return NextResponse.json({ diagnosis, mode: "demo" });
  } catch (e) {
    console.error("diagnose API:", e);
    return NextResponse.json(
      {
        error: getErrorMessage(
          e,
          "Diagnosis service failed. Please try again in a moment.",
        ),
      },
      { status: 500 },
    );
  }
}
