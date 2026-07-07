"use client";

import { useEffect, useState } from "react";
import { brainState } from "../lib/brain";
import { Sidebar } from "./dashboard/Sidebar";
import { TopBar } from "./dashboard/TopBar";
import { MissionCards } from "./dashboard/MissionCards";
import { WorkspaceRegistry } from "./dashboard/WorkspaceRegistry";
import { BrainRuleCard } from "./dashboard/BrainRuleCard";

export function DashboardShell() {
  const [error, setError] = useState("");

  async function loadMetrics() {
    setError("");

    try {
      const response = await fetch("/api/analytics/dashboard");
      if (!response.ok) throw new Error("Failed to load dashboard metrics.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  useEffect(() => {
    void loadMetrics();
  }, []);

  return (
    <main className="ros-app">
      <Sidebar workspace={brainState.workspace} version={brainState.version} />

      <section className="ros-main">
        <TopBar onRefresh={() => void loadMetrics()} />

        <div className="ros-eyebrow">Mission Control</div>
        <h1>Reynalds OS Command Center</h1>
        <p className="ros-subtitle">{brainState.priority}</p>

        {error ? <p className="ros-error">{error}</p> : null}

        <MissionCards />

        <section className="ros-object-layout" style={{ marginTop: 18 }}>
          <WorkspaceRegistry />
          <BrainRuleCard />
        </section>
      </section>
    </main>
  );
}