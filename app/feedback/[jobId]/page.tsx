"use client";

import { use, useState } from "react";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: feedback.trim() }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-spa-backdrop p-4">
        <div className="w-full max-w-md stat-card p-10 text-center">
          <div className="mx-auto mb-5 h-px w-12 bg-spa-copper" />
          <h1 className="font-heading text-2xl font-medium text-spa-copper">
            Thank you
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cream-85">
            Your feedback has been received with care. We&apos;ll be in touch
            shortly to make things right.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-spa-backdrop p-4">
      <div className="w-full max-w-md stat-card p-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full bg-badge-concern px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-badge-concern-text">
            We want to make this right
          </div>
          <h1 className="font-heading text-2xl font-medium text-spa-copper">
            Share your experience
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cream-85">
            We&apos;re sorry your visit wasn&apos;t what you hoped for. Please
            tell us what happened so we can address it personally.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-spa-copper">
              What could we have done better?
            </label>
            <textarea
              required
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="input-field-dark"
            />
          </div>

          {error && <p className="text-sm text-badge-concern-text">{error}</p>}

          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            className="btn-copper w-full"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
