import { useState, useRef } from 'react';
import { Upload, Palette, Type, Check, RefreshCw, Eye } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/shared';
import { useBranding, DEFAULT_BRANDING } from '../context/BrandingContext';
import { request } from '../utils/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const PRESET_COLORS = [
  { name: 'Blue',    value: '#2563eb' },
  { name: 'Indigo',  value: '#4f46e5' },
  { name: 'Violet',  value: '#7c3aed' },
  { name: 'Teal',    value: '#0d9488' },
  { name: 'Green',   value: '#16a34a' },
  { name: 'Orange',  value: '#ea580c' },
  { name: 'Rose',    value: '#e11d48' },
  { name: 'Slate',   value: '#475569' },
];

// "Dark Trust + Neon Intelligence" palette — one entry per tenant-customizable
// field beyond primaryColor, driving both the new Cards below and every
// place `form`'s new fields need a matching key (save/reload/reset).
const SEMANTIC_FIELDS = [
  { key: 'secondaryColor',    label: 'Secondary',    hint: 'Deep slate — supporting UI chrome' },
  { key: 'aiAccentColor',     label: 'AI accent',     hint: 'Cyan — model/adapter activity' },
  { key: 'intelligenceColor', label: 'Intelligence',  hint: 'Purple — reasoning, analysis' },
];
const STAGE_FIELDS = [
  { key: 'governColor',   label: 'Govern',   hint: 'Policy checks, permissions' },
  { key: 'secureColor',   label: 'Secure',   hint: 'PII masking, data protection' },
  { key: 'optimizeColor', label: 'Optimize', hint: 'Cost/latency, adapter routing' },
  { key: 'proveColor',    label: 'Prove',    hint: 'Audit trail, evidence' },
];

// Preset + native-picker + hex-text trio, same interaction as the existing
// Primary colour card below — factored out so 7 new fields don't mean 7
// copies of that JSX. `onSelect` commits immediately (swatch/native picker
// always yield a full valid hex); `onTypeChange` mirrors the existing
// free-typing behaviour (only commits once 6 valid hex chars are typed, so
// the input doesn't fight the user mid-keystroke).
function ColorField({ label, hint, value, onSelect, onTypeChange }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      {hint && <p className="text-2xs text-slate-400 mb-1.5">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onSelect(e.target.value)}
          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onTypeChange(e.target.value)}
          maxLength={7}
          className="w-24 text-xs font-mono border border-slate-200 rounded-lg px-2 py-1.5
            focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <div className="w-8 h-8 rounded-lg border border-slate-100 shrink-0" style={{ background: value }} />
      </div>
    </div>
  );
}

