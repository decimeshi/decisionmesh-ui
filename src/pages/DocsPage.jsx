import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Zap, KeyRound, Shield, BarChart3, ScrollText,
  Cpu, Puzzle, Users, ChevronRight, Copy, Check, ExternalLink,
  Search, Menu, X, Terminal, Code2, Globe, Lock, AlertCircle,
  Package, GitBranch, RefreshCw, FileText, ChevronDown,
} from 'lucide-react';

// ── Design tokens (matches dashboard CSS vars) ────────────────────────────────
const T = {
  bg:       'var(--content-bg, #f8fafc)',
  card:     'var(--card-bg, #ffffff)',
  border:   'var(--card-border, #e2e8f0)',
  brand:    'var(--brand, #2563eb)',
  text:     'var(--text-primary, #0f172a)',
  textSec:  'var(--text-secondary, #475569)',
  textMut:  'var(--text-muted, #94a3b8)',
  sidebar:  '#0f172a',
  sideText: '#94a3b8',
  sideAct:  '#60a5fa',
  sideActBg:'rgba(37,99,235,0.15)',
};

// ── Docs content structure ────────────────────────────────────────────────────
const BASE_URL = 'https://api.decimeshi.com';

const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    icon: Zap,
    items: [
      { id: 'introduction',   label: 'Introduction'        },
      { id: 'quickstart',     label: 'Quick Start'         },
      { id: 'authentication', label: 'Authentication'      },
      { id: 'errors',         label: 'Errors & Status Codes'},
      { id: 'sdks',           label: 'SDKs & Libraries'    },
    ],
  },
  {
    label: 'Core API',
    icon: Terminal,
    items: [
      { id: 'onboarding',     label: 'Onboarding'          },
      { id: 'intents',        label: 'Intents'             },
      { id: 'intent-library', label: 'Intent Library'      },
      { id: 'executions',     label: 'Executions'          },
      { id: 'policies',       label: 'Policies'            },
    ],
  },
  {
    label: 'Analytics & Audit',
    icon: BarChart3,
    items: [
      { id: 'analytics',      label: 'Analytics'           },
      { id: 'audit',          label: 'Audit Log'           },
      { id: 'credits',        label: 'Credits & Billing'   },
    ],
  },
  {
    label: 'Organisation',
    icon: Users,
    items: [
      { id: 'api-keys',       label: 'API Keys'            },
      { id: 'members',        label: 'Members'             },
      { id: 'invitations',    label: 'Invitations'         },
      { id: 'org',            label: 'Organisation'        },
    ],
  },
];

const METHOD_COLORS = {
  GET:    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  POST:   { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  PUT:    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  PATCH:  { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  DELETE: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
};

// ── Utility: copy to clipboard ────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = 'bash', id, title }) {
  const { copied, copy } = useCopy();
  return (
    <div style={{ background: '#0f172a', borderRadius: 10, overflow: 'hidden', border: '1px solid #1e293b', marginTop: 8, marginBottom: 8 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #1e293b', background: '#0a0e1a' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{title}</span>
          <span style={{ fontSize: 10, color: '#334155', background: '#1e293b', padding: '2px 8px', borderRadius: 4 }}>{lang}</span>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <pre style={{ margin: 0, padding: '14px 16px', fontSize: 12.5, lineHeight: 1.7, color: '#e2e8f0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <code>{code}</code>
        </pre>
        <button
          onClick={() => copy(code, id)}
          title="Copy"
          style={{ position: 'absolute', top: 10, right: 10, background: copied === id ? '#16a34a' : '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
        >
          {copied === id
            ? <><Check size={11} color="#4ade80" /><span style={{ fontSize: 10, color: '#4ade80' }}>Copied</span></>
            : <><Copy size={11} color="#64748b" /><span style={{ fontSize: 10, color: '#64748b' }}>Copy</span></>
          }
        </button>
      </div>
    </div>
  );
}

// ── Method badge ──────────────────────────────────────────────────────────────
function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 5, padding: '2px 7px' }}>
      {method}
    </span>
  );
}

// ── Endpoint card ─────────────────────────────────────────────────────────────
function Endpoint({ method, path, desc, params = [], body = null, response = null, auth = true }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.card, border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = T.card}
      >
        <MethodBadge method={method} />
        <code style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: T.text, fontWeight: 500 }}>{path}</code>
        {auth && <Lock size={11} color={T.textMut} title="Requires authentication" />}
        <span style={{ fontSize: 12, color: T.textSec, marginRight: 4 }}>{desc}</span>
        <ChevronDown size={14} color={T.textMut} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: 16, background: '#f8fafc' }}>
          {params.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Parameters</p>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', background: T.card }}>
                {params.map((p, i) => (
                  <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '160px 90px 1fr', gap: 12, padding: '10px 14px', borderBottom: i < params.length - 1 ? `1px solid #f1f5f9` : 'none', alignItems: 'start' }}>
                    <div>
                      <code style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.name}</code>
                      {p.required && <span style={{ fontSize: 9, color: '#dc2626', fontWeight: 700, marginLeft: 5 }}>required</span>}
                    </div>
                    <span style={{ fontSize: 11, color: '#7c3aed', fontFamily: 'monospace' }}>{p.type}</span>
                    <span style={{ fontSize: 12, color: T.textSec }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {body && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Request Body</p>
              <CodeBlock code={body} lang="json" id={`body-${method}-${path}`} />
            </div>
          )}
          {response && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Response</p>
              <CodeBlock code={response} lang="json" id={`res-${method}-${path}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ id, icon: Icon, title, subtitle, badge }) {
  return (
    <div id={id} style={{ scrollMarginTop: 80, paddingTop: 32, paddingBottom: 16, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        {Icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-light, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={T.brand} /></div>}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>{title}</h2>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, background: 'var(--brand-light, #eff6ff)', border: `1px solid var(--brand-muted, #bfdbfe)`, borderRadius: 99, padding: '2px 8px' }}>{badge}</span>}
      </div>
      {subtitle && <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 640 }}>{subtitle}</p>}
    </div>
  );
}

