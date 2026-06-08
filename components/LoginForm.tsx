"use client";

import { useState } from "react";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onSuccess();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-spa-backdrop p-4">
      <div className="w-full max-w-sm stat-card p-10">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-wide text-spa-copper">
            Lumière Spa
          </h1>
          <div className="mx-auto mt-3 h-px w-12 bg-spa-copper" />
          <p className="mt-3 text-sm uppercase tracking-widest text-cream-50">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="input-field-dark"
            />
          </div>

          {error && (
            <p className="text-sm text-badge-concern-text">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-copper w-full">
            {loading ? "Signing in..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
