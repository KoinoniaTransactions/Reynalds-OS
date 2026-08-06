"use client";

import {
  useEffect,
  useState
} from "react";

import { brainState } from "../lib/brain";
import { BrainRuleCard } from "./dashboard/BrainRuleCard";
import { MissionCards } from "./dashboard/MissionCards";
import { Sidebar } from "./dashboard/Sidebar";
import { TopBar } from "./dashboard/TopBar";
import { WorkspaceRegistry } from "./dashboard/WorkspaceRegistry";

export function DashboardShell() {
  const [error, setError] =
    useState("");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  async function loadMetrics() {
    setError("");
    setIsRefreshing(true);

    try {
      const response = await fetch(
        "/api/analytics/dashboard"
      );

      if (!response.ok) {
        throw new Error(
          "Dashboard metrics could not be loaded."
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Dashboard metrics could not be loaded."
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMetrics();
  }, []);

  return (
    <main className="ros-app ros-app-modern">
      <Sidebar
        version={brainState.version}
        workspace={brainState.workspace}
      />

      <section className="ros-main">
        <TopBar
          hasError={Boolean(error)}
          isRefreshing={isRefreshing}
          onRefresh={() => {
            void loadMetrics();
          }}
        />

        <header className="ros-dashboard-header">
          <div>
            <div className="ros-eyebrow">
              Mission Control
            </div>

            <h1>Command Center</h1>

            <p className="ros-subtitle">
              {brainState.priority}
            </p>
          </div>

          <span className="ros-dashboard-version">
            v{brainState.version}
          </span>
        </header>

        {error ? (
          <div
            className="ros-inline-alert"
            role="alert"
          >
            <div>
              <strong>
                Dashboard status unavailable
              </strong>

              <span>{error}</span>
            </div>

            <button
              disabled={isRefreshing}
              type="button"
              onClick={() => {
                void loadMetrics();
              }}
            >
              {isRefreshing
                ? "Retrying..."
                : "Try again"}
            </button>
          </div>
        ) : null}

        <MissionCards />

        <section className="ros-dashboard-layout">
          <WorkspaceRegistry />
          <BrainRuleCard />
        </section>
      </section>
    </main>
  );
}