// ── Info callout ──────────────────────────────────────────────────────────────
function Callout({ type = 'info', children }) {
  const styles = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', icon: '💡', text: '#1d4ed8' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '⚠️', text: '#92400e' },
    danger:  { bg: '#fef2f2', border: '#fca5a5', icon: '🚫', text: '#b91c1c' },
    success: { bg: '#f0fdf4', border: '#86efac', icon: '✅', text: '#15803d' },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <div style={{ fontSize: 13, color: s.text, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// ── Property table ────────────────────────────────────────────────────────────
function PropTable({ rows }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 16, background: T.card }}>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 100px 1fr', background: '#f8fafc', borderBottom: `1px solid ${T.border}`, padding: '8px 14px' }}>
        {['Field', 'Type', 'Description'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</span>)}
      </div>
      {rows.map((r, i) => (
        <div key={r.field} style={{ display: 'grid', gridTemplateColumns: '160px 100px 1fr', gap: 8, padding: '10px 14px', borderBottom: i < rows.length - 1 ? `1px solid #f1f5f9` : 'none', alignItems: 'start' }}>
          <code style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{r.field}</code>
          <span style={{ fontSize: 11, color: '#7c3aed', fontFamily: 'monospace' }}>{r.type}</span>
          <span style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55 }}>{r.desc}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

function Introduction() {
  return (
    <div>
      <SectionHeading id="introduction" icon={BookOpen} title="Introduction" subtitle="The DecisionMesh API lets you submit AI intents, enforce governance policies, track executions, and administer your tenant — all from a single endpoint." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '🌐', title: 'REST API', desc: 'Standard HTTP methods. JSON request & response bodies. Predictable resource-oriented URLs.' },
          { icon: '🔐', title: 'Bearer Auth', desc: 'OAuth2 JWT tokens via Zitadel. Short-lived access tokens, automatic refresh.' },
          { icon: '📦', title: 'Idempotent', desc: 'Intents require an Idempotency-Key header. Safe to retry on network failures.' },
        ].map(c => (
          <div key={c.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Base URL</p>
        <code style={{ fontSize: 14, fontWeight: 600, color: T.brand }}>{BASE_URL}</code>
      </div>
      <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>All requests must be made over HTTPS. HTTP requests will be rejected. All request and response bodies use <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>application/json</code>.</p>
    </div>
  );
}

function QuickStart() {
  return (
    <div>
      <SectionHeading id="quickstart" icon={Zap} title="Quick Start" subtitle="Submit your first AI intent in under 5 minutes." />
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        {['1. Get a token', '2. Create API key', '3. Submit intent', '4. Read result'].map((step, i, arr) => (
          <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.brand, marginBottom: 2 }}>STEP {i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{step.replace(/\d\. /, '')}</div>
            </div>
            {i < arr.length - 1 && <ChevronRight size={14} color={T.textMut} style={{ flexShrink: 0, margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>Step 1 — Obtain an access token</h3>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 8, lineHeight: 1.65 }}>Use OAuth2 Authorization Code flow with your Zitadel credentials:</p>
      <CodeBlock id="qs-token" lang="bash" title="Get access token" code={`curl -X POST https://decisionmesh-1pgrry.eu1.zitadel.cloud/oauth/v2/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=<YOUR_CLIENT_ID>" \\
  -d "client_secret=<YOUR_CLIENT_SECRET>" \\
  -d "scope=openid profile email"`} />

      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Step 2 — Create an API key</h3>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 8, lineHeight: 1.65 }}>Use the dashboard or API to create a scoped API key for programmatic access:</p>
      <CodeBlock id="qs-apikey" lang="bash" title="Create API key" code={`curl -X POST ${BASE_URL}/api/api-keys \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-app-key",
    "scopes": ["intents:write", "intents:read"],
    "expiryDays": 90
  }'`} />

      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Step 3 — Submit an intent</h3>
      <Callout type="info">Every POST to <code>/api/intents</code> requires an <strong>Idempotency-Key</strong> header — a UUID you generate. Retrying with the same key returns the original response safely.</Callout>
      <CodeBlock id="qs-intent" lang="bash" title="Submit AI intent" code={`curl -X POST ${BASE_URL}/api/intents \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "type": "CREDIT_DECISION",
    "description": "Evaluate loan application for customer #4821",
    "context": {
      "customerId": "cust_4821",
      "requestedAmount": 15000,
      "term": 24
    },
    "budget": { "maxCostUsd": 0.05 },
    "adapter": "openai-gpt4o"
  }'`} />

      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Step 4 — Read the result</h3>
      <CodeBlock id="qs-read" lang="bash" title="Get intent result" code={`curl ${BASE_URL}/api/intents/<INTENT_ID> \\
  -H "Authorization: Bearer <ACCESS_TOKEN>"`} />
      <CodeBlock id="qs-result" lang="json" title="Response" code={`{
  "id": "int-8f3a2b1c",
  "type": "CREDIT_DECISION",
  "status": "COMPLETED",
  "phase": "AUDIT",
  "cost": { "totalUsd": 0.0031 },
  "policyResult": { "decision": "APPROVED", "checksRun": 14 },
  "output": { "decision": "approved", "confidence": 0.94 },
  "createdAt": "2026-05-30T09:41:07Z"
}`} />
    </div>
  );
}

function Authentication() {
  return (
    <div>
      <SectionHeading id="authentication" icon={Lock} title="Authentication" subtitle="All API requests require a valid Bearer token in the Authorization header." />
      <Callout type="info">DecisionMesh uses <strong>OAuth2 JWT tokens</strong> issued by Zitadel. Tokens expire after 1 hour — use refresh tokens or client credentials for long-running processes.</Callout>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>OAuth2 Settings</h3>
      <PropTable rows={[
        { field: 'Auth URL',     type: 'string', desc: 'https://decisionmesh-1pgrry.eu1.zitadel.cloud/oauth/v2/authorize' },
        { field: 'Token URL',    type: 'string', desc: 'https://decisionmesh-1pgrry.eu1.zitadel.cloud/oauth/v2/token' },
        { field: 'Client ID',    type: 'string', desc: '368134611768783581' },
        { field: 'Scopes',       type: 'string', desc: 'openid profile email' },
        { field: 'Callback URL', type: 'string', desc: 'https://oauth.pstmn.io/v1/callback (Postman) or your app URL' },
      ]} />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Including the token</h3>
      <CodeBlock id="auth-header" lang="bash" title="Authorization header" code={`Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`} />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Roles & permissions</h3>
      <PropTable rows={[
        { field: 'sys_admin',    type: 'role', desc: 'Platform administrator — full access to all tenants and admin endpoints' },
        { field: 'tenant_admin', type: 'role', desc: 'Tenant administrator — manage org, members, policies, and API keys' },
        { field: 'tenant_user',  type: 'role', desc: 'Standard user — submit intents, read executions and analytics' },
      ]} />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>Onboarding requirement</h3>
      <Callout type="warning">Every new user must complete onboarding before accessing other endpoints. Call <code>POST /api/onboard/ensure</code> then <code>POST /api/onboard/setup-tenant</code> on first login.</Callout>
    </div>
  );
}

function Errors() {
  return (
    <div>
      <SectionHeading id="errors" icon={AlertCircle} title="Errors & Status Codes" subtitle="All errors return a consistent JSON envelope with a human-readable message." />
      <CodeBlock id="err-shape" lang="json" title="Error response shape" code={`{
  "message": "Human-readable description of what went wrong"
}`} />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '16px 0 8px' }}>HTTP Status Codes</h3>
      <PropTable rows={[
        { field: '200 OK',                  type: 'success', desc: 'Request succeeded. Response body contains the result.' },
        { field: '201 Created',             type: 'success', desc: 'Resource created. Response body contains the new resource.' },
        { field: '204 No Content',          type: 'success', desc: 'Resource deleted. No response body.' },
        { field: '400 Bad Request',         type: 'error',   desc: 'Invalid request body, missing required fields, or validation failure.' },
        { field: '401 Unauthorized',        type: 'error',   desc: 'Missing or invalid Bearer token. Re-authenticate and retry.' },
        { field: '403 Forbidden',           type: 'error',   desc: 'Valid token but insufficient role for this operation.' },
        { field: '404 Not Found',           type: 'error',   desc: 'Resource does not exist or does not belong to your tenant.' },
        { field: '409 Conflict',            type: 'error',   desc: 'Resource already exists (e.g. duplicate API key name).' },
        { field: '429 Too Many Requests',   type: 'error',   desc: 'Rate limit exceeded. Retry after the Retry-After header value.' },
        { field: '500 Internal Server Error', type: 'error', desc: 'Unexpected server error. Contact support with the request ID.' },
      ]} />
    </div>
  );
}

function SDKs() {
  return (
    <div>
      <SectionHeading id="sdks" icon={Package} title="SDKs & Libraries" subtitle="Client libraries for popular languages. All SDKs handle authentication, retries, and idempotency automatically." />
      <Callout type="warning">Official SDKs are coming soon. For now use the REST API directly with the examples in this guide.</Callout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { lang: 'Node.js / TypeScript', status: 'Coming soon', icon: '🟨' },
          { lang: 'Python',               status: 'Coming soon', icon: '🐍' },
          { lang: 'Go',                   status: 'Coming soon', icon: '🔵' },
          { lang: 'Java',                 status: 'Coming soon', icon: '☕' },
          { lang: 'Ruby',                 status: 'Coming soon', icon: '💎' },
          { lang: 'REST (Postman)',        status: 'Available',   icon: '📮', link: '/openapi.yaml' },
        ].map(s => (
          <div key={s.lang} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.lang}</div>
              <div style={{ fontSize: 11, color: s.status === 'Available' ? '#16a34a' : T.textMut, fontWeight: 500 }}>{s.status}</div>
            </div>
            {s.link && <a href={s.link} download style={{ marginLeft: 'auto', fontSize: 11, color: T.brand, textDecoration: 'none', fontWeight: 600 }}>Download spec ↓</a>}
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '20px 0 8px' }}>OpenAPI / Swagger</h3>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 10, lineHeight: 1.65 }}>Import the OpenAPI spec into Postman, Insomnia, or any HTTP client:</p>
      <CodeBlock id="sdk-spec" lang="bash" title="Download OpenAPI spec" code={`curl -O ${window?.location?.origin ?? 'https://app.decimeshi.com'}/openapi.yaml`} />
    </div>
  );
}

