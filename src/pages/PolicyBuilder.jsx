import { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldCheck, BookOpen, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Page from '../components/shared/Page';
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, Spinner } from '../components/shared';
import { listPolicies, savePolicy, deletePolicy } from '../utils/api';
import { useProject } from '../context/ProjectContext';

// pii_detected / injection_risk (Phase 2 of the regulatory policy model) are
// content/context signals rather than cost-style thresholds — pii_detected
// is 0 or 1 (use operator "=" with value 1), injection_risk is a 0-1 score
// like risk. Both only resolve once planning has run (null, so the rule is
// skipped, before that) — see IntentCentricPolicyEngine.resolveMetric().
const METRICS   = ['cost', 'latency', 'risk', 'pii_detected', 'injection_risk'];
const OPERATORS = ['>', '<', '='];
const ACTIONS   = ['REJECT', 'FALLBACK', 'RETRY'];

const NEW_RULE   = () => ({ id: uuidv4(), metric: 'cost', operator: '>', value: 0.01, action: 'REJECT' });
const NEW_POLICY = () => ({ name: '', rules: [NEW_RULE()] });

// ── Regulatory taxonomy (Phase 1 — organizational tagging only) ────────────
// country mirrors PiiJurisdiction's codes (US/UK/IN/EU/SG/AE/AU) so a later
// phase can connect this to a tenant's actual PII jurisdiction config
// without a second, incompatible vocabulary. CATEGORIES reuses the exact
// strings TEMPLATES below already use as tpl.category, so a policy created
// from a template is tagged consistently with the library it came from.
const COUNTRIES = [
  { value: '',    label: 'Not specified' },
  { value: 'US',  label: 'United States' },
  { value: 'UK',  label: 'United Kingdom' },
  { value: 'IN',  label: 'India' },
  { value: 'EU',  label: 'European Union' },
  { value: 'SG',  label: 'Singapore' },
  { value: 'AE',  label: 'UAE' },
  { value: 'AU',  label: 'Australia' },
];

const CATEGORIES = [
  'Cost control', 'Performance', 'Safety', 'Reliability',
  'PII / Data privacy', 'Healthcare / HIPAA', 'Financial services',
  'SOC 2', 'ISO 27001', 'GDPR', 'EU AI Act',
];

// Pipeline phase a policy's rules are evaluated at — see Guardrails.jsx for
// the full pipeline. Defaults to POST_EXECUTION (matches the backend's own
// default when phase is omitted — see PolicyService.applyRequest()).
const PHASES = [
  { value: 'PRE_SUBMISSION', label: 'Pre-submission' },
  { value: 'PRE_EXECUTION',  label: 'Pre-execution' },
  { value: 'POST_EXECUTION', label: 'Post-execution' },
];

// Which metrics never resolve at a given phase — cost/latency/risk need a
// completed ExecutionRecord (POST_EXECUTION only); pii_detected/
// injection_risk need Planning to have run (not PRE_SUBMISSION). See
// IntentCentricPolicyEngine.resolveMetric() — this mirrors it so the UI can
// warn before saving a rule that will silently never fire.
const PHASE_INCOMPATIBLE_METRICS = {
  PRE_SUBMISSION: ['cost', 'latency', 'risk', 'pii_detected', 'injection_risk'],
  PRE_EXECUTION:  ['cost', 'latency', 'risk'],
  POST_EXECUTION: [],
};

