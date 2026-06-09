"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";

interface CompleteJobButtonProps {
  jobId: string;
  onComplete: () => void;
}

export default function CompleteJobButton({
  jobId,
  onComplete,
}: CompleteJobButtonProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      });
  }, []);

  const consentRequired = settings?.consent_required ?? false;
  const canComplete = !consentRequired || consentGiven;

  async function handleComplete() {
    if (!canComplete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          consent_given: consentRequired ? consentGiven : false,
        }),
      });
      if (res.ok) onComplete();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {consentRequired && (
        <label className="flex items-start gap-2 text-xs text-ink">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5"
          />
          <span>Customer has given consent to receive SMS</span>
        </label>
      )}
      <button
        onClick={handleComplete}
        disabled={loading || !canComplete}
        className="rounded-lg bg-spa-statcard px-3 py-1.5 text-xs font-medium text-cream transition-all hover:brightness-105 disabled:opacity-50"
      >
        {loading ? "..." : "Mark Complete"}
      </button>
    </div>
  );
}