function Onboarding() {
  return (
    <div>
      <SectionHeading id="onboarding" icon={GitBranch} title="Onboarding" subtitle="Every new user must complete onboarding before accessing other endpoints. Call these in order on first login." />
      <Callout type="danger">Calling any other endpoint before completing onboarding will return <code>403 Forbidden</code>.</Callout>
      <Endpoint method="GET"  path="/api/onboard/me" desc="Get current user & tenant info" auth
        response={`{
  "userId": "usr_abc123",
  "email": "you@company.com",
  "tenantId": "ten_xyz789",
  "role": "tenant_admin",
  "onboarded": true
}`} />
      <Endpoint method="POST" path="/api/onboard/ensure" desc="Check/create user record" auth
        response={`{ "created": true, "userId": "usr_abc123" }`} />
      <Endpoint method="POST" path="/api/onboard/setup-tenant" desc="Create tenant for new user" auth
        body={`{ "orgName": "My Company" }`}
        response={`{ "tenantId": "ten_xyz789", "orgName": "My Company" }`} />
      <Endpoint method="POST" path="/api/onboard/repair-attributes" desc="Repair missing user attributes" auth />
    </div>
  );
}

function Intents() {
  return (
    <div>
      <SectionHeading id="intents" icon={Terminal} title="Intents" badge="Core" subtitle="An intent is an AI task declaration. Submit it with a type, context, budget, and adapter. DecisionMesh governs, executes, and audits it end-to-end." />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>Intent object</h3>
      <PropTable rows={[
        { field: 'id',           type: 'string',  desc: 'Unique intent ID (int-xxxxxxxx)' },
        { field: 'type',         type: 'string',  desc: 'Intent classification (CREDIT_DECISION, FRAUD_DETECT, etc.)' },
        { field: 'status',       type: 'enum',    desc: 'PENDING | RUNNING | COMPLETED | FAILED | BLOCKED' },
        { field: 'phase',        type: 'enum',    desc: 'INTENT → VALIDATE → POLICY → DECIDE → EXECUTE → AUDIT' },
        { field: 'description',  type: 'string',  desc: 'Human-readable description of the task' },
        { field: 'context',      type: 'object',  desc: 'Arbitrary JSON passed to the adapter as context' },
        { field: 'budget',       type: 'object',  desc: '{ maxCostUsd: number } — hard ceiling. Intent blocked if exceeded.' },
        { field: 'adapter',      type: 'string',  desc: 'Adapter key (openai-gpt4o, anthropic-claude, etc.)' },
        { field: 'policyResult', type: 'object',  desc: 'Policy evaluation outcome: decision, checksRun, blocked' },
        { field: 'cost',         type: 'object',  desc: '{ totalUsd: number } — actual spend after execution' },
        { field: 'output',       type: 'object',  desc: 'Adapter response — format depends on intent type' },
        { field: 'createdAt',    type: 'string',  desc: 'ISO 8601 timestamp' },
      ]} />
      <Callout type="info">The <strong>Idempotency-Key</strong> header is required on POST. Use <code>crypto.randomUUID()</code> or <code>uuidgen</code>. Retry the same key safely within 24 hours.</Callout>
      <Endpoint method="POST" path="/api/intents" desc="Submit a new AI intent" auth
        body={`{
  "type": "CREDIT_DECISION",
  "description": "Evaluate loan application",
  "context": { "customerId": "cust_4821", "amount": 15000 },
  "budget": { "maxCostUsd": 0.05 },
  "adapter": "openai-gpt4o"
}`}
        response={`{
  "id": "int-8f3a2b1c",
  "status": "PENDING",
  "phase": "INTENT",
  "createdAt": "2026-05-30T09:41:07Z"
}`} />
      <Endpoint method="GET" path="/api/intents" desc="List intents (paginated)" auth
        params={[
          { name: 'page',   type: 'integer', desc: 'Page number (default: 0)' },
          { name: 'size',   type: 'integer', desc: 'Items per page (default: 20, max: 100)' },
          { name: 'status', type: 'string',  desc: 'Filter by status: PENDING | RUNNING | COMPLETED | FAILED | BLOCKED' },
          { name: 'type',   type: 'string',  desc: 'Filter by intent type' },
        ]}
        response={`{
  "content": [ { "id": "int-8f3a2b1c", "type": "CREDIT_DECISION", ... } ],
  "totalElements": 142,
  "totalPages": 8,
  "page": 0,
  "size": 20
}`} />
      <Endpoint method="GET"    path="/api/intents/{intentId}" desc="Get intent by ID" auth
        params={[{ name: 'intentId', type: 'string', required: true, desc: 'Intent ID (int-xxxxxxxx)' }]} />
      <Endpoint method="GET"    path="/api/intents/{intentId}/events"             desc="Get intent lifecycle events" auth />
      <Endpoint method="GET"    path="/api/intents/{intentId}/executions"          desc="Get executions for intent" auth />
      <Endpoint method="GET"    path="/api/intents/{intentId}/policy-evaluations"  desc="Get policy evaluation details" auth />
    </div>
  );
}

