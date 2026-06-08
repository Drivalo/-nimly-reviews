"use client";

import { useEffect, useState } from "react";
import type { SmsLog } from "@/lib/types";

interface SmsLogModalProps {
  jobId: string | null;
  customerName: string;
  onClose: () => void;
}

export default function SmsLogModal({
  jobId,
  customerName,
  onClose,
}: SmsLogModalProps) {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetch(`/api/sms-log?jobId=${jobId}`)
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (!jobId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col stat-card">
        <div className="flex items-center justify-between border-b border-cream-50/10 px-6 py-5">
          <h2 className="font-heading text-xl font-medium text-spa-copper">
            Messages — {customerName}
          </h2>
          <button
            onClick={onClose}
            className="text-cream-50 transition-colors hover:text-cream"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-cream-50">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-cream-50">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-xl p-4 text-sm ${
                    log.direction === "outbound"
                      ? "ml-6 bg-spa-sidebar/60"
                      : "mr-6 bg-spa-row"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs text-ink-60">
                    <span className="font-medium uppercase tracking-wide">
                      {log.direction === "outbound" ? "Sent" : "Received"}
                    </span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-cream-85">
                    {log.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
