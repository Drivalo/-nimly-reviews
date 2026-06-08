"use client";

import { useState } from "react";

interface CompleteJobButtonProps {
  jobId: string;
  onComplete: () => void;
}

export default function CompleteJobButton({
  jobId,
  onComplete,
}: CompleteJobButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      if (res.ok) onComplete();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="rounded-lg bg-spa-statcard px-3 py-1.5 text-xs font-medium text-cream transition-all hover:brightness-105 disabled:opacity-50"
    >
      {loading ? "..." : "Mark Complete"}
    </button>
  );
}