function IntentLibrary() {
  return (
    <div>
      <SectionHeading id="intent-library" icon={BookOpen} title="Intent Library" badge="264 templates" subtitle="Pre-built intent templates for FINTECH — payments, fraud, KYC/AML, risk, and compliance. Includes full context schemas and recommended policies." />
      <Callout type="success">264 pre-built templates across 6 verticals. Use them as-is or as starting points for custom intents.</Callout>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>Available verticals</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {['payments', 'fraud', 'kyc-aml', 'risk', 'compliance', 'credit'].map(v => (
          <code key={v} style={{ background: '#f1f5f9', border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 12, color: T.text }}>{v}</code>
        ))}
      </div>
      <Endpoint method="GET" path="/api/intent-library/{vertical}" desc="List templates for a vertical" auth
        params={[{ name: 'vertical', type: 'string', required: true, desc: 'One of: payments | fraud | kyc-aml | risk | compliance | credit' }]}
        response={`{
  "vertical": "fraud",
  "count": 48,
  "templates": [
    { "id": "tpl_fraud_001", "name": "Transaction Fraud Score", "category": "scoring" }
  ]
}`} />
      <Endpoint method="GET" path="/api/intent-library/{vertical}/meta/categories"         desc="Get categories for a vertical" auth />
      <Endpoint method="GET" path="/api/intent-library/{vertical}/by-category/{category}"  desc="Templates by category" auth />
      <Endpoint method="GET" path="/api/intent-library/{vertical}/search"                  desc="Search templates"
        params={[{ name: 'q', type: 'string', required: true, desc: 'Search query' }]} auth />
      <Endpoint method="GET" path="/api/intent-library/intent/{id}"                        desc="Get full template details" auth />
    </div>
  );
}

