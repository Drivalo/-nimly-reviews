"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import CompleteJobButton from "./CompleteJobButton";
import SmsLogModal from "./SmsLogModal";

interface JobsTableProps {
  jobs: Job[];
  onRefresh: () => void;
}

export const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "status-badge status-pending" },
  complete: { label: "Complete", className: "status-badge status-complete" },
  sms_sent: { label: "SMS Sent", className: "status-badge status-sms_sent" },
  rated: { label: "Rated", className: "status-badge status-rated" },
  review_received: {
    label: "Rating Received",
    className: "status-badge status-review_received",
  },
  reviewed: { label: "Reviewed", className: "status-badge status-reviewed" },
  concern: { label: "Concern", className: "status-badge status-concern" },
  complaint: { label: "Concern", className: "status-badge status-complaint" },
};

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
  { value: "sms_sent", label: "SMS Sent" },
  { value: "rated", label: "Rated" },
  { value: "review_received", label: "Rating Received" },
  { value: "reviewed", label: "Reviewed" },
  { value: "concern", label: "Concern" },
];

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_STYLES[status] ?? {
    label: status,
    className: "status-badge status-pending",
  };

  return <span className={config.className}>{config.label}</span>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function JobsTable({ jobs, onRefresh }: JobsTableProps) {
  const [smsJob, setSmsJob] = useState<{ id: string; name: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredJobs =
    statusFilter === "all"
      ? jobs
      : statusFilter === "concern"
        ? jobs.filter(
            (job) => job.status === "concern" || job.status === "complaint"
          )
        : jobs.filter((job) => job.status === statusFilter);

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl bg-table-row p-6 text-center">
        <p className="font-heading text-lg text-ink">
          No appointments yet
        </p>
        <p className="mt-2 text-sm text-ink">
          Add your first client appointment to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === option.value
                ? "bg-accent-sand text-cream"
                : "bg-table-row text-ink hover:bg-accent-sand/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-xl bg-table-row p-6 text-center">
          <p className="font-heading text-lg text-ink">No matching appointments</p>
          <p className="mt-2 text-sm text-ink">
            Try a different status filter.
          </p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-[12px]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[26%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="bg-spa-sidebar text-left text-xs font-medium uppercase tracking-wide text-cream">
              <th className="px-4 py-3 font-body">Client</th>
              <th className="px-4 py-3 font-body">Treatment</th>
              <th className="px-4 py-3 font-body">Status</th>
              <th className="px-4 py-3 font-body">Rating</th>
              <th className="px-4 py-3 font-body">Date</th>
              <th className="px-4 py-3 font-body">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="border-b border-white/40 bg-table-row last:border-b-0">
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-ink">{job.customer_name}</p>
                  <p className="text-xs text-ink-60">{job.customer_phone}</p>
                </td>
                <td className="px-4 py-3 align-middle text-black">
                  <span className="line-clamp-2">{job.job_description ?? "—"}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-4 py-3 align-middle text-ink">
                  {job.rating ? "★".repeat(job.rating) : "—"}
                </td>
                <td className="px-4 py-3 align-middle text-black">
                  {formatDate(job.created_at)}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-wrap gap-2">
                    {job.status === "pending" && (
                      <CompleteJobButton jobId={job.id} onComplete={onRefresh} />
                    )}
                    <button
                      onClick={() =>
                        setSmsJob({ id: job.id, name: job.customer_name })
                      }
                      className="btn-outline !px-3 !py-1.5 !text-xs"
                    >
                      Messages
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      )}

      <SmsLogModal
        jobId={smsJob?.id ?? null}
        customerName={smsJob?.name ?? ""}
        onClose={() => setSmsJob(null)}
      />
    </>
  );
}
