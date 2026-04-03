'use client';

import { FormEvent, useState } from 'react';
import { Save } from 'lucide-react';
import { ACADEMY_API_URL } from '@/lib/public-config';

type ThemeSettingsFormProps = {
  initialValues: {
    serviceName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
  };
};

type UpdateThemeResponse = {
  success?: boolean;
  theme?: {
    serviceName?: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    fontFamily?: string | null;
    fontSize?: string | null;
  };
  error?: {
    message?: string;
  };
};

export default function ThemeSettingsForm({ initialValues }: ThemeSettingsFormProps) {
  const [serviceName, setServiceName] = useState(initialValues.serviceName);
  const [logoUrl, setLogoUrl] = useState(initialValues.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialValues.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialValues.secondaryColor);
  const [fontFamily, setFontFamily] = useState(initialValues.fontFamily);
  const [fontSize, setFontSize] = useState(initialValues.fontSize);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`${ACADEMY_API_URL}/organizations/active/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName,
          logoUrl: logoUrl || null,
          primaryColor,
          secondaryColor,
          fontFamily,
          fontSize,
        }),
      });

      const data = (await response.json()) as UpdateThemeResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message ?? 'Failed to update theme settings');
      }

      document.body.style.setProperty('--brand-primary', primaryColor);
      document.body.style.setProperty('--brand-secondary', secondaryColor);
      document.body.style.setProperty('--brand-font-family', fontFamily);
      document.body.style.setProperty('--brand-font-size', fontSize);

      setStatus('Theme settings saved successfully.');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="surface-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] surface-muted">
          <h2 className="text-lg font-semibold">Branding Controls</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Saved values are immediately applied to navigation, cards, buttons, and page typography.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="field-input"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              className="field-input"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-10 w-12 rounded-lg border border-[var(--border)] bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="field-input font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(event) => setSecondaryColor(event.target.value)}
                className="h-10 w-12 rounded-lg border border-[var(--border)] bg-transparent"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(event) => setSecondaryColor(event.target.value)}
                className="field-input font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <input
              type="text"
              value={fontFamily}
              onChange={(event) => setFontFamily(event.target.value)}
              className="field-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Base Font Size</label>
            <input
              type="text"
              value={fontSize}
              onChange={(event) => setFontSize(event.target.value)}
              className="field-input"
              placeholder="16px"
            />
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <p className="chip mb-3">Live Preview</p>
        <div
          className="rounded-xl p-5 border border-[var(--border)]"
          style={{
            background: `linear-gradient(145deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <p
            className="text-white text-xl font-semibold"
            style={{
              fontFamily,
              fontSize,
            }}
          >
            {serviceName || 'Academy Service Name'}
          </p>
          <p className="text-white/85 mt-1 text-sm">
            Preview of primary/secondary colors and typography values from your organization settings.
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{status}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="btn-primary px-5 py-2.5 disabled:opacity-70"
      >
        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Theme Settings'}
      </button>
    </form>
  );
}