function Executions() {
  return (
    <div>
      <SectionHeading id="executions" icon={Cpu} title="Executions" subtitle="An execution is created when an approved intent is processed by an adapter. Each execution records cost, latency, output, and quality score." />
      <PropTable rows={[
        { field: 'id',           type: 'string',  desc: 'Unique execution ID (exe-xxxxxxxx)' },
        { field: 'intentId',     type: 'string',  desc: 'Parent intent ID' },
        { field: 'adapter',      type: 'string',  desc: 'Adapter that processed the execution' },
        { field: 'status',       type: 'enum',    desc: 'RUNNING | COMPLETED | FAILED | TIMEOUT' },
        { field: 'costUsd',      type: 'number',  desc: 'Actual cost of this execution in USD' },
        { field: 'latencyMs',    type: 'integer', desc: 'End-to-end latency in milliseconds' },
        { field: 'qualityScore', type: 'number',  desc: 'Automated quality score 0–1 (relevance × completeness)' },
        { field: 'output',       type: 'object',  desc: 'Raw adapter response' },
        { field: 'startedAt',    type: 'string',  desc: 'ISO 8601 timestamp' },
        { field: 'completedAt',  type: 'string',  desc: 'ISO 8601 timestamp' },
      ]} />
      <Endpoint method="GET" path="/api/executions" desc="List all executions (paginated)" auth
        params={[
          { name: 'page',     type: 'integer', desc: 'Page number (default: 0)' },
          { name: 'size',     type: 'integer', desc: 'Items per page (default: 20)' },
          { name: 'adapter',  type: 'string',  desc: 'Filter by adapter' },
          { name: 'status',   type: 'string',  desc: 'Filter by status' },
        ]} />
      <Endpoint method="GET" path="/api/executions/by-intent/{intentId}" desc="Get executions for a specific intent" auth
        params={[{ name: 'intentId', type: 'string', required: true, desc: 'Parent intent ID' }]} />
    </div>
  );
}

