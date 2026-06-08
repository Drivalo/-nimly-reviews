"use client";

import type { Job } from "@/lib/types";

interface StatsTabProps {
  jobs: Job[];
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function StatsTab({ jobs }: StatsTabProps) {
  const weekStart = getWeekStart();

  const thisWeek = jobs.filter(
    (j) => j.completed_at && new Date(j.completed_at) >= weekStart
  );

  const weekCompleted = thisWeek.length;
  const weekSmsSent = jobs.filter(
    (j) =>
      j.review_requested_at &&
      new Date(j.review_requested_at) >= weekStart
  ).length;
  const weekHighRatings = jobs.filter(
    (j) =>
      j.rating &&
      j.rating >= 4 &&
      j.rating_received_at &&
      new Date(j.rating_received_at) >= weekStart
  ).length;
  const weekComplaints = jobs.filter(
    (j) =>
      j.status === "complaint" &&
      j.rating_received_at &&
      new Date(j.rating_received_at) >= weekStart
  ).length;

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: jobs.filter((j) => j.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const recentActivity = jobs
    .filter((j) => j.rating_received_at || j.completed_at || j.review_requested_at)
    .sort((a, b) => {
      const dateA = new Date(
        a.rating_received_at ?? a.review_requested_at ?? a.completed_at ?? a.created_at
      );
      const dateB = new Date(
        b.rating_received_at ?? b.review_requested_at ?? b.completed_at ?? b.created_at
      );
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  function activityLabel(job: Job): string {
    if (job.rating_received_at && job.rating) {
      if (job.rating >= 4)
        return `${job.rating}-star rating from ${job.customer_name}`;
      return `Concern raised by ${job.customer_name} (${job.rating} stars)`;
    }
    if (job.review_requested_at && job.status === "sms_sent") {
      return `Follow-up sent to ${job.customer_name}`;
    }
    if (job.completed_at) {
      return `Appointment completed for ${job.customer_name}`;
    }
    return `New appointment: ${job.customer_name}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-heading text-xl font-medium text-ink">
          This Week
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Appointments Completed", value: weekCompleted },
            { label: "Follow-ups Sent", value: weekSmsSent },
            { label: "4–5 Star Ratings", value: weekHighRatings },
            { label: "Concerns Intercepted", value: weekComplaints },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-spa-copper">
                {item.label}
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold text-cream">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-heading text-xl font-medium text-ink">
          Rating Distribution
        </h3>
        <div className="panel-card space-y-4">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-4">
              <span className="w-14 font-heading text-sm text-spa-copper">
                {star} ★
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-spa-sidebar/50">
                <div
                  className={`h-full rounded-full transition-all ${
                    star >= 4
                      ? "bg-spa-copper"
                      : star === 3
                        ? "bg-badge-sms"
                        : "bg-badge-concern"
                  }`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-sm text-cream-50">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-heading text-xl font-medium text-ink">
          Recent Activity
        </h3>
        <div className="panel-card divide-y divide-cream-50/10">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-cream-50">No activity yet.</p>
          ) : (
            recentActivity.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between py-4 text-sm first:pt-0 last:pb-0"
              >
                <span className="text-cream-85">{activityLabel(job)}</span>
                <span className="text-xs text-cream-50">
                  {new Date(
                    job.rating_received_at ??
                      job.review_requested_at ??
                      job.completed_at ??
                      job.created_at
                  ).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
