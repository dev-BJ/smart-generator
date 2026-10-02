import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type TelemetryPayload = {
  device_id?: unknown;
  mains_voltage?: unknown;
  generator_voltage?: unknown;
  fuel_percent?: unknown;
  fuel_used_liters?: unknown;
  generator_on_seconds?: unknown;
  recorded_at?: unknown;
};
const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const textValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  let payload: TelemetryPayload;
  try {
    payload = await request.json();
    console.log(payload)
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: cors },
    );
  }
  const device_id = textValue(payload.device_id);
  const mains_voltage = numberValue(payload.mains_voltage);
  const generator_voltage = numberValue(payload.generator_voltage);
  const fuel_percent = numberValue(payload.fuel_percent);
  const fuel_used_liters = numberValue(payload.fuel_used_liters);
  const generator_on_seconds = numberValue(payload.generator_on_seconds);
  const recorded_at =
    payload.recorded_at && typeof payload.recorded_at === "string"
      ? new Date(payload.recorded_at)
      : new Date();
  if (
    !device_id ||
    mains_voltage === null ||
    generator_voltage === null ||
    fuel_percent === null ||
    fuel_used_liters === null ||
    generator_on_seconds === null ||
    Number.isNaN(recorded_at.getTime())
  )
    return NextResponse.json(
      {
        error:
          "device_id, mains_voltage, generator_voltage, fuel_percent, fuel_used_liters, generator_on_seconds, and a valid recorded_at are required.",
      },
      { status: 400, headers: cors },
    );
  if (
    mains_voltage < 0 ||
    generator_voltage < 0 ||
    fuel_percent < 0 ||
    fuel_percent > 100 ||
    fuel_used_liters < 0 ||
    generator_on_seconds < 0 ||
    !Number.isInteger(generator_on_seconds)
  )
    return NextResponse.json(
      { error: "Telemetry values are outside the supported range." },
      { status: 422, headers: cors },
    );
  try {
    const result = await pool.query(
      `INSERT INTO telemetry_readings (device_id, mains_voltage, generator_voltage, fuel_percent, fuel_used_liters, generator_on_seconds, recorded_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, device_id, mains_voltage, generator_voltage, fuel_percent, fuel_used_liters, generator_on_seconds, recorded_at`,
      [
        device_id,
        mains_voltage,
        generator_voltage,
        fuel_percent,
        fuel_used_liters,
        generator_on_seconds,
        recorded_at,
      ],
    );
    return NextResponse.json(
      { ok: true, reading: result.rows[0] },
      { headers: cors },
    );
  } catch (error) {
    console.error("[v0] Telemetry write failed:", error);
    return NextResponse.json(
      { error: "Unable to store telemetry." },
      { status: 500, headers: cors },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to submit device telemetry." },
    { status: 405, headers: { ...cors, Allow: "POST, OPTIONS" } },
  );
}