function Policies() {
  return (
    <div>
      <SectionHeading id="policies" icon={Shield} title="Policies" subtitle="Governance rules evaluated against every intent before execution. Write conditions in plain JSON. Policies run in priority order — first match wins." />
      <Callout type="info">Example policy: <code>{`{ "condition": "cost > 0.01", "action": "REJECT" }`}</code>. Supported actions: <code>APPROVE</code>, <code>REJECT</code>, <code>HUMAN_GATE</code>, <code>FALLBACK</code>.</Callout>
      <PropTable rows={[
        { field: 'id',          type: 'string',  desc: 'Policy ID' },
        { field: 'name',        type: 'string',  desc: 'Human-readable policy name' },
        { field: 'condition',   type: 'string',  desc: 'Rule expression: cost, latency, type, adapter, context.*' },
        { field: 'action',      type: 'enum',    desc: 'APPROVE | REJECT | HUMAN_GATE | FALLBACK' },
        { field: 'priority',    type: 'integer', desc: 'Evaluation order — lower = higher priority' },
        { field: 'enabled',     type: 'boolean', desc: 'Toggle without deleting' },
        { field: 'description', type: 'string',  desc: 'Optional explanation for auditors' },
      ]} />
      <Endpoint method="GET"    path="/api/policies"     desc="List all policies" auth />
      <Endpoint method="POST"   path="/api/policies"     desc="Create a policy" auth
        body={`{
  "name": "Cost limit",
  "condition": "cost > 0.05",
  "action": "REJECT",
  "priority": 10,
  "description": "Block intents exceeding $0.05 budget"
}`} />
      <Endpoint method="PUT"    path="/api/policies/{id}" desc="Update a policy" auth />
      <Endpoint method="DELETE" path="/api/policies/{id}" desc="Delete a policy" auth />
    </div>
  );
}

function Analytics() {
  return (
    <div>
      <SectionHeading id="analytics" icon={BarChart3} title="Analytics" subtitle="Cost and drift analytics aggregated across all intent executions. Filter by date, adapter, intent type, or project." />
      <Endpoint method="GET" path="/api/analytics/cost" desc="Cost analytics" auth
        params={[
          { name: 'from',     type: 'string',  desc: 'Start date ISO 8601 (e.g. 2026-01-01)' },
          { name: 'to',       type: 'string',  desc: 'End date ISO 8601' },
          { name: 'groupBy',  type: 'string',  desc: 'Group results: day | week | month | adapter | type' },
          { name: 'adapter',  type: 'string',  desc: 'Filter by adapter key' },
        ]}
        response={`{
  "totalCostUsd": 142.37,
  "intentCount": 48291,
  "avgCostPerIntent": 0.00295,
  "series": [
    { "date": "2026-05-01", "costUsd": 12.40, "count": 4102 }
  ]
}`} />
      <Endpoint method="GET" path="/api/analytics/drift" desc="Model drift analytics" auth
        params={[
          { name: 'from',    type: 'string', desc: 'Start date ISO 8601' },
          { name: 'to',      type: 'string', desc: 'End date ISO 8601' },
          { name: 'adapter', type: 'string', desc: 'Filter by adapter' },
        ]} />
    </div>
  );
}

function Audit() {
  return (
    <div>
      <SectionHeading id="audit" icon={ScrollText} title="Audit Log" subtitle="Immutable, tamper-proof log of every action in your tenant. Signed at write time. Exportable as CSV for regulators." />
      <Callout type="success">Every entry is <strong>cryptographically signed</strong> at creation and cannot be modified. One-click CSV export for regulatory submissions.</Callout>
      <Endpoint method="GET" path="/api/audit" desc="Query audit log (paginated)" auth
        params={[
          { name: 'page',      type: 'integer', desc: 'Page number' },
          { name: 'size',      type: 'integer', desc: 'Items per page (max 200)' },
          { name: 'from',      type: 'string',  desc: 'Start datetime ISO 8601' },
          { name: 'to',        type: 'string',  desc: 'End datetime ISO 8601' },
          { name: 'action',    type: 'string',  desc: 'Filter by action type' },
          { name: 'userId',    type: 'string',  desc: 'Filter by user' },
          { name: 'export',    type: 'boolean', desc: 'Set true to receive CSV download' },
        ]}
        response={`{
  "content": [
    {
      "id": "aud_001",
      "action": "INTENT_SUBMITTED",
      "userId": "usr_abc123",
      "resourceId": "int-8f3a2b1c",
      "signature": "sha256:a1b2c3...",
      "timestamp": "2026-05-30T09:41:07Z"
    }
  ],
  "totalElements": 48291
}`} />
    </div>
  );
}

