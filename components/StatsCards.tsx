"use client";

import type { Job } from "@/lib/types";

interface StatsCardsProps {
  jobs: Job[];
}

export default function StatsCards({ jobs }: StatsCardsProps) {
  const total = jobs.length;
  const completed = jobs.filter((j) => j.status !== "pending").length;
  const fiveStar = jobs.filter((j) => j.rating === 5).length;
  const complaints = jobs.filter((j) => j.status === "complaint").length;

  const cards = [
    { label: "Total Appointments", value: total },
    { label: "Completed", value: completed },
    { label: "5-Star Ratings", value: fiveStar },
    { label: "Concerns Resolved", value: complaints },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wide text-spa-copper">
            {card.label}
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-cream">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
