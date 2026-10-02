CREATE TABLE "telemetry_readings" (
	"id" serial PRIMARY KEY,
	"device_id" text NOT NULL,
	"mains_voltage" numeric(8, 2) NOT NULL,
	"generator_voltage" numeric(8, 2) NOT NULL,
	"fuel_percent" numeric(5, 2) NOT NULL,
	"fuel_used_liters" numeric(8, 2) DEFAULT '0' NOT NULL,
	"generator_on_seconds" integer DEFAULT 0 NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "telemetry_readings_pkey" ON "telemetry_readings" ("id");

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL,
  fuel INTEGER NOT NULL,
  voltage INTEGER NOT NULL DEFAULT 0,
  last_seen TEXT NOT NULL,
  gsm INTEGER NOT NULL,
  battery NUMERIC NOT NULL
)

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  device_id TEXT NOT NULL,
  event_time TEXT NOT NULL,
  tone TEXT NOT NULL
)

CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL CONSTRAINT "users_email_key" UNIQUE,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'Administrator' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");
