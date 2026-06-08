"use client";

import { useState } from "react";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddJobModal({ open, onClose, onAdded }: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    job_description: "",
    job_value: "",
  });

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          job_description: "",
          job_value: "",
        });
        onAdded();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md stat-card p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-medium text-spa-copper">
            New Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-cream-50 transition-colors hover:text-cream"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Client Name *
            </label>
            <input
              required
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="input-field-dark"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Phone *
            </label>
            <input
              required
              type="tel"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              placeholder="+61 400 000 000"
              className="input-field-dark"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Email
            </label>
            <input
              type="email"
              value={form.customer_email}
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              className="input-field-dark"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Treatment
            </label>
            <textarea
              value={form.job_description}
              onChange={(e) => setForm({ ...form, job_description: e.target.value })}
              rows={2}
              placeholder="e.g. Deep tissue massage, 60 min"
              className="input-field-dark"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Value ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.job_value}
              onChange={(e) => setForm({ ...form, job_value: e.target.value })}
              className="input-field-dark"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1 !text-cream-85 !border-cream-50/30 hover:!text-cream hover:!border-spa-copper">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-copper flex-1">
              {loading ? "Adding..." : "Add Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