// ── Industry starter templates from product site ──────────────────────────────
// Phase 3 of the regulatory policy model: each template now carries country +
// subcategory (a specific citation) alongside category, tagging the policy it
// creates the same way — see handleTemplateSelect. This is content-authoring,
// not engineering: every rule still only checks what the DSL can check
// (cost/latency/risk/pii_detected/injection_risk thresholds), so a template
// named after a law is a proxy control aligned to that law's intent, not a
// certified implementation of it. Read each desc literally, not as a
// compliance claim.
const TEMPLATES = [
  {
    id: 'tpl-cost-limit',
    category: 'Cost control', country: '', subcategory: 'Budget governance',
    name: 'Cost limit enforcement',
    desc: 'Reject requests exceeding $0.10 per intent. Essential for production budget governance.',
    color: '#2563eb',
    rules: [{ id: uuidv4(), metric: 'cost', operator: '>', value: 0.10, action: 'REJECT' }],
  },
  {
    id: 'tpl-latency-fallback',
    category: 'Performance', country: '', subcategory: 'SLA enforcement',
    name: 'Latency fallback',
    desc: 'Automatically fall back to a faster adapter when latency exceeds 5 000ms.',
    color: '#d97706',
    rules: [{ id: uuidv4(), metric: 'latency', operator: '>', value: 5000, action: 'FALLBACK' }],
  },
  {
    id: 'tpl-high-risk-reject',
    category: 'Safety', country: '', subcategory: 'General risk threshold',
    name: 'High-risk rejection',
    desc: 'Block any execution where the risk score exceeds 0.7. Recommended for regulated industries.',
    color: '#ef4444',
    rules: [{ id: uuidv4(), metric: 'risk', operator: '>', value: 0.7, action: 'REJECT' }],
  },
  {
    id: 'tpl-healthcare',
    category: 'Healthcare / HIPAA', country: 'US', subcategory: 'HIPAA Privacy & Security Rule',
    name: 'PHI protection gate',
    desc: 'Rejects the moment PII/PHI is actually detected, plus high-risk or high-cost calls in healthcare contexts. HIPAA-aligned, not HIPAA-certified — see the Guardrails page for what pii_detected actually scans.',
    color: '#0d9488',
    rules: [
      { id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1,   action: 'REJECT' },
      { id: uuidv4(), metric: 'risk',         operator: '>', value: 0.5, action: 'REJECT' },
      { id: uuidv4(), metric: 'cost',         operator: '>', value: 0.05, action: 'REJECT' },
    ],
  },
  {
    id: 'tpl-finserv',
    category: 'Financial services', country: 'US', subcategory: 'Fair lending (ECOA-aligned)',
    name: 'Fair lending safeguard',
    desc: 'Retry on high-risk decisions and reject when cost exceeds credit-decision threshold. Adaptable to non-US fair-lending regimes — just retag the country.',
    color: '#7c3aed',
    rules: [
      { id: uuidv4(), metric: 'risk', operator: '>', value: 0.6,  action: 'RETRY' },
      { id: uuidv4(), metric: 'cost', operator: '>', value: 0.08, action: 'REJECT' },
    ],
  },
  {
    id: 'tpl-enterprise-retry',
    category: 'Reliability', country: '', subcategory: 'Availability / retry policy',
    name: 'Auto-retry on failure',
    desc: 'Retry low-cost failures automatically — improves success rate without breaking budget.',
    color: '#16a34a',
    rules: [
      { id: uuidv4(), metric: 'cost', operator: '<', value: 0.02, action: 'RETRY' },
      { id: uuidv4(), metric: 'risk', operator: '<', value: 0.3,  action: 'RETRY' },
    ],
  },
  {
    id: 'tpl-pii-exposure',
    category: 'PII / Data privacy', country: '', subcategory: 'General PII exposure (risk-based)',
    name: 'PII exposure gate',
    desc: 'Reject high-risk executions before personal data can leave the pipeline. A general-purpose guardrail for any flow that may touch PII.',
    color: '#0891b2',
    rules: [{ id: uuidv4(), metric: 'risk', operator: '>', value: 0.6, action: 'REJECT' }],
  },
  {
    id: 'tpl-pii-detected',
    category: 'PII / Data privacy', country: '', subcategory: 'Real-time detection (all jurisdictions)',
    name: 'Real-time PII detection gate',
    desc: 'Blocks the moment personal data is actually detected by the scan — not a risk-score approximation. Only fires once planning has run.',
    color: '#0e7490',
    rules: [{ id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1, action: 'REJECT' }],
  },
  {
    id: 'tpl-dpdp-india',
    category: 'PII / Data privacy', country: 'IN', subcategory: 'DPDP Act 2023 — consent & purpose limitation',
    name: 'DPDP Act personal-data gate',
    desc: 'Rejects on real-time PII detection (Aadhaar/PAN/etc., per the India pattern pack) rather than a proxy score — aligned to the DPDP Act’s consent/purpose-limitation intent, not a certified implementation of it.',
    color: '#0369a1',
    rules: [{ id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1, action: 'REJECT' }],
  },
  {
    id: 'tpl-uk-gdpr',
    category: 'GDPR', country: 'UK', subcategory: 'UK GDPR / Data Protection Act 2018',
    name: 'UK data protection gate',
    desc: 'Same data-minimization approach as the EU GDPR template below (real-time PII detection plus a cost cap), tagged for UK GDPR / DPA 2018 rather than the EU regulation.',
    color: '#155e75',
    rules: [
      { id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1,    action: 'REJECT' },
      { id: uuidv4(), metric: 'cost',         operator: '>', value: 0.05, action: 'REJECT' },
    ],
  },
  {
    id: 'tpl-pdpa-singapore',
    category: 'PII / Data privacy', country: 'SG', subcategory: 'PDPA — consent obligation',
    name: 'PDPA consent gate',
    desc: 'Rejects on real-time PII detection under Singapore’s pattern pack (NRIC/FIN), aligned to the PDPA’s consent-obligation intent.',
    color: '#0e7490',
    rules: [{ id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1, action: 'REJECT' }],
  },
  {
    id: 'tpl-pdpl-uae',
    category: 'PII / Data privacy', country: 'AE', subcategory: 'PDPL (Federal Decree-Law No. 45 of 2021)',
    name: 'UAE data processing gate',
    desc: 'Rejects on real-time PII detection under the UAE pattern pack (Emirates ID), aligned to the PDPL’s data-processing-principles intent.',
    color: '#164e63',
    rules: [{ id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1, action: 'REJECT' }],
  },
  {
    id: 'tpl-privacy-act-au',
    category: 'PII / Data privacy', country: 'AU', subcategory: 'Privacy Act 1988 — APP 11 (security)',
    name: 'Australian Privacy Principles gate',
    desc: 'Rejects on real-time PII detection under Australia’s pattern pack (TFN), aligned to APP 11’s security-of-personal-information intent.',
    color: '#0c4a6e',
    rules: [{ id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1, action: 'REJECT' }],
  },
  {
    id: 'tpl-soc2',
    category: 'SOC 2', country: 'US', subcategory: 'CC7 — System Monitoring',
    name: 'Change-control cost ceiling',
    desc: 'Retries transient cost spikes and blocks executions past your latency SLA — gives auditors a bounded, observable trail for SOC 2 CC7 monitoring evidence.',
    color: '#475569',
    rules: [
      { id: uuidv4(), metric: 'cost',    operator: '>', value: 0.15, action: 'RETRY' },
      { id: uuidv4(), metric: 'latency', operator: '>', value: 8000, action: 'REJECT' },
    ],
  },
  {
    id: 'tpl-iso27001',
    category: 'ISO 27001', country: '', subcategory: 'Annex A.9 — Access control',
    name: 'Information security guardrail',
    desc: 'Rejects high-risk executions in line with ISO 27001 Annex A access-control and risk-treatment requirements. International standard — not tied to one country.',
    color: '#9333ea',
    rules: [{ id: uuidv4(), metric: 'risk', operator: '>', value: 0.5, action: 'REJECT' }],
  },
  {
    id: 'tpl-gdpr',
    category: 'GDPR', country: 'EU', subcategory: 'Article 5 & 25 — data minimization by design',
    name: 'Data minimization gate',
    desc: 'Rejects on real-time PII detection plus a cost cap, keeping AI-driven personal-data processing bounded and reviewable under GDPR Art. 5 & 25.',
    color: '#065f46',
    rules: [
      { id: uuidv4(), metric: 'pii_detected', operator: '=', value: 1,    action: 'REJECT' },
      { id: uuidv4(), metric: 'cost',         operator: '>', value: 0.05, action: 'REJECT' },
    ],
  },
  {
    id: 'tpl-eu-ai-act',
    category: 'EU AI Act', country: 'EU', subcategory: 'Article 9 — risk management system',
    name: 'High-risk system gate',
    desc: 'For AI systems classified high-risk under the EU AI Act — rejects on elevated risk score, actual injection detection, and retries on cost overrun, supporting Article 9 risk-management obligations.',
    color: '#c026d3',
    rules: [
      { id: uuidv4(), metric: 'risk',           operator: '>', value: 0.4,  action: 'REJECT' },
      { id: uuidv4(), metric: 'injection_risk', operator: '>', value: 0.5,  action: 'REJECT' },
      { id: uuidv4(), metric: 'cost',           operator: '>', value: 0.10, action: 'RETRY' },
    ],
  },
];