export default function OrgBranding({ keycloak }) {
  const { branding, updateBranding } = useBranding();

  const [form, setForm]         = useState({
    orgName:      branding.orgName,
    primaryColor: branding.primaryColor,
    logoUrl:      branding.logoUrl,
    secondaryColor:    branding.secondaryColor,
    aiAccentColor:     branding.aiAccentColor,
    intelligenceColor: branding.intelligenceColor,
    governColor:       branding.governColor,
    secureColor:       branding.secureColor,
    optimizeColor:     branding.optimizeColor,
    proveColor:        branding.proveColor,
  });
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(branding.logoUrl);
  const fileRef = useRef(null);

  // ── Logo upload ─────────────────────────────────────────────────────────────
  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2 MB'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`${API_BASE}/org/branding/logo`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${keycloak?.token}` },
        body:    formData,
      });
      const url = res.ok
        ? ((await res.json().catch(() => null))?.logoUrl ?? URL.createObjectURL(file))
        : URL.createObjectURL(file);
      setPreview(url);
      setForm(f => ({ ...f, logoUrl: url }));
    } catch {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setForm(f => ({ ...f, logoUrl: url }));
    } finally {
      setUploading(false);
    }
  }

  // ── Color selection — live preview only ─────────────────────────────────────
  function handleColorSelect(color) {
    setForm(f => ({ ...f, primaryColor: color }));
    updateBranding({ primaryColor: color }); // instant DOM preview
  }

  // Same instant-preview pattern as handleColorSelect, generalized to any of
  // the 7 new semantic/stage fields by key instead of one hardcoded field.
  function handleFieldSelect(field, color) {
    setForm(f => ({ ...f, [field]: color }));
    updateBranding({ [field]: color });
  }
  function handleFieldType(field, val) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) handleFieldSelect(field, val);
    else setForm(f => ({ ...f, [field]: val })); // let the input hold an in-progress hex while typing
  }

  // ── Reload branding from backend and apply to DOM ───────────────────────────
  // Called after every successful save to confirm what was persisted
  // and apply the exact values returned by the backend.
  async function reloadBrandingFromBackend() {
    try {
      await keycloak.updateToken(30).catch(() => {});

      const res = await fetch(`${API_BASE}/org/branding`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type':  'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[Branding] reloaded after save:', JSON.stringify(data));

        // Normalize — handles both camelCase and snake_case from backend
        const normalized = {
          primaryColor:      data.primaryColor      ?? data.primary_color      ?? form.primaryColor,
          orgName:           data.orgName           ?? data.org_name           ?? form.orgName,
          logoUrl:           data.logoUrl           ?? data.logo_url           ?? null,
          favicon:           data.favicon           ?? null,
          secondaryColor:    data.secondaryColor    ?? data.secondary_color    ?? form.secondaryColor,
          aiAccentColor:     data.aiAccentColor     ?? data.ai_accent_color    ?? form.aiAccentColor,
          intelligenceColor: data.intelligenceColor ?? data.intelligence_color ?? form.intelligenceColor,
          governColor:       data.governColor       ?? data.govern_color      ?? form.governColor,
          secureColor:       data.secureColor       ?? data.secure_color      ?? form.secureColor,
          optimizeColor:     data.optimizeColor     ?? data.optimize_color    ?? form.optimizeColor,
          proveColor:        data.proveColor        ?? data.prove_color      ?? form.proveColor,
        };

        // Update context + apply to DOM
        updateBranding(normalized);

        // Sync local form state with what backend confirmed
        setForm(f => ({ ...f, ...normalized }));
      } else {
        console.error('[Branding] reload after save failed: HTTP', res.status);
      }
    } catch (err) {
      console.error('[Branding] reload exception:', err.message);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      // PATCH to save
      await request(keycloak, '/org/branding', {
        method: 'PATCH',
        body:   JSON.stringify(form),
      });

      // ── GET to reload saved data and apply to DOM ─────────────────────────
      // Without this, the color is only applied locally from form state.
      // After reload the page it would not persist because BrandingContext
      // GET happens on mount — before the save. Reloading here ensures the
      // backend-confirmed values are applied immediately after save.
      await reloadBrandingFromBackend();

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

    } catch (err) {
      const msg = err?.message || 'Failed to save branding';
      setError(msg);
      console.error('[OrgBranding] save failed:', msg);
      // Revert to last saved branding on failure
      updateBranding(branding);
      setForm({
        orgName:      branding.orgName,
        primaryColor: branding.primaryColor,
        logoUrl:      branding.logoUrl,
        secondaryColor:    branding.secondaryColor,
        aiAccentColor:     branding.aiAccentColor,
        intelligenceColor: branding.intelligenceColor,
        governColor:       branding.governColor,
        secureColor:       branding.secureColor,
        optimizeColor:     branding.optimizeColor,
        proveColor:        branding.proveColor,
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  // Was a second, independent hardcoded copy of the defaults (orgName/
  // primaryColor/logoUrl only) — now sourced from DEFAULT_BRANDING directly
  // so the 7 new fields don't need a third place to keep in sync, and so
  // this can never drift from what BrandingContext actually falls back to.
  function handleReset() {
    const defaults = { ...DEFAULT_BRANDING };
    setForm(defaults);
    setPreview(null);
    updateBranding(defaults);
  }

  const initial = form.orgName?.[0]?.toUpperCase() ?? 'D';

  return (
    <Page title="Organisation branding" subtitle="Customise how your organisation appears in the control plane">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Settings ───────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Logo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload size={13} className="text-slate-400" />
                <CardTitle>Organisation logo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                  {preview
                    ? <img src={preview} alt="Logo" className="w-full h-full object-contain" />
                    : <span className="text-2xl font-bold text-slate-400">{initial}</span>
                  }
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                    <Upload size={13} /> {preview ? 'Change logo' : 'Upload logo'}
                  </Button>
                  {preview && (
                    <button
                      onClick={() => { setPreview(null); setForm(f => ({ ...f, logoUrl: null })); }}
                      className="block text-xs text-red-500 hover:text-red-700"
                    >
                      Remove logo
                    </button>
                  )}
                  <p className="text-xs text-slate-400">PNG, SVG, or JPG — max 2 MB. Recommended: 128×128px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display name */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Type size={13} className="text-slate-400" />
                <CardTitle>Organisation name</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">Display name</label>
                <input
                  value={form.orgName}
                  onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))}
                  placeholder="Acme Corporation"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400">Shown in the sidebar header and browser tab title</p>
              </div>
            </CardContent>
          </Card>

          {/* Brand colour */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-slate-400" />
                <CardTitle>Primary colour</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-3">Preset colours</p>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(({ name, value }) => (
                    <button
                      key={value}
                      title={name}
                      onClick={() => handleColorSelect(value)}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110
                        focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: value }}
                    >
                      {form.primaryColor === value && (
                        <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Custom colour</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={e => handleColorSelect(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{6}$/.test(val)) handleColorSelect(val);
                      else setForm(f => ({ ...f, primaryColor: val }));
                    }}
                    placeholder="#2563eb"
                    maxLength={7}
                    className="w-28 text-sm font-mono border border-slate-200 rounded-lg px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <div className="flex-1 h-8 rounded-lg border border-slate-100"
                    style={{ background: form.primaryColor }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary & accent colours */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-slate-400" />
                <CardTitle>Secondary &amp; accent colours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SEMANTIC_FIELDS.map(({ key, label, hint }) => (
                  <ColorField
                    key={key}
                    label={label}
                    hint={hint}
                    value={form[key]}
                    onSelect={c => handleFieldSelect(key, c)}
                    onTypeChange={v => handleFieldType(key, v)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline stage colours */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-slate-400" />
                <CardTitle>Pipeline stage colours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STAGE_FIELDS.map(({ key, label, hint }) => (
                  <ColorField
                    key={key}
                    label={label}
                    hint={hint}
                    value={form[key]}
                    onSelect={c => handleFieldSelect(key, c)}
                    onTypeChange={v => handleFieldType(key, v)}
                  />
                ))}
                {/* Kill switch is deliberately fixed, not part of `form` or
                    BrandingRequest at all — see index.css's --stage-kill
                    comment for why this stays red regardless of branding. */}
                <div>
                  <p className="text-xs font-medium text-slate-600">Kill switch</p>
                  <p className="text-2xs text-slate-400 mb-1.5">Fixed for safety — not customisable</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ background: 'var(--stage-kill)' }} />
                    <span className="text-xs font-mono text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#EF4444</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button loading={saving} onClick={handleSave}>
              {saved ? <><Check size={13} /> Saved</> : 'Save branding'}
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <RefreshCw size={13} /> Reset to defaults
            </Button>
          </div>
        </div>

        {/* ── Live preview ────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Eye size={12} /> Live preview
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex h-64" style={{ background: '#f8fafc' }}>
              <div className="w-40 bg-white border-r border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ backgroundColor: form.primaryColor }}>
                    {preview
                      ? <img src={preview} className="w-full h-full object-contain" alt="" />
                      : <span className="text-white text-[10px] font-bold">{initial}</span>
                    }
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {form.orgName || 'Your Org'}
                  </span>
                </div>
                {['Dashboard', 'Intents', 'Adapters', 'Policies', 'Audit'].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 mx-1.5 px-2 py-1.5 rounded-md my-0.5"
                    style={i === 0 ? { backgroundColor: `${form.primaryColor}18` } : {}}>
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: i === 0 ? form.primaryColor : '#cbd5e1' }} />
                    <span className="text-[10px] font-medium"
                      style={{ color: i === 0 ? form.primaryColor : '#64748b' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-3 space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-700">Dashboard</span>
                  <div className="w-5 h-5 rounded-full shrink-0"
                    style={{ backgroundColor: form.primaryColor, opacity: 0.8 }} />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Intents', 'Cost', 'Success', 'Drift'].map(label => (
                    <div key={label} className="bg-white rounded-lg p-2 border border-slate-100">
                      <div className="w-4 h-1 rounded-full mb-1.5"
                        style={{ backgroundColor: form.primaryColor, opacity: 0.3 }} />
                      <div className="text-[10px] font-bold text-slate-700">—</div>
                      <div className="text-[9px] text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <div className="px-2 py-0.5 rounded text-[9px] font-semibold text-white"
                    style={{ backgroundColor: form.primaryColor }}>Primary</div>
                  <div className="px-2 py-0.5 rounded text-[9px] font-medium text-slate-600 border border-slate-200 bg-white">
                    Secondary</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-500">
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: form.primaryColor }} />
              Active nav highlight
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: form.primaryColor, opacity: 0.3 }} />
              Metric card accents
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: form.primaryColor, opacity: 0.15 }} />
              Focus rings, badges
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}
