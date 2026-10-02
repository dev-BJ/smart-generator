import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const [latest, daily_fuel, recent] = await Promise.all([
      client.query(
        `SELECT DISTINCT ON (device_id) device_id, mains_voltage, generator_voltage, fuel_percent AS fuel, fuel_used_liters, generator_on_seconds, recorded_at FROM telemetry_readings ORDER BY device_id, recorded_at DESC`,
      ),
      client.query(
        `SELECT recorded_at::date AS date, ROUND(SUM(fuel_used_liters)::numeric, 2) AS fuel_used_liters, SUM(generator_on_seconds)::integer AS generator_on_seconds FROM telemetry_readings WHERE recorded_at >= CURRENT_DATE - INTERVAL '6 days' GROUP BY recorded_at::date ORDER BY date`,
      ),
      client.query(
        `SELECT id, device_id, mains_voltage, generator_voltage, fuel_percent AS fuel, fuel_used_liters, generator_on_seconds, recorded_at FROM telemetry_readings ORDER BY recorded_at DESC LIMIT 12`,
      ),
    ]);
    return NextResponse.json({
      latest: latest.rows,
      daily_fuel: daily_fuel.rows,
      recent: recent.rows,
    });
  } catch (error) {
    console.error("[v0] Dashboard query failed:", error);
    return NextResponse.json(
      { error: "Unable to load telemetry data." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export const dynamic = "force-dynamic";