function Credits() {
  return (
    <div>
      <SectionHeading id="credits" icon={Zap} title="Credits & Billing" subtitle="Check your credit balance and view the full ledger of credit transactions." />
      <Callout type="info">Free tier includes 100 one-time credits — full product access. Each intent execution consumes credits based on the adapter and model used. 1 credit ≈ $0.001 USD.</Callout>
      <Endpoint method="GET" path="/api/credits/balance" desc="Get current credit balance" auth
        response={`{
  "balance": 497,
  "allocated": 100,
  "plan": "free",
  "renewsAt": "2026-06-01T00:00:00Z"
}`} />
      <Endpoint method="GET" path="/api/credits/ledger" desc="Get credit transaction history" auth
        params={[
          { name: 'page', type: 'integer', desc: 'Page number' },
          { name: 'size', type: 'integer', desc: 'Items per page' },
        ]}
        response={`{
  "content": [
    { "id": "txn_001", "type": "DEBIT", "amount": 3, "reason": "INTENT_EXECUTED", "balanceAfter": 497 }
  ]
}`} />
    </div>
  );
}

function ApiKeys() {
  return (
    <div>
      <SectionHeading id="api-keys" icon={KeyRound} title="API Keys" subtitle="Create scoped API keys for programmatic access. The raw key is shown only once at creation — store it immediately." />
      <Callout type="danger">The raw API key is returned <strong>once only</strong> in the creation response. It cannot be retrieved again — only deleted and recreated.</Callout>
      <Endpoint method="GET"    path="/api/api-keys"     desc="List API keys" auth />
      <Endpoint method="POST"   path="/api/api-keys"     desc="Create an API key" auth
        body={`{
  "name": "production-app",
  "scopes": ["intents:write", "intents:read", "executions:read"],
  "expiryDays": 90
}`}
        response={`{
  "id": "key_abc123",
  "name": "production-app",
  "key": "dm_live_a1b2c3d4e5f6...",
  "scopes": ["intents:write", "intents:read"],
  "expiresAt": "2026-08-28T00:00:00Z"
}`} />
      <Endpoint method="DELETE" path="/api/api-keys/{id}" desc="Revoke an API key" auth
        params={[{ name: 'id', type: 'string', required: true, desc: 'API key ID' }]} />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '16px 0 8px' }}>Available scopes</h3>
      <PropTable rows={[
        { field: 'intents:write',    type: 'scope', desc: 'Submit intents — POST /api/intents' },
        { field: 'intents:read',     type: 'scope', desc: 'Read intents and events — GET /api/intents/*' },
        { field: 'executions:read',  type: 'scope', desc: 'Read execution records — GET /api/executions/*' },
        { field: 'analytics:read',   type: 'scope', desc: 'Read cost and drift analytics — GET /api/analytics/*' },
        { field: 'audit:read',       type: 'scope', desc: 'Read audit log — GET /api/audit' },
        { field: 'policies:write',   type: 'scope', desc: 'Create and update policies — POST/PUT /api/policies' },
      ]} />
    </div>
  );
}

function Members() {
  return (
    <div>
      <SectionHeading id="members" icon={Users} title="Members" subtitle="Manage organisation members and their roles." />
      <Endpoint method="GET"   path="/api/members"               desc="List org members" auth />
      <Endpoint method="GET"   path="/api/members/{userId}"      desc="Get member details" auth
        params={[{ name: 'userId', type: 'string', required: true, desc: 'User ID' }]} />
      <Endpoint method="PUT"   path="/api/members/{userId}/role" desc="Update member role" auth
        body={`{ "role": "tenant_admin" }`} />
      <Endpoint method="DELETE" path="/api/members/{userId}"     desc="Remove member from org" auth />
    </div>
  );
}

function Invitations() {
  return (
    <div>
      <SectionHeading id="invitations" icon={Users} title="Invitations" subtitle="Invite new users to your tenant by email. They receive an email with a signup link." />
      <Endpoint method="GET"    path="/api/invitations"     desc="List pending invitations" auth />
      <Endpoint method="POST"   path="/api/invitations"     desc="Send an invitation" auth
        body={`{ "email": "colleague@company.com", "role": "tenant_user" }`}
        response={`{ "id": "inv_abc123", "email": "colleague@company.com", "expiresAt": "2026-06-06T00:00:00Z" }`} />
      <Endpoint method="DELETE" path="/api/invitations/{id}" desc="Cancel an invitation" auth />
    </div>
  );
}

