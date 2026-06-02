import { useState } from 'react';
import { Shield, Lock, Eye, Server, RefreshCw, FileText, CheckCircle, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

// ── Design: Deep navy enterprise trust page — clean, authoritative, confidence-inspiring
// Matches DecisionMesh's existing Deep Ocean theme

const C = {
  navy:    '#060f1e',
  navyMid: '#0d1e35',
  border:  'rgba(14,165,233,0.15)',
  blue:    '#0ea5e9',
  green:   '#10b981',
  amber:   '#f59e0b',
  text:    '#e2e8f0',
  muted:   '#7eb8d4',
  sub:     '#4a7fa5',
};

const checks = [
  { icon: Lock,       label: 'Multi-Factor Authentication',     desc: 'Enforced for all users via Zitadel OIDC' },
  { icon: Shield,     label: 'Vulnerability Scanning',          desc: 'Trivy scans every Docker image on every CI build' },
  { icon: Eye,        label: 'Penetration Testing',             desc: 'OWASP ZAP: 0 failures, 66 checks passed (June 2026)' },
  { icon: Lock,       label: 'Encrypted Secrets',               desc: 'All API keys stored in OpenBao — never in code' },
  { icon: FileText,   label: 'Immutable Audit Trail',           desc: 'Every AI decision logged in append-only audit log' },
  { icon: Shield,     label: 'GDPR Right to Erasure',           desc: 'Automated erasure API — Article 17 compliant, 30-day SLA' },
  { icon: RefreshCw,  label: 'Data Retention Enforcement',      desc: 'Automated nightly cleanup — 7-year financial retention' },
  { icon: Server,     label: 'Backup Verification',             desc: 'Monthly automated restore and row-count verification' },
  { icon: Lock,       label: 'Encryption in Transit',           desc: 'TLS 1.2+ via Caddy — HSTS enabled, auto Let\'s Encrypt' },
  { icon: Server,     label: 'Encryption at Rest',              desc: 'AES-256 for all stored data on Hetzner EU servers' },
  { icon: Shield,     label: 'Non-root Containers',             desc: 'All Docker containers run as dedicated non-root user' },
  { icon: Lock,       label: 'Role-Based Access Control',       desc: 'ADMIN, ANALYST, VIEWER roles via Zitadel OAuth2/OIDC' },
  { icon: Eye,        label: 'Uptime Monitoring',               desc: 'UptimeRobot every 5 min — email + Discord alerts' },
  { icon: Server,     label: 'Metrics & Observability',         desc: 'Prometheus + Grafana — real-time API health dashboard' },
];

const frameworks = [
  { name: 'SOC 2 Type I',  status: 'In Progress', color: C.amber,  note: 'Controls implemented — formal audit pending' },
  { name: 'SOC 2 Type II', status: 'Pursuing',    color: C.amber,  note: 'Observation period started June 2026' },
  { name: 'GDPR',          status: 'Compliant',   color: C.green,  note: 'DPA available on request' },
  { name: 'EU AI Act',     status: 'Compliant',   color: C.green,  note: 'Immutable audit trail, intent classification, policy enforcement' },
  { name: 'DPDPA 2023',    status: 'Compliant',   color: C.green,  note: 'Data residency in EU — Hetzner, Nuremberg, Germany' },
];

const policies = [
  { id: 'DM-POL-001', name: 'Information Security Policy' },
  { id: 'DM-POL-002', name: 'Access Control Policy' },
  { id: 'DM-POL-003', name: 'Data Retention Policy' },
  { id: 'DM-POL-004', name: 'Incident Response Policy' },
  { id: 'DM-POL-005', name: 'Change Management Policy' },
  { id: 'DM-POL-006', name: 'Vendor Management Policy' },
  { id: 'DM-RISK-001', name: 'Information Security Risk Register' },
];

const vendors = [
  { name: 'Hetzner Cloud',    service: 'Infrastructure',    compliance: 'ISO 27001, GDPR' },
  { name: 'Zitadel',          service: 'Identity & Auth',   compliance: 'GDPR, SOC 2' },
  { name: 'Stripe',           service: 'Payments (INT)',     compliance: 'PCI DSS Level 1' },
  { name: 'Razorpay',         service: 'Payments (INR)',     compliance: 'PCI DSS, RBI' },
  { name: 'OpenAI',           service: 'LLM (BYOK)',         compliance: 'SOC 2 Type II' },
  { name: 'Anthropic',        service: 'LLM (BYOK)',         compliance: 'SOC 2 Type II' },
  { name: 'Google (Gemini)',   service: 'LLM (BYOK)',         compliance: 'ISO 27001, SOC 2' },
  { name: 'Cloudflare Pages', service: 'Frontend CDN',       compliance: 'SOC 2, ISO 27001' },
  { name: 'GitHub',           service: 'Source / CI-CD',     compliance: 'SOC 2 Type II' },
];

function Section({ title, subtitle, children }) {
  return (
    <section style={{ padding: '64px 24px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
          {subtitle}
        </p>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: C.text, letterSpacing: '-0.5px', marginBottom: 40 }}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default function SecurityPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: C.navy, minHeight: '100vh', fontFamily: "'Montserrat', system-ui, sans-serif", color: C.text }}>

      {/* Hero */}
      <section style={{ padding: '96px 24px 64px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)', marginBottom: 24 }}>
            <Shield size={28} color={C.green} />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Security & Trust
          </h1>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>
            DecisionMesh is built for compliance-critical industries. We implement enterprise-grade security controls
            so your team can focus on governing AI — not worrying about data safety.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 16px' }}>
            <CheckCircle size={14} color={C.green} />
            <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>SOC 2 controls implemented · Pursuing Type II certification</span>
          </div>
        </div>
      </section>

      {/* Security Controls */}
      <Section title="Security Controls" subtitle="What We've Built">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {checks.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={C.green} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pen test results */}
      <Section title="Penetration Test Results" subtitle="June 2026">
        <div style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 32px', maxWidth: 600 }}>
          <p style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Tool: OWASP ZAP Baseline Scan · Target: api.decimeshi.com</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Critical Failures', value: '0', color: C.green },
              { label: 'Checks Passed', value: '66', color: C.green },
              { label: 'Warnings', value: '1', color: C.amber, note: 'False positive — intentional no-cache header' },
            ].map(({ label, value, color, note }) => (
              <div key={label}>
                <p style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{label}</p>
                {note && <p style={{ fontSize: 10, color: C.sub, marginTop: 2, fontStyle: 'italic' }}>{note}</p>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Compliance */}
      <Section title="Compliance Frameworks" subtitle="Regulatory">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700 }}>
          {frameworks.map(({ name, status, color, note }) => (
            <div key={name} style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{name}</p>
                <p style={{ fontSize: 12, color: C.sub }}>{note}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 99, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Policies */}
      <Section title="Policy Documents" subtitle="Documentation">
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24, maxWidth: 600 }}>
          All policies are available to enterprise customers under NDA. Contact us to request access.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {policies.map(({ id, name }) => (
            <div key={id} style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={14} color={C.blue} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, color: C.sub, fontFamily: 'monospace' }}>{id}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{name}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Infrastructure */}
      <Section title="Infrastructure & Vendors" subtitle="Supply Chain">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Vendor', 'Service', 'Compliance'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map(({ name, service, compliance }, i) => (
                <tr key={name} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(14,165,233,0.02)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: C.text }}>{name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{service}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.green }}>{compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Contact */}
      <section style={{ padding: '64px 24px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 12 }}>Security questions?</h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 32 }}>
            We're happy to share our security documentation, complete vendor questionnaires, and discuss our compliance posture with enterprise customers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:thiru@decimeshi.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blue, color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>
              Contact Security Team
            </a>
            <a href="mailto:security@decimeshi.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.blue, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', border: `1px solid ${C.blue}` }}>
              Report a Vulnerability
            </a>
          </div>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 24 }}>
            thiru@decimeshi.com · +91 9100493877 · security@decimeshi.com
          </p>
        </div>
      </section>

    </div>
  );
}
