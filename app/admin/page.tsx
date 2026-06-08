"use client";

import { useCallback, useEffect, useState } from "react";
import type { Job } from "@/lib/types";
import LoginForm from "@/components/LoginForm";
import StatsCards from "@/components/StatsCards";
import JobsTable from "@/components/JobsTable";
import AddJobModal from "@/components/AddJobModal";
import StatsTab from "@/components/StatsTab";
import SettingsTab from "@/components/SettingsTab";

type Tab = "jobs" | "stats" | "settings";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchJobs = useCallback(async () => {
    const res = await fetch("/api/jobs");
    if (res.ok) {
      const data = await res.json();
      setJobs(data);
    }
  }, []);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => {
        setAuthenticated(res.ok);
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) setJobs(data);
      });
  }, []);

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-backdrop">
        <p className="font-heading text-lg text-spa-copper">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginForm
        onSuccess={() => {
          setAuthenticated(true);
          fetchJobs();
        }}
      />
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "jobs", label: "Appointments" },
    { id: "stats", label: "Insights" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-page-backdrop">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col bg-spa-sidebar md:flex">
        <div className="border-b border-cream-50/10 px-6 py-8">
          <h1 className="font-heading text-2xl font-semibold tracking-wide text-cream">
            Lumière Spa
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-spa-copper">
            Client Experience
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-accent-sand text-cream"
                  : "text-cream-85 hover:bg-accent-sand/20 hover:text-cream"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-cream-50/10 p-4">
          <button
            onClick={async () => {
              await fetch("/api/auth", { method: "DELETE" });
              setAuthenticated(false);
            }}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-cream-50 transition-colors hover:text-cream"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile header + tabs */}
        <header className="border-b border-spa-sidebar/20 bg-spa-statcard px-4 py-5 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl font-semibold text-cream">
                Lumière Spa
              </h1>
              <p className="text-xs uppercase tracking-widest text-spa-copper">
                Client Experience
              </p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                setAuthenticated(false);
              }}
              className="text-xs text-cream-50"
            >
              Sign Out
            </button>
          </div>
          <nav className="mt-4 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-accent-sand text-cream"
                    : "bg-spa-sidebar text-cream-85"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === "jobs" && (
            <div className="space-y-8">
              <StatsCards jobs={jobs} />
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-medium text-ink">
                  All Appointments
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-copper"
                >
                  + Add Appointment
                </button>
              </div>
              <JobsTable jobs={jobs} onRefresh={fetchJobs} />
            </div>
          )}

          {activeTab === "stats" && <StatsTab jobs={jobs} />}

          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>

      <AddJobModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={fetchJobs}
      />
    </div>
  );
}
