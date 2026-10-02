"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Clock3,
  Database,
  Fuel,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Table2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Reading = {
  id?: number;
  date?: string;
  device_id: string;
  mains_voltage: number;
  generator_voltage: number;
  fuel: number;
  fuel_used_liters: number;
  generator_on_seconds: number;
  recorded_at: string;
};
type DashboardData = {
  latest: Reading[];
  daily_fuel: Reading[];
  recent: Reading[];
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const hours = (seconds: number) =>
  `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (response.status === 401) {
      router.replace("/login");
      return;
    }
    if (!response.ok) throw new Error("Telemetry data could not be loaded.");
    setData(await response.json());
  }
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/login");
          return;
        }
        setUser((await response.json()).user);
        return load();
      })
      .catch(() => setError("Unable to connect to the telemetry database."))
      .finally(() => setLoading(false));
  }, [router]);

  const latest = data?.latest ?? [];
  const recent = data?.recent ?? [];
  const selected = latest[0];
  const totalFuel = useMemo(
    () =>
      (data?.daily_fuel ?? []).reduce(
        (sum, row) => sum + Number(row.fuel_used_liters),
        0,
      ),
    [data],
  );
  const totalRuntime = useMemo(
    () =>
      (data?.daily_fuel ?? []).reduce(
        (sum, row) => sum + Number(row.generator_on_seconds),
        0,
      ),
    [data],
  );
  const maxFuel = Math.max(
    ...(data?.daily_fuel ?? []).map((row) => Number(row.fuel_used_liters)),
    1,
  );
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading)
    return <main className="loading-screen">Loading live telemetry…</main>;
  if (!user) return null;
  return (
    <div className="monitor-shell">
      <aside className={`monitor-sidebar ${navOpen ? "open" : ""}`}>
        <div className="monitor-brand">
          <span className="brand-mark">
            <Zap size={17} fill="currentColor" />
          </span>
          <strong>
            volt<span>watch</span>
          </strong>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="monitor-identity">
          <span>{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
        </div>
        <nav>
          <a className="active" href="#overview">
            <Activity />
            Overview
          </a>
          <a href="#fuel">
            <Fuel />
            Fuel usage
          </a>
          <a href="#readings">
            <Table2 />
            Incoming data
          </a>
        </nav>
        <div className="monitor-secure">
          <ShieldCheck />
          <div>
            <strong>Database connected</strong>
            <small>Live ESP32 telemetry</small>
          </div>
        </div>
      </aside>
      <main className="monitor-main">
        <header className="monitor-topbar">
          <button
            className="open-nav"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div>
            <span className="kicker">Operations / Live monitoring</span>
            <h1>Power supply dashboard</h1>
          </div>
          <div className="topbar-actions">
            <span className="live-status">
              <i />
              Live database
            </span>
            <button
              className="refresh"
              onClick={() => load()}
              aria-label="Refresh telemetry"
            >
              <RefreshCw />
            </button>
            <button className="logout" onClick={logout}>
              <LogOut />
              Sign out
            </button>
          </div>
        </header>
        <div className="monitor-content" id="overview">
          <div className="intro">
            <div>
              <p className="kicker">
                {selected
                  ? `Last update ${formatDate(selected.recorded_at)} at ${formatTime(selected.recorded_at)}`
                  : "No readings yet"}
              </p>
              <h2>Mains and generator supply</h2>
              <p>
                Voltage, fuel, runtime, and device readings received from your
                ESP32 fleet.
              </p>
            </div>
            <span className="data-count">
              <Database />
              {latest.length} devices reporting
            </span>
          </div>
          {error && <div className="data-alert">{error}</div>}
          {!selected && !error && (
            <div className="empty-state">
              No telemetry readings are stored yet. Send a POST request to{" "}
              <code>/api/devices/telemetry</code> to begin.
            </div>
          )}
          {selected && (
            <>
              <section className="supply-grid">
                <article className="supply-card mains">
                  <div className="supply-label">
                    <span>
                      <Waves />
                      Mains voltage
                    </span>
                    <small>{selected.device_id}</small>
                  </div>
                  <strong>
                    {Number(selected.mains_voltage).toFixed(1)} <em>V</em>
                  </strong>
                  <p>Incoming utility supply</p>
                </article>
                <article className="supply-card generator">
                  <div className="supply-label">
                    <span>
                      <Zap />
                      Generator voltage
                    </span>
                    <small>
                      {selected.generator_voltage > 0 ? "Running" : "Standby"}
                    </small>
                  </div>
                  <strong>
                    {Number(selected.generator_voltage).toFixed(1)} <em>V</em>
                  </strong>
                  <p>Generator output supply</p>
                </article>
                <article className="supply-card fuel-card">
                  <div className="supply-label">
                    <span>
                      <Fuel />
                      Fuel level
                    </span>
                    <small>Current tank</small>
                  </div>
                  <strong>
                    {Number(selected.fuel).toFixed(0)} <em>%</em>
                  </strong>
                  <div className="fuel-bar">
                    <i
                      style={{
                        width: `${Math.min(Number(selected.fuel), 100)}%`,
                      }}
                    />
                  </div>
                </article>
                <article className="supply-card runtime">
                  <div className="supply-label">
                    <span>
                      <Clock3 />
                      Generator on time
                    </span>
                    <small>Latest reading</small>
                  </div>
                  <strong>
                    {hours(Number(selected.generator_on_seconds))}
                  </strong>
                  <p>Since last telemetry update</p>
                </article>
              </section>
              <section className="lower-layout">
                <article className="panel" id="fuel">
                  <div className="panel-heading">
                    <div>
                      <span className="kicker">Consumption history</span>
                      <h3>Fuel usage per day</h3>
                    </div>
                    <span className="total-value">
                      {totalFuel.toFixed(1)} L total
                    </span>
                  </div>
                  <div className="bar-chart">
                    {(data?.daily_fuel ?? []).map((row) => (
                      <div className="bar-item" key={String(row.date)}>
                        <span>{Number(row.fuel_used_liters).toFixed(1)} L</span>
                        <i
                          style={{
                            height: `${Math.max((Number(row.fuel_used_liters) / maxFuel) * 100, 5)}%`,
                          }}
                        />
                        <small>
                          {formatDate(String(row.date)).slice(0, 6)}
                        </small>
                      </div>
                    ))}
                  </div>
                </article>
                <article className="panel runtime-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="kicker">Runtime summary</span>
                      <h3>Generator operating time</h3>
                    </div>
                    <Clock3 />
                  </div>
                  <strong className="big-runtime">{hours(totalRuntime)}</strong>
                  <p>
                    Combined generator-on duration across the selected date
                    range.
                  </p>
                  <div className="runtime-meta">
                    <span>
                      <CalendarDays />
                      {data?.daily_fuel.length ?? 0} days tracked
                    </span>
                    <span>
                      <Fuel />
                      {totalFuel.toFixed(1)} L consumed
                    </span>
                  </div>
                </article>
              </section>
              <section className="panel incoming-panel" id="readings">
                <div className="panel-heading">
                  <div>
                    <span className="kicker">ESP32 stream</span>
                    <h3>Incoming telemetry data</h3>
                    <p>Most recent rows stored in the database.</p>
                  </div>
                  <span className="endpoint-chip">
                    POST /api/devices/telemetry
                  </span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Received</th>
                        <th>Device</th>
                        <th>Mains</th>
                        <th>Generator</th>
                        <th>Fuel</th>
                        <th>Generator on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((row) => (
                        <tr key={row.id}>
                          <td>
                            {formatDate(row.recorded_at)}{" "}
                            {formatTime(row.recorded_at)}
                          </td>
                          <td>
                            <strong>{row.device_id}</strong>
                          </td>
                          <td>{Number(row.mains_voltage).toFixed(1)} V</td>
                          <td>{Number(row.generator_voltage).toFixed(1)} V</td>
                          <td>{Number(row.fuel).toFixed(0)}%</td>
                          <td>{hours(Number(row.generator_on_seconds))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <details className="schema-details">
                <summary>ESP32 request schema</summary>
                <pre>{`POST /api/devices/telemetry\nContent-Type: application/json\n\n{\n  "device_id": "GEN-042",\n  "mains_voltage": 231.4,\n  "generator_voltage": 228.9,\n  "fuel_percent": 42,\n  "fuel_used_liters": 23.6,\n  "generator_on_seconds": 16200,\n  "recorded_at": "2026-09-30T10:30:00Z"\n}`}</pre>
              </details>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