// ── Template library modal ────────────────────────────────────────────────────
function TemplateLibrary({ onSelect, onClose }) {
  const categories = [...new Set(TEMPLATES.map(t => t.category))];
  // Only countries an actual template uses — "All" plus whichever of
  // COUNTRIES' codes appear in TEMPLATES, in COUNTRIES' own order.
  const countryCodes = new Set(TEMPLATES.map(t => t.country).filter(Boolean));
  const countryOptions = COUNTRIES.filter(c => countryCodes.has(c.value));

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCountry, setActiveCountry]   = useState('All');

  const filtered = TEMPLATES.filter(t =>
    (activeCategory === 'All' || t.category === activeCategory) &&
    (activeCountry  === 'All' || t.country  === activeCountry)
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">Policy template library</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {/* Category filter */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex gap-2 flex-wrap shrink-0">
          {['All', ...categories].map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Country filter */}
        <div className="px-5 pt-2 pb-3 border-b border-slate-100 flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Country</span>
          {['All', ...countryOptions.map(c => c.value)].map(code => (
            <button key={code || 'all'}
              onClick={() => setActiveCountry(code)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCountry === code ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {code === 'All' ? 'All' : countryOptions.find(c => c.value === code)?.label}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(tpl => (
            <button key={tpl.id}
              onClick={() => { onSelect(tpl); onClose(); }}
              className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${tpl.color}18`, color: tpl.color }}>
                    {tpl.category}
                  </span>
                  {tpl.country && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      {COUNTRIES.find(c => c.value === tpl.country)?.label ?? tpl.country}
                    </span>
                  )}
                </div>
                <Plus size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">{tpl.name}</p>
              {tpl.subcategory && (
                <p className="text-[11px] text-slate-400 font-medium mb-1">{tpl.subcategory}</p>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {tpl.rules.map((r, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {r.metric} {r.operator} {r.value} → {r.action}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Rule row ──────────────────────────────────────────────────────────────────
function RuleRow({ rule, onChange, onDelete }) {
  const sel = (key, opts) => (
    <select value={rule[key]} onChange={e => onChange({ ...rule, [key]: e.target.value })}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sel('metric',   METRICS)}
      {sel('operator', OPERATORS)}
      <input type="number" step="0.001" value={rule.value}
        onChange={e => onChange({ ...rule, value: parseFloat(e.target.value) })}
        className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      <span className="text-xs text-slate-400">→</span>
      {sel('action', ACTIONS)}
      <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-auto">
        <Trash2 size={13}/>
      </button>
    </div>
  );
}

// ── Policy card ───────────────────────────────────────────────────────────────
function PolicyCard({ policy, projects, onSave, onDelete }) {
  const [form, setForm]     = useState({
    ...policy,
    scope: policy.scope ?? 'TENANT',
    projectId: policy.projectId ?? null,
    phase: policy.phase ?? 'POST_EXECUTION',
    rules: [...(policy.rules ?? [])],
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty]   = useState(false);

  const incompatibleMetrics = [...new Set(
    form.rules
      .filter(r => PHASE_INCOMPATIBLE_METRICS[form.phase]?.includes(r.metric))
      .map(r => r.metric)
  )];

  function updateRule(id, updated) { setForm(f => ({ ...f, rules: f.rules.map(r => r.id === id ? updated : r) })); setDirty(true); }
  function addRule()               { setForm(f => ({ ...f, rules: [...f.rules, NEW_RULE()] })); setDirty(true); }
  function removeRule(id)          { setForm(f => ({ ...f, rules: f.rules.filter(r => r.id !== id) })); setDirty(true); }

  function updateScope(value) {
    // '' = organization-wide (TENANT, no project); anything else is a project id.
    setForm(f => ({ ...f, scope: value ? 'PROJECT' : 'TENANT', projectId: value || null }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(form); setDirty(false); }
    finally { setSaving(false); }
  }

  const scopeLabel = form.scope === 'PROJECT'
      ? (projects.find(p => p.id === form.projectId)?.name ?? 'Project')
      : 'Organization-wide';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setDirty(true); }}
            placeholder="Policy name…"
            className="text-sm font-semibold text-slate-800 bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 pb-0.5"/>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
            form.scope === 'PROJECT' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {scopeLabel}
          </span>
          {form.category && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-blue-50 text-blue-700">
              {form.category}
            </span>
          )}
          {form.country && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-amber-50 text-amber-700">
              {COUNTRIES.find(c => c.value === form.country)?.label ?? form.country}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {dirty && <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>}
          <Button variant="ghost" size="sm" onClick={() => onDelete(policy.policyId)}>
            <Trash2 size={13}/>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Applies to</label>
            <select value={form.scope === 'PROJECT' ? (form.projectId ?? '') : ''}
              onChange={e => updateScope(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Organization-wide — every project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} only</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Runs at</label>
            <select value={form.phase}
              onChange={e => { setForm(f => ({ ...f, phase: e.target.value })); setDirty(true); }}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Country</label>
            <select value={form.country ?? ''}
              onChange={e => { setForm(f => ({ ...f, country: e.target.value || null })); setDirty(true); }}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
            <select value={form.category ?? ''}
              onChange={e => { setForm(f => ({ ...f, category: e.target.value || null })); setDirty(true); }}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Uncategorized</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Subcategory</label>
            <input value={form.subcategory ?? ''}
              onChange={e => { setForm(f => ({ ...f, subcategory: e.target.value })); setDirty(true); }}
              placeholder="e.g. Right to erasure"
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>

        {incompatibleMetrics.length > 0 && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            {incompatibleMetrics.join(', ')} {incompatibleMetrics.length > 1 ? "don't" : "doesn't"} resolve at{' '}
            {PHASES.find(p => p.value === form.phase)?.label.toLowerCase()} — {incompatibleMetrics.some(m => ['cost', 'latency', 'risk'].includes(m))
              ? 'these need a completed execution.'
              : 'these need planning to have run first.'}{' '}
            This rule will never fire until you change the phase or the metric.
          </div>
        )}

        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Rules (all apply)</p>
        {form.rules.map(r => (
          <RuleRow key={r.id} rule={r} onChange={u => updateRule(r.id, u)} onDelete={() => removeRule(r.id)}/>
        ))}
        <button onClick={addRule} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1">
          <Plus size={12}/> Add rule
        </button>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PolicyBuilder({ keycloak }) {
  const [policies, setPolicies]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCountry, setFilterCountry]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { projects } = useProject();
  // 'proj-default' is ProjectContext's placeholder before the real list loads —
  // never a selectable project (same guard Adapters.jsx uses).
  const realProjects = (projects ?? []).filter(p => p.id !== 'proj-default');

  async function load() {
    try { const d = await listPolicies(keycloak); setPolicies(d ?? []); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [keycloak]);

  const filteredPolicies = policies.filter(p =>
    (!filterCountry  || p.country  === filterCountry) &&
    (!filterCategory || p.category === filterCategory)
  );
  const hasFilters = filterCountry || filterCategory;

  async function handleSave(policy) { await savePolicy(keycloak, policy); load(); }
  async function handleDelete(id)   {
    if (!id) { load(); return; }
    await deletePolicy(keycloak, id); load();
  }

  function handleAdd() {
    setPolicies(p => [{ policyId: null, ...NEW_POLICY() }, ...p]);
  }

  function handleTemplateSelect(tpl) {
    setPolicies(p => [{
      policyId: null,
      name: tpl.name,
      category: tpl.category,
      country: tpl.country || null,
      subcategory: tpl.subcategory || null,
      rules: tpl.rules.map(r => ({ ...r, id: uuidv4() })),
    }, ...p]);
  }

  return (
    <Page title="Policy Builder" subtitle="Define rules that govern intent execution"
      action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowTemplates(true)}>
            <BookOpen size={14}/> Templates
          </Button>
          <Button onClick={handleAdd}><Plus size={14}/> New policy</Button>
        </div>
      }>

      {/* Template library info banner — shown when empty */}
      {!loading && policies.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <BookOpen size={16} className="text-blue-600 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">Start from a template</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Pick from industry-specific policy templates for Healthcare, Financial Services, Cost Control, and more —
              or build from scratch with the Policy Builder.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowTemplates(true)}>Browse templates</Button>
        </div>
      )}

      {!loading && policies.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All countries</option>
            {COUNTRIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setFilterCountry(''); setFilterCategory(''); }}
              className="text-xs text-slate-400 hover:text-slate-600">
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8"/></div>
      ) : policies.length === 0 ? (
        <Card>
          <EmptyState icon={<ShieldCheck size={22}/>} title="No policies"
            description="Create a policy to enforce cost, latency, and risk rules on every execution"
            action={
              <div className="flex gap-2 justify-center">
                <Button variant="secondary" onClick={() => setShowTemplates(true)}><BookOpen size={14}/> Browse templates</Button>
                <Button onClick={handleAdd}><Plus size={14}/> New policy</Button>
              </div>
            }/>
        </Card>
      ) : filteredPolicies.length === 0 ? (
        <Card>
          <EmptyState icon={<ShieldCheck size={22}/>} title="No policies match these filters"
            description="Try a different country or category, or clear the filters."
            action={<Button variant="secondary" onClick={() => { setFilterCountry(''); setFilterCategory(''); }}>Clear filters</Button>}/>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPolicies.map((p, i) => (
            <PolicyCard key={p.policyId ?? i} policy={p} projects={realProjects} onSave={handleSave} onDelete={handleDelete}/>
          ))}
        </div>
      )}

      {showTemplates && (
        <TemplateLibrary onSelect={handleTemplateSelect} onClose={() => setShowTemplates(false)}/>
      )}
    </Page>
  );
}