function Org() {
  return (
    <div>
      <SectionHeading id="org" icon={Globe} title="Organisation" subtitle="Manage org settings, branding, and projects." />
      <Endpoint method="GET"  path="/api/org"          desc="Get org details" auth />
      <Endpoint method="PUT"  path="/api/org/branding" desc="Update org branding" auth
        body={`{
  "logoUrl": "https://company.com/logo.png",
  "primaryColor": "#2563eb",
  "companyName": "My Company"
}`} />
      <Endpoint method="GET"  path="/api/projects"     desc="List projects" auth />
      <Endpoint method="POST" path="/api/projects"     desc="Create a project" auth
        body={`{ "name": "Production", "environment": "Production" }`} />
    </div>
  );
}

// ── Section registry ──────────────────────────────────────────────────────────
const SECTIONS = {
  introduction: Introduction,
  quickstart:   QuickStart,
  authentication: Authentication,
  errors:       Errors,
  sdks:         SDKs,
  onboarding:   Onboarding,
  intents:      Intents,
  'intent-library': IntentLibrary,
  executions:   Executions,
  policies:     Policies,
  analytics:    Analytics,
  audit:        Audit,
  credits:      Credits,
  'api-keys':   ApiKeys,
  members:      Members,
  invitations:  Invitations,
  org:          Org,
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DOCS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [search, setSearch]               = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef(null);

  // Highlight active nav item on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    document.querySelectorAll('[id]').forEach(el => {
      if (SECTIONS[el.id]) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const scrollTo = (id) => {
    setActiveSection(id);
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filter nav by search
  const filtered = search.trim().length > 0
    ? NAV_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter(s => s.items.length > 0)
    : NAV_SECTIONS;

  return (
    <div style={{ display: 'flex', height: '100%', background: T.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Docs sidebar ──────────────────────────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0, background: T.sidebar,
        borderRight: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        height: '100%',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <BookOpen size={14} color="#60a5fa" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Documentation</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#60a5fa', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 4, padding: '1px 5px', marginLeft: 'auto' }}>v1.0</span>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={12} color="#475569" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search docs..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '6px 8px 6px 28px', fontSize: 12, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0 20px' }}>
          {filtered.map(section => {
            const SectionIcon = section.icon;
            return (
              <div key={section.label} style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px 4px', marginBottom: 2 }}>
                  <SectionIcon size={10} color="#38bdf8" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{section.label}</span>
                </div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '6px 14px 6px 28px',
                      background: activeSection === item.id ? T.sideActBg : 'transparent',
                      borderLeft: activeSection === item.id ? `2px solid ${T.sideAct}` : '2px solid transparent',
                      border: 'none', cursor: 'pointer',
                      fontSize: 12.5, fontWeight: activeSection === item.id ? 600 : 400,
                      color: activeSection === item.id ? T.sideAct : T.sideText,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (activeSection !== item.id) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                    onMouseLeave={e => { if (activeSection !== item.id) { e.currentTarget.style.color = T.sideText; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer links */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'API Reference (Swagger)', href: window?.location?.origin + '/api-docs.html', icon: ExternalLink },
            { label: 'Download OpenAPI spec',   href: '/openapi.yaml', icon: FileText },
            { label: 'Support',                 href: 'mailto:support@decisionmesh.io', icon: Globe },
          ].map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target={href.startsWith('http') || href.startsWith('/api-docs.html') ? '_blank' : undefined} rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#475569', textDecoration: 'none', padding: '5px 0', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              <Icon size={11} />
              {label}
            </a>
          ))}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 80px' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: T.card, borderBottom: `1px solid ${T.border}`, padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: T.textMut }}>API Reference</span>
            <ChevronRight size={12} color={T.textMut} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text, textTransform: 'capitalize' }}>
              {NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeSection)?.label ?? 'Introduction'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => window.open(window.location.origin + '/api-docs.html', '_blank')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.brand, textDecoration: 'none', fontWeight: 500, padding: '5px 10px', border: `1px solid ${T.border}`, borderRadius: 7, background: 'var(--brand-light, #eff6ff)', cursor: 'pointer' }}>
              <ExternalLink size={12} /> Interactive API Explorer
            </button>
          </div>
        </div>

        {/* All sections rendered */}
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <Introduction />
          <QuickStart />
          <Authentication />
          <Errors />
          <SDKs />
          <Onboarding />
          <Intents />
          <IntentLibrary />
          <Executions />
          <Policies />
          <Analytics />
          <Audit />
          <Credits />
          <ApiKeys />
          <Members />
          <Invitations />
          <Org />

          {/* Bottom nav */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: T.textMut }}>© 2026 DecisionMesh · <a href="mailto:support@decisionmesh.io" style={{ color: T.brand, textDecoration: 'none' }}>support@decisionmesh.io</a></p>
            <a href="javascript:void(0)" onClick={() => window.open(window.location.origin + '/api-docs.html', '_blank')} style={{ fontSize: 12, color: T.brand, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, cursor: 'pointer' }}>
              Full Swagger UI <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
