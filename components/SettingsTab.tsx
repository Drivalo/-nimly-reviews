"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-ink-60">Loading settings...</p>;
  }

  if (!settings) {
    return <p className="text-sm text-badge-concern-text">Failed to load settings.</p>;
  }

  return (
    <div>
      <h2 className="mb-6 font-heading text-2xl font-medium text-ink">
        Spa Settings
      </h2>
      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
            Business Name
          </label>
          <input
            value={settings.business_name}
            onChange={(e) =>
              setSettings({ ...settings, business_name: e.target.value })
            }
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Owner Name
            </label>
            <input
              value={settings.owner_name}
              onChange={(e) =>
                setSettings({ ...settings, owner_name: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
              Owner Phone
            </label>
            <input
              type="tel"
              value={settings.owner_phone ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, owner_phone: e.target.value })
              }
              placeholder="+61 400 000 000"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
            Google Review Link
          </label>
          <input
            type="url"
            value={settings.google_review_link ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, google_review_link: e.target.value })
            }
            placeholder="https://g.page/r/..."
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
            SMS Delay (minutes)
          </label>
          <input
            type="number"
            min={1}
            value={settings.delay_minutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                delay_minutes: parseInt(e.target.value, 10) || 90,
              })
            }
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-spa-copper">
            Rating SMS Template
          </label>
          <p className="mb-2 text-xs text-ink-60">
            Variables: {"{{name}}"}, {"{{review_link}}"}. Leave blank to use the
            default template for your business type.
          </p>
          <textarea
            rows={5}
            value={settings.rating_sms_template}
            onChange={(e) =>
              setSettings({ ...settings, rating_sms_template: e.target.value })
            }
            className="input-field"
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-copper">
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm font-medium text-spa-copper">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
