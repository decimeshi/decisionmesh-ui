import { useAuth } from 'react-oidc-context';
import { useState, useEffect, useRef } from 'react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#020817',
  surface:   '#080f1e',
  border:    'rgba(255,255,255,0.07)',
  blue:      '#1e6fff',
  blueGlow:  'rgba(30,111,255,0.18)',
  amber:     '#f59e0b',
  red:       '#ef4444',
  green:     '#10b981',
  purple:    '#8b5cf6',
  cyan:      '#06b6d4',
  textPrimary: '#e2e8f0',
  textMuted:   '#64748b',
  textSub:     '#94a3b8',
  mono:        "'Courier New', monospace",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  ArrowRight: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  DollarSign: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  GitBranch: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ScrollText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>,
  RotateCcw: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>,
  AlertTriangle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ExternalLink: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  TrendingUp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Cpu: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  Star: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  UserCheck: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
};

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'DollarSign', title: 'Budget enforcement', desc: 'Set hard cost ceilings per intent. Execution stops the moment spend exceeds your limit — before the bill arrives.', color: '#22c55e' },
  { icon: 'GitBranch', title: 'Multi-adapter routing', desc: 'Route to OpenAI, Anthropic, Google, or Azure. Automatic fallback to the next adapter on timeout or failure.', color: '#3b82f6' },
  { icon: 'Shield', title: 'Policy governance', desc: 'Write rules like "cost > $0.01 → REJECT" or "latency > 5s → FALLBACK". Policies run before every execution.', color: '#a855f7' },
  { icon: 'Activity', title: 'Execution timeline', desc: 'Every phase — CREATED → PLANNING → EXECUTING → COMPLETED — recorded with cost, latency, and risk scores.', color: '#f59e0b' },
  { icon: 'RotateCcw', title: 'Decision replay', desc: 'Re-run any past intent with one click. Debug failures, compare model outputs, run regression tests against history.', color: '#10b981' },
  { icon: 'ScrollText', title: 'Compliance audit trail', desc: 'Every AI decision permanently logged — who triggered it, which model answered, what policy applied. SOC 2 & GDPR ready.', color: '#f43f5e' },
  { icon: 'UserCheck', title: 'Human-in-the-loop gates', desc: 'Pause any high-risk decision and require human approval before execution continues.', color: '#8b5cf6' },
  { icon: 'EyeOff', title: 'PII detection & masking', desc: 'Sensitive data detected and masked before reaching AI models. Names, emails, card numbers — none leave your boundary unprotected.', color: '#f97316' },
  { icon: 'Cpu', title: 'Model version tracking', desc: 'Know exactly which model version made which decision, forever. Never lose context after a provider update.', color: '#06b6d4' },
  { icon: 'TrendingUp', title: 'Drift detection', desc: 'Track model performance over time. Get alerted when an adapter starts behaving differently than expected.', color: '#ef4444' },
  { icon: 'Users', title: 'Multi-tenancy', desc: 'Full tenant isolation from day one. Each organisation has its own budget, policies, adapters, and audit log.', color: '#0ea5e9' },
  { icon: 'AlertTriangle', title: 'Hallucination detection', desc: 'Every AI response scored for faithfulness before delivery. High-risk outputs trigger fallback or human review.', color: '#f59e0b', badge: 'NEW' },
  { icon: 'Lock', title: 'Prompt injection protection', desc: 'Payloads scanned for injection patterns before execution reaches any model. Attacks blocked and logged.', color: '#ef4444', badge: 'NEW' },
  { icon: 'Star', title: 'Output quality scoring', desc: 'Every response gets an automated quality score — relevance, completeness, and tone. Retry poor outputs automatically.', color: '#a78bfa', badge: 'NEW' },
  { icon: 'Eye', title: 'Shadow AI gateway', desc: 'Replace ungoverned employee AI usage with a single enterprise gateway. Full visibility, approved models only.', color: '#14b8a6', badge: 'NEW' },
];

const PAIN_POINTS = [
  { emoji: '💸', title: 'Runaway AI costs', desc: 'A single prompt loop or misconfigured retry can drain thousands before anyone notices. There are no guardrails.' },
  { emoji: '🔇', title: 'Silent failures', desc: 'Your model returns garbage, times out, or hits rate limits. Your app fails. You find out from a user complaint.' },
  { emoji: '🕳️', title: 'Zero audit trail', desc: 'Who triggered that decision? What model answered? What did it cost? Nobody knows — and compliance asks anyway.' },
  { emoji: '🔁', title: "Can't reproduce AI failures", desc: "Something went wrong last Tuesday. You have no way to re-run it, compare outputs, or prove what happened." },
  { emoji: '🔓', title: 'Sensitive data leaking', desc: 'Customer emails, card numbers, health records — flowing raw into third-party AI APIs with no masking, no controls.' },
  { emoji: '🤥', title: 'AI that confidently lies', desc: 'Your model invents a legal citation, fabricates a drug dosage, or makes up a policy. You shipped it to production.' },
  { emoji: '🕵️', title: 'Shadow AI everywhere', desc: 'Over 90% of employees use personal AI accounts for work. Your confidential data is in ChatGPT right now.' },
  { emoji: '💉', title: 'Prompt injection attacks', desc: 'A malicious input overrides your system prompt. The AI then follows the attacker instructions, not yours.' },
];

const INDUSTRIES = [
  { emoji: '🏦', name: 'Fintech & Banking', desc: 'Banks, insurers, and fintech companies need model risk management, fair lending compliance, and explainability.', usecases: ['Credit scoring with fairness checks', 'Fraud detection with audit trails', 'Loan underwriting with bias detection', 'Investment recommendations with explainability'], tags: ['Fair Lending', 'Model Risk', 'ECOA', 'FCRA'] },
  { emoji: '🏥', name: 'Healthcare', desc: 'Hospitals and health systems require clinical decision traceability, patient safety, and HIPAA compliance.', usecases: ['Clinical decision support with audit trails', 'Diagnostic assistance with explainability', 'Patient triage with safety checks', 'Treatment recommendations with oversight'], tags: ['HIPAA', 'FDA', 'PHI Protection', 'Patient Safety'] },
  { emoji: '🛡️', name: 'Insurance', desc: 'Insurers need fairness assurance, rate justification, and transparent underwriting decisions.', usecases: ['Claims processing with explanation', 'Risk assessment with bias mitigation', 'Fraud detection with transparency', 'Pricing models with auditability'], tags: ['Fair Pricing', 'Anti-Discrimination', 'State Regulations'] },
  { emoji: '⚖️', name: 'Legal Services', desc: 'Law firms need document review, legal research, and contract analysis with attorney oversight.', usecases: ['Document review with verification', 'Legal research with source tracking', 'Contract analysis with human review', 'Discovery assistance with oversight'], tags: ['Attorney Oversight', 'Source Tracking', 'Privilege Protection'] },
  { emoji: '🏛️', name: 'Government', desc: 'Public sector agencies need transparency, accountability, and democratic oversight of automated decisions.', usecases: ['Benefits determination with explainability', 'Risk assessment with bias audits', 'Resource allocation with transparency', 'Citizen services with accountability'], tags: ['Transparency', 'FOIA Ready', 'Democratic Oversight'] },
  { emoji: '🏢', name: 'Enterprise SaaS', desc: 'Software companies embedding AI features need governance at scale without slowing development.', usecases: ['Content generation with safety guardrails', 'Customer support automation with oversight', 'Data analysis with cost controls', 'Personalization with privacy protection'], tags: ['Fast Deployment', 'Multi-Tenant', 'Centralized Governance'] },
];

const COMPLIANCE_FRAMEWORKS = [
  { name: 'EU AI Act', color: '#3b82f6', icon: '🇪🇺', desc: 'Complete traceability, human oversight capabilities, documentation generation, and risk assessment support.', note: 'Consult legal counsel for specific requirements.' },
  { name: 'SOC 2', color: '#10b981', icon: '🔒', desc: 'Access control documentation, change management records, monitoring evidence, and security policy enforcement.', note: null },
  { name: 'GDPR', color: '#a855f7', icon: '🛡️', desc: 'Processing records (Article 30), explanation capabilities (Article 22), privacy by design, data residency controls.', note: null },
  { name: 'HIPAA', color: '#f59e0b', icon: '🏥', desc: 'PHI access logging, authorization tracking, de-identification support, and breach detection tools.', note: 'HIPAA compliance requires BAA and additional controls.' },
];

const PLANS = [
  { key: 'free', name: 'Free', price: 'Free', note: '500 one-time credits', color: '#64748b', checkColor: '#22c55e', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', cta: 'Get started free', features: ['500 credits (one-time)', '2 adapters', 'Budget enforcement', 'Basic audit (30 days)', 'Community support'] },
  { key: 'hobby', name: 'Hobby', price: 'Free', note: '2k credits/mo', color: '#94a3b8', checkColor: '#94a3b8', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', cta: 'Start Hobby', features: ['2,000 credits/month', '3 adapters', 'Full audit (90 days)', 'Email support'] },
  { key: 'builder', name: 'Builder', price: '$19', interval: '/mo', note: '15k credits/mo', color: '#1e6fff', checkColor: '#60a5fa', popular: true, bg: 'linear-gradient(135deg, rgba(30,111,255,0.12), rgba(124,58,237,0.12))', border: 'rgba(30,111,255,0.35)', cta: 'Upgrade to Builder', features: ['15,000 credits/month', 'All adapters', 'Policy builder', 'Decision replay', 'Full audit + CSV export', 'Drift detection', 'Priority support'] },
  { key: 'pro', name: 'Pro', price: '$49', interval: '/mo', note: '60k credits/mo', color: '#4f46e5', checkColor: '#818cf8', bg: 'rgba(255,255,255,0.03)', border: 'rgba(79,70,229,0.28)', cta: 'Upgrade to Pro', features: ['60,000 credits/month', 'Multi-tenancy', '5 team seats', 'SSO / SAML', 'Human-in-the-loop gates', 'Priority support'] },
  { key: 'enterprise', name: 'Enterprise', price: 'Custom', note: 'Unlimited', color: '#7c3aed', checkColor: '#c4b5fd', bg: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(244,63,94,0.07))', border: 'rgba(139,92,246,0.28)', topBar: 'linear-gradient(90deg, #8b5cf6, #f43f5e)', cta: 'Contact sales', ctaHref: 'mailto:sales@decisionmesh.io', features: ['Unlimited credits', 'PII detection & masking', 'Model version tracking', 'Immutable signed audit log', 'GDPR data residency', 'HIPAA / PCI-DSS templates', 'BYOK', 'Dedicated SLA'] },
];

// ── NavBar ────────────────────────────────────────────────────────────────────
function NavBar({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const link = { color: '#94a3b8', fontSize: 14, textDecoration: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent', backdropFilter: 'blur(16px)', backgroundColor: scrolled ? 'rgba(2,8,23,0.95)' : 'rgba(2,8,23,0.5)', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 58 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
          <img src="/decimeshi-icon.svg" alt="DecisionMesh"
            style={{ width: 42, height: 42, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #f1f5f9 0%, #f1f5f9 54%, #3b82f6 55%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>DecisionMesh</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 1 }}>AI Control Plane</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.blue, background: 'rgba(30,111,255,0.12)', border: '1px solid rgba(30,111,255,0.28)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.8px' }}>BETA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden-mobile">
          <a href="#features" style={link} onMouseEnter={e => e.target.style.color='#e2e8f0'} onMouseLeave={e => e.target.style.color='#94a3b8'}>Product</a>
          <a href="#platform" style={link} onMouseEnter={e => e.target.style.color='#e2e8f0'} onMouseLeave={e => e.target.style.color='#94a3b8'}>Platform</a>

          <div style={{ position: 'relative' }} onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
            <button style={link} onMouseEnter={e => e.currentTarget.style.color='#e2e8f0'} onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>Solutions <Icon.ChevronDown /></button>
            {solutionsOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: 8, minWidth: 210, boxShadow: '0 20px 48px rgba(0,0,0,0.6)' }}>
                {[{ label: 'For Engineers', anchor: '#engineers' }, { label: 'For Executives', anchor: '#executives' }, { label: 'For Compliance & Regulators', anchor: '#compliance' }].map(({ label, anchor }) => (
                  <a key={label} href={anchor} style={{ display: 'block', color: '#cbd5e1', fontSize: 14, textDecoration: 'none', padding: '9px 12px', borderRadius: 7, transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(30,111,255,0.1)'; e.target.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#cbd5e1'; }}>{label}</a>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} onMouseEnter={() => setIndustriesOpen(true)} onMouseLeave={() => setIndustriesOpen(false)}>
            <button style={link} onMouseEnter={e => e.currentTarget.style.color='#e2e8f0'} onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>Industries <Icon.ChevronDown /></button>
            {industriesOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: 8, minWidth: 190, boxShadow: '0 20px 48px rgba(0,0,0,0.6)' }}>
                {['🏦 Fintech & Banking', '🏥 Healthcare', '🛡️ Insurance', '⚖️ Legal Services', '🏛️ Government', '🏢 Enterprise SaaS'].map(label => (
                  <a key={label} href="#industries" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, textDecoration: 'none', padding: '9px 12px', borderRadius: 7, transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(30,111,255,0.1)'; e.target.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#cbd5e1'; }}>{label}</a>
                ))}
              </div>
            )}
          </div>

          <a href="#pricing" style={link} onMouseEnter={e => e.target.style.color='#e2e8f0'} onMouseLeave={e => e.target.style.color='#94a3b8'}>Pricing</a>
          <a href="/docs" target="_blank" style={{ ...link, display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color='#e2e8f0'} onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>Docs <Icon.ExternalLink /></a>
          <a href="/blog" style={link} onMouseEnter={e => e.target.style.color='#e2e8f0'} onMouseLeave={e => e.target.style.color='#94a3b8'}>Blog</a>

          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
          <button onClick={onLogin} style={{ ...link, fontWeight: 500 }} onMouseEnter={e => e.target.style.color='#e2e8f0'} onMouseLeave={e => e.target.style.color='#94a3b8'}>Sign in</button>
          <button onClick={onRegister} style={{ background: C.blue, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', letterSpacing: '-0.2px', transition: 'background 0.15s' }}
            onMouseEnter={e => e.target.style.background='#1557d6'} onMouseLeave={e => e.target.style.background=C.blue}>
            Get started free
          </button>
        </div>

        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} className="show-mobile">
          {open ? <Icon.X /> : <Icon.Menu />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10, background: '#020817' }}>
          {[['#features', 'Product'], ['#platform', 'Platform'], ['#industries', 'Industries'], ['#compliance', 'Compliance'], ['#pricing', 'Pricing'], ['/docs', 'Docs']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} style={{ color: '#cbd5e1', fontSize: 15, textDecoration: 'none', padding: '6px 0' }}>{label}</a>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
          <button onClick={onLogin} style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, cursor: 'pointer', fontSize: 15 }}>Sign in</button>
          <button onClick={onRegister} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Get started free</button>
        </div>
      )}
    </nav>
  );
}

// ── Hero — "The Control Room" ──────────────────────────────────────────────────
function Hero({ onRegister, onLogin }) {
  // Live ticker data
  const tickerEvents = [
    { id: 'int-8f3a', type: 'CREDIT_DECISION', org: 'FinBank Corp', status: 'GOVERNED', cost: '$0.0031', policy: 'fair-lending-v2', time: '09:41:07' },
    { id: 'int-2c9d', type: 'PATIENT_TRIAGE', org: 'HealthSys LLC', status: 'HUMAN_GATE', cost: '$0.0089', policy: 'hipaa-pii-check', time: '09:41:06' },
    { id: 'int-7e1b', type: 'LEGAL_REVIEW', org: 'LexCorp', status: 'GOVERNED', cost: '$0.0044', policy: 'attorney-oversight', time: '09:41:05' },
    { id: 'int-4a6f', type: 'FRAUD_DETECT', org: 'InsureTech', status: 'BLOCKED', cost: '$0.0000', policy: 'cost-limit-v1', time: '09:41:04' },
    { id: 'int-1d8c', type: 'CHAT_SUPPORT', org: 'SaaS Co', status: 'GOVERNED', cost: '$0.0012', policy: 'shadow-ai-gate', time: '09:41:03' },
    { id: 'int-9b2e', type: 'COMPLIANCE_RPT', org: 'RegCorp Gov', status: 'GOVERNED', cost: '$0.0067', policy: 'soc2-audit-trail', time: '09:41:02' },
  ];

  // Problem cards (left side — the chaos)
  const problemCards = [
    { role: 'Government Regulator', org: 'EU Financial Authority', issue: '"Why did your AI deny this loan application? Show me the decision trail."', color: C.amber, emoji: '🏛️', delay: '0s' },
    { role: 'Compliance Officer', org: 'National Bank', issue: 'Audit request received. AI decision log: NOT FOUND. Response deadline: 72 hours.', color: C.red, emoji: '⚖️', delay: '0.4s' },
    { role: 'CISO', org: 'Healthcare System', issue: 'BREACH ALERT: Patient PHI sent to third-party AI API without masking. Records exposed: 4,821.', color: C.red, emoji: '🔓', delay: '0.8s' },
    { role: 'CFO', org: 'Enterprise Co', issue: 'Monthly AI spend: $47,832. Budgeted: $8,000. No cost controls in place.', color: C.amber, emoji: '💸', delay: '1.2s' },
  ];

  // Resolution cards (right side — governed outcomes)
  const resolvedCards = [
    { title: 'Decision Explained', detail: 'int-8f3a · CREDIT_DECISION · 14 policy checks passed · Full audit trail generated', color: C.green, emoji: '✓', delay: '0.2s' },
    { title: 'Audit Trail Ready', detail: '48,291 events logged · Immutable · Signed · One-click export for regulators', color: C.green, emoji: '✓', delay: '0.6s' },
    { title: 'PII Protected', detail: '3 fields masked before reaching OpenAI · HIPAA compliant · Zero exposure', color: C.cyan, emoji: '✓', delay: '1.0s' },
    { title: 'Budget Enforced', detail: 'Spend: $0.0031 / $0.01 limit · 14 intents blocked today · Zero overspend', color: C.green, emoji: '✓', delay: '1.4s' },
  ];

  // Pipeline stages
  const pipeline = [
    { label: 'INTENT', color: C.blue },
    { label: 'VALIDATE', color: '#6366f1' },
    { label: 'POLICY', color: C.amber },
    { label: 'DECIDE', color: C.green },
    { label: 'EXECUTE', color: C.cyan },
    { label: 'AUDIT', color: C.purple },
  ];

  return (
    <section style={{
      minHeight: '100vh',
      background: C.bg,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Blueprint grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(30,111,255,0.09) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,111,255,0.09) 1px, transparent 1px),
          linear-gradient(rgba(30,111,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,111,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 16px 16px, 16px 16px',
      }} />

      {/* Radial glow — center */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse at center, rgba(30,111,255,0.10) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Bottom gradient to next section */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 2 }} />

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes flow-pulse {
          0%   { opacity: 0.3; }
          50%  { opacity: 1; }
          100% { opacity: 0.3; }
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scan-line {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* Scan line */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(30,111,255,0.35), transparent)', animation: 'scan-line 8s linear infinite', pointerEvents: 'none', zIndex: 1 }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1280, margin: '0 auto', padding: '100px 24px 0', width: '100%' }}>

        {/* Three-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1.4fr 32px 1fr', gap: 0, alignItems: 'stretch', minHeight: '70vh' }} className="hero-grid">

          {/* LEFT — Problem cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.red, letterSpacing: '1.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulse-dot 1.5s ease infinite' }} />
              UNRESOLVED INCIDENTS
            </div>
            {problemCards.map((card, i) => (
              <div key={i} style={{
                background: `${C.surface}cc`,
                border: `1px solid ${card.color}55`,
                borderLeft: `3px solid ${card.color}`,
                borderRadius: 10,
                padding: '14px 16px',
                animation: `slideInLeft 0.6s ease both`,
                animationDelay: card.delay,
                backdropFilter: 'blur(8px)',
              }}>
                {/* Corner brackets */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{card.emoji}</span>
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700 }}>{card.role}</div>
                      <div style={{ color: C.textMuted, fontSize: 11, fontFamily: C.mono }}>{card.org}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: card.color, display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
                      <span style={{ fontSize: 10, color: card.color, fontFamily: C.mono, fontWeight: 700 }}>OPEN</span>
                    </div>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.55, fontStyle: 'italic' }}>"{card.issue}"</p>
                </div>
              </div>
            ))}
          </div>

          {/* LEFT→CENTER CONNECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15% 0', gap: 0 }} className="hero-connector">
            <div style={{ flex: 1, width: 1, minHeight: 40, background: 'linear-gradient(to bottom, transparent, rgba(239,68,68,0.55))' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.7)' }} />
              <div style={{ width: 1, height: 12, background: 'linear-gradient(to bottom, rgba(239,68,68,0.6), rgba(30,111,255,0.6))' }} />
              <div style={{ fontSize: 14, color: 'rgba(30,111,255,0.85)', fontWeight: 700, lineHeight: 1 }}>›</div>
              <div style={{ width: 1, height: 12, background: 'linear-gradient(to bottom, rgba(30,111,255,0.6), rgba(30,111,255,0.3))' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(30,111,255,0.5)' }} />
            </div>
            <div style={{ flex: 1, width: 1, minHeight: 40, background: 'linear-gradient(to bottom, rgba(30,111,255,0.4), transparent)' }} />
          </div>

          {/* CENTER — Hero content + pipeline */}
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.7s ease both', animationDelay: '0.1s' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(30,111,255,0.1)', border: '1px solid rgba(30,111,255,0.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue, display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ color: '#93c5fd', fontSize: 12, fontWeight: 600 }}>Now in beta — free for early adopters</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.08, letterSpacing: '-2.5px', marginBottom: 18 }}>
              The AI Intent{' '}
              <span style={{ background: `linear-gradient(135deg, #60a5fa, #a78bfa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>
                Control Plane
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px', fontWeight: 400 }}>
              Every AI decision — governed, audited, replayed, and compliant. Built for regulators, compliance teams, engineers, and executives.
            </p>

            {/* Compliance badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
              {['SOC 2 Ready', 'GDPR', 'EU AI Act', 'HIPAA Aware'].map(tag => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', fontFamily: C.mono, letterSpacing: '0.3px' }}>{tag}</span>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 44 }}>
              <button onClick={onRegister} style={{ background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 9, padding: '13px 26px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.2px', transition: 'background 0.15s, transform 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1557d6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'none'; }}>
                Start for free <Icon.ArrowRight />
              </button>
              <button onClick={onLogin} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '13px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                Sign in
              </button>
            </div>

            {/* Decision Pipeline */}
            <div style={{ background: `${C.surface}dd`, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, letterSpacing: '1.5px', marginBottom: 14, textAlign: 'left' }}>
                DECISION LIFECYCLE — EVERY AI REQUEST
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                {pipeline.map((stage, i) => (
                  <div key={stage.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${stage.color}40`, background: `${stage.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', animation: `flow-pulse 2.5s ease infinite`, animationDelay: `${i * 0.3}s` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, opacity: 0.9 }} />
                      </div>
                      <div style={{ fontFamily: C.mono, fontSize: 8, color: stage.color, letterSpacing: '0.8px', fontWeight: 700 }}>{stage.label}</div>
                    </div>
                    {i < pipeline.length - 1 && (
                      <div style={{ width: 20, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${stage.color}cc, ${pipeline[i+1].color}cc)`, flexShrink: 0, alignSelf: 'center', marginBottom: 18 }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: '#10b981', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                Processing: 1,240 intents/min · 0 unaudited · 100% governed
              </div>
            </div>
          </div>

          {/* CENTER→RIGHT CONNECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15% 0', gap: 0 }} className="hero-connector">
            <div style={{ flex: 1, width: 1, minHeight: 40, background: 'linear-gradient(to bottom, transparent, rgba(30,111,255,0.55))' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(30,111,255,0.7)' }} />
              <div style={{ width: 1, height: 12, background: 'linear-gradient(to bottom, rgba(30,111,255,0.6), rgba(16,185,129,0.6))' }} />
              <div style={{ fontSize: 14, color: 'rgba(16,185,129,0.85)', fontWeight: 700, lineHeight: 1 }}>›</div>
              <div style={{ width: 1, height: 12, background: 'linear-gradient(to bottom, rgba(16,185,129,0.6), rgba(16,185,129,0.3))' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(16,185,129,0.5)' }} />
            </div>
            <div style={{ flex: 1, width: 1, minHeight: 40, background: 'linear-gradient(to bottom, rgba(16,185,129,0.4), transparent)' }} />
          </div>

          {/* RIGHT — Resolution cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.green, letterSpacing: '1.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulse-dot 1.5s ease infinite' }} />
              RESOLVED BY DECISIONMESH
            </div>
            {resolvedCards.map((card, i) => (
              <div key={i} style={{
                background: `${C.surface}cc`,
                border: `1px solid ${card.color}55`,
                borderLeft: `3px solid ${card.color}`,
                borderRadius: 10,
                padding: '14px 16px',
                animation: 'slideInRight 0.6s ease both',
                animationDelay: card.delay,
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${card.color}18`, border: `1.5px solid ${card.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{card.emoji}</div>
                  <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700 }}>{card.title}</div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontSize: 10, color: card.color, fontFamily: C.mono, fontWeight: 700, background: `${card.color}15`, padding: '2px 7px', borderRadius: 4 }}>RESOLVED</span>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: 11, lineHeight: 1.55, fontFamily: C.mono }}>{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live decision ticker */}
        <div style={{ position: 'relative', marginTop: 40, marginBottom: 0, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${C.bg}, transparent)`, zIndex: 2 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(-90deg, ${C.bg}, transparent)`, zIndex: 2 }} />
          <div style={{ display: 'flex', gap: 32, animation: 'ticker-scroll 22s linear infinite', width: 'max-content' }}>
            {[...tickerEvents, ...tickerEvents].map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: '#4b5563' }}>{ev.time}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '1px 6px' }}>{ev.id}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{ev.type}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{ev.org}</span>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: C.mono, color: ev.status === 'BLOCKED' ? C.amber : ev.status === 'HUMAN_GATE' ? C.purple : C.green, background: ev.status === 'BLOCKED' ? 'rgba(245,158,11,0.1)' : ev.status === 'HUMAN_GATE' ? 'rgba(139,92,246,0.1)' : 'rgba(16,185,129,0.1)', borderRadius: 4, padding: '1px 7px' }}>
                  {ev.status}
                </span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: '#4b5563' }}>{ev.cost}</span>
                <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.18)', margin: '0 4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pain Points ───────────────────────────────────────────────────────────────
function PainSection() {
  return (
    <section style={{ background: C.bg, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 12 }}>AI without governance is a liability</h2>
        <p style={{ color: C.textMuted, fontSize: 16, marginBottom: 48 }}>Every team shipping AI faces the same problems. Here are the most expensive ones.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {PAIN_POINTS.map(({ emoji, title, desc }) => (
            <div key={title} style={{ background: C.surface, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px 20px', textAlign: 'left', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(30,111,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{emoji}</div>
              <h3 style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 16, marginBottom: 7 }}>{title}</h3>
              <p style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Platform ──────────────────────────────────────────────────────────────────
function Platform() {
  return (
    <section id="platform" style={{ background: C.surface, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10, fontFamily: C.mono }}>Platform Architecture</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 12 }}>How the control plane works</h2>
          <p style={{ color: C.textMuted, fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
            DecisionMesh separates AI governance from AI execution. The Control Plane decides what should happen. The Execution Plane carries it out.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 48 }}>
          {[
            { title: 'Control Plane', color: C.blue, icon: '🎯', items: ['Intent intake — receive and validate AI requests', 'Planning — determine how to fulfill the intent', 'Policy enforcement — apply governance rules', 'Decision recording — create immutable audit trail', 'Lifecycle management — track decision state'], tags: ['Deterministic', 'Replayable', 'Auditable', 'Policy-Driven'] },
            { title: 'Execution Plane', color: C.green, icon: '⚡', items: ['LLM calls — execute approved prompts', 'Adapter routing — select and fallback across models', 'Tool integration — connect to databases and APIs', 'Result aggregation — combine outputs', 'Execution reporting — report outcomes back'], tags: ['Isolated', 'Pluggable', 'Observable', 'Fault-Tolerant'] },
          ].map(({ title, color, icon, items, tags }) => (
            <div key={title} style={{ background: C.bg, border: `1px solid ${color}20`, borderRadius: 14, padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18 }}>{title}</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(tag => <span key={tag} style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 999, padding: '3px 10px', fontFamily: C.mono, letterSpacing: '0.3px' }}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* 6-stage lifecycle */}
        <div style={{ background: C.bg, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Decision Lifecycle</h3>
          <p style={{ color: C.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 32, fontFamily: C.mono }}>Every AI request flows through 6 auditable stages — nothing skipped, nothing hidden</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {[
              { step: '01', phase: 'INTENT', desc: 'App declares a goal — not a raw prompt. Who, what, constraints, budget.', color: C.blue },
              { step: '02', phase: 'VALIDATE', desc: 'Schema validation, permission checks, malformed requests rejected immediately.', color: '#6366f1' },
              { step: '03', phase: 'POLICY', desc: 'Every configured rule runs — cost limits, PII checks, safety constraints.', color: C.amber },
              { step: '04', phase: 'DECIDE', desc: 'Tamper-proof decision record written with full context and identity.', color: C.green },
              { step: '05', phase: 'EXECUTE', desc: 'Approved request routes to selected adapter. Auto-fallback on failure.', color: C.cyan },
              { step: '06', phase: 'AUDIT', desc: 'Cost, latency, quality score, and drift metrics recorded. Forever replayable.', color: C.purple },
            ].map(({ step, phase, desc, color }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}12`, border: `1.5px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color, fontFamily: C.mono, fontWeight: 800, fontSize: 13 }}>{step}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6, fontFamily: C.mono }}>{phase}</div>
                <p style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{ background: '#f8fafc', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>Features</p>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-1px', marginBottom: 12 }}>Everything your AI needs to behave</h2>
        <p style={{ color: '#64748b', fontSize: 16, marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>Built for production — not prototypes.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16 }}>
          {FEATURES.map(({ icon, title, desc, color, badge }) => {
            const IC = Icon[icon];
            return (
              <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, textAlign: 'left', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${color}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><IC /></div>
                  {badge && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', color, background: `${color}14`, border: `1px solid ${color}35`, borderRadius: 4, padding: '2px 6px' }}>{badge}</span>}
                </div>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 15, marginBottom: 7 }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Audiences ─────────────────────────────────────────────────────────────────
function Audiences() {
  const [active, setActive] = useState('engineers');
  const tabs = [
    { id: 'engineers', label: 'For Engineers', color: '#3b82f6' },
    { id: 'executives', label: 'For Executives', color: C.green },
    { id: 'compliance', label: 'For Compliance & Regulators', color: '#f43f5e' },
  ];
  const content = {
    engineers: { headline: 'Build AI features without worrying about governance', sub: 'Submit intents via REST API — one endpoint, full control plane. No custom guardrails to build or maintain.', color: '#3b82f6', points: [{ title: 'Deterministic behaviour', desc: 'Every decision reproducible. No hidden state. Time-travel debugging and regression testing with historical data.' }, { title: 'Observability built-in', desc: 'Distributed tracing for decisions, detailed execution logs, performance metrics, and cost attribution per request.' }, { title: 'Centralised policy', desc: 'Define governance rules once, apply everywhere. Version-controlled. Test policies before deployment.' }, { title: 'SDK-ready event stream', desc: 'Real-time execution timeline for every intent. Kafka and webhook integrations out of the box.' }] },
    executives: { headline: 'Full AI spend visibility and risk control across the organisation', sub: 'Can you prove your AI behaved responsibly when a regulator, customer, or lawyer asks? DecisionMesh makes that answer instant.', color: C.green, points: [{ title: 'Real-time cost dashboard', desc: 'Know what AI is spending today, by team, by project. Budget enforcement prevents overruns before they happen.' }, { title: 'Regulatory risk mitigation', desc: 'EU AI Act fines up to €35M or 7% revenue. DecisionMesh provides documentation to defend every AI decision.' }, { title: 'Risk exposure scores', desc: 'Every AI decision carries a risk score. High-risk decisions trigger human-in-the-loop review automatically.' }, { title: 'Multi-tenant isolation', desc: 'Each team, product, or client completely separate. Budget, policies, adapters, and audit logs isolated by tenant.' }] },
    compliance: { headline: 'Every AI decision is explainable, exportable, and auditable', sub: 'Built for compliance teams and regulators who need to verify AI systems are operating within rules — not just promised they are.', color: '#f43f5e', points: [{ title: 'Immutable signed audit log', desc: 'Tamper-proof by design. Every intent, policy evaluation, adapter call, and cost permanently recorded with full context.' }, { title: 'PII detection and masking', desc: 'Sensitive data detected and masked before reaching any AI model. None leave your boundary unprotected.' }, { title: 'One-click CSV export', desc: 'Filter by user, action, entity, or date. Export audit log for compliance reviews and regulatory submissions.' }, { title: 'GDPR data residency', desc: 'Control where data is processed per tenant. Article 30 records, Article 22 explanation capabilities.' }] },
  };
  const c = content[active];

  return (
    <section id="engineers" style={{ background: C.bg, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10, fontFamily: C.mono }}>Built for every stakeholder</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px' }}>One platform, every team</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', background: active === tab.id ? `${tab.color}15` : 'transparent', borderColor: active === tab.id ? `${tab.color}45` : 'rgba(255,255,255,0.08)', color: active === tab.id ? tab.color : C.textMuted }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ background: `${c.color}07`, border: `1px solid ${c.color}18`, borderRadius: 18, padding: '36px 32px' }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(18px, 2.5vw, 26px)', lineHeight: 1.3, marginBottom: 10, maxWidth: 600 }}>{c.headline}</h3>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.65, marginBottom: 32, maxWidth: 560 }}>{c.sub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {c.points.map(({ title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h4 style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{title}</h4>
                </div>
                <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Compliance ────────────────────────────────────────────────────────────────
function Compliance() {
  return (
    <section id="compliance" style={{ background: C.surface, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: '#f43f5e', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10, fontFamily: C.mono }}>Compliance & Regulations</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 12 }}>Built for a regulated AI world</h2>
          <p style={{ color: C.textMuted, fontSize: 15, maxWidth: 520, margin: '0 auto 10px' }}>The tools, documentation, and audit trails organisations need to prepare for regulatory compliance across every major framework.</p>
          <p style={{ color: '#374151', fontSize: 12, maxWidth: 480, margin: '0 auto', fontStyle: 'italic', fontFamily: C.mono }}>Note: Certification requires consultation with qualified legal counsel and varies by jurisdiction.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 48 }}>
          {COMPLIANCE_FRAMEWORKS.map(({ name, color, icon, desc, note }) => (
            <div key={name} style={{ background: C.bg, border: `1px solid ${color}20`, borderRadius: 14, padding: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><span style={{ fontSize: 24 }}>{icon}</span><h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 17 }}>{name}</h3></div>
              <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.65, marginBottom: note ? 10 : 0 }}>{desc}</p>
              {note && <p style={{ color: C.textMuted, fontSize: 11, fontStyle: 'italic', borderTop: `1px solid ${color}18`, paddingTop: 10, fontFamily: C.mono }}>{note}</p>}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.14)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, marginBottom: 22, textAlign: 'center' }}>What regulators and auditors get</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {['Complete decision traceability — every AI call logged', 'Immutable, signed audit logs — tamper-proof by design', 'PII detection and masking before data reaches models', 'Human oversight gates on high-risk decisions', 'One-click evidence packages for auditors', 'GDPR data residency controls per tenant', 'Policy version history — track governance changes', 'Risk scores on every AI decision — no black boxes'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Industries ────────────────────────────────────────────────────────────────
function Industries() {
  const [active, setActive] = useState(0);
  const ind = INDUSTRIES[active];
  return (
    <section id="industries" style={{ background: C.bg, padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10, fontFamily: C.mono }}>Industries</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 12 }}>Built for regulated industries</h2>
          <p style={{ color: C.textMuted, fontSize: 15, maxWidth: 480, margin: '0 auto' }}>DecisionMesh adapts to industry-specific regulations, compliance requirements, and operational needs.</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {INDUSTRIES.map((ind, i) => (
            <button key={ind.name} onClick={() => setActive(i)} style={{ padding: '7px 15px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', background: active === i ? 'rgba(30,111,255,0.12)' : 'transparent', borderColor: active === i ? 'rgba(30,111,255,0.38)' : 'rgba(255,255,255,0.07)', color: active === i ? '#60a5fa' : C.textMuted }}>{ind.emoji} {ind.name}</button>
          ))}
        </div>
        <div style={{ background: C.surface, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 44, marginBottom: 14 }}>{ind.emoji}</div>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>{ind.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{ind.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ind.tags.map(tag => <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(30,111,255,0.1)', border: '1px solid rgba(30,111,255,0.22)', borderRadius: 999, padding: '3px 11px', fontFamily: C.mono }}>{tag}</span>)}
            </div>
          </div>
          <div>
            <h4 style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 14, fontFamily: C.mono }}>Use Cases</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ind.usecases.map(uc => (
                <div key={uc} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(30,111,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.55 }}>{uc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ color: '#374151', fontSize: 11, textAlign: 'center', marginTop: 16, fontStyle: 'italic', fontFamily: C.mono }}>Specific outcomes and compliance certifications vary by implementation. Contact us to discuss your requirements.</p>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section style={{ background: C.surface, padding: '52px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 28, textAlign: 'center' }}>
        {[{ value: '< 50ms', label: 'orchestration overhead' }, { value: '15', label: 'built-in features' }, { value: '100%', label: 'audit coverage' }, { value: '1-click', label: 'decision replay' }, { value: 'SOC 2', label: 'ready architecture' }, { value: 'GDPR', label: 'compliant by design' }].map(({ value, label }) => (
          <div key={label}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 4, fontFamily: C.mono }}>{value}</div>
            <div style={{ color: C.textMuted, fontSize: 12 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing({ onRegister }) {
  return (
    <section id="pricing" style={{ background: C.bg, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10, fontFamily: C.mono }}>Pricing</p>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 10 }}>Simple, transparent pricing</h2>
        <p style={{ color: C.textMuted, fontSize: 16, marginBottom: 48 }}>Start free. Scale when you're ready.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: 12, alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 14, padding: '24px 20px', textAlign: 'left', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {plan.topBar && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: plan.topBar }} />}
              {plan.popular && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: C.blue, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: '0 0 7px 7px', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>★ MOST POPULAR</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, marginTop: plan.popular ? 10 : 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: plan.color }} />
                <p style={{ color: plan.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: C.mono }}>{plan.name}</p>
              </div>
              <div style={{ marginBottom: 2 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-2px', lineHeight: 1 }}>{plan.price}</span>
                {plan.interval && <span style={{ color: C.textMuted, fontSize: 13, marginLeft: 2 }}>{plan.interval}</span>}
              </div>
              <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, marginBottom: 16, fontFamily: C.mono }}>{plan.note}</p>
              <div style={{ flex: 1, marginBottom: 18 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
                    <div style={{ color: plan.checkColor, flexShrink: 0, marginTop: 1 }}><Icon.Check /></div>
                    <span style={{ color: '#cbd5e1', fontSize: 12.5, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              {plan.ctaHref ? (
                <a href={plan.ctaHref} style={{ display: 'block', textAlign: 'center', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, textDecoration: 'none', background: `${plan.color}14`, color: plan.checkColor, border: `1px solid ${plan.color}28`, transition: 'background 0.15s' }}>{plan.cta}</a>
              ) : (
                <button onClick={onRegister} style={{ width: '100%', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: plan.popular ? C.blue : 'rgba(255,255,255,0.06)', color: '#fff', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.09)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = plan.popular ? '#1557d6' : 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = plan.popular ? C.blue : 'rgba(255,255,255,0.06)'}>
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
        <p style={{ color: '#374151', fontSize: 12, marginTop: 24, fontFamily: C.mono }}>Payments processed securely by Stripe · Cancel anytime · No hidden fees</p>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA({ onRegister }) {
  return (
    <section style={{ background: `linear-gradient(135deg, #0f1e4a 0%, #0f0a2e 50%, ${C.bg} 100%)`, padding: '80px 24px', textAlign: 'center', borderTop: '1px solid rgba(30,111,255,0.15)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1.5px', marginBottom: 12 }}>Ship AI you can explain</h2>
        <p style={{ color: '#93c5fd', fontSize: 17, marginBottom: 36, lineHeight: 1.65 }}>Join teams who've stopped guessing and started governing their AI.</p>
        <button onClick={onRegister} style={{ background: '#fff', color: '#0f172a', fontSize: 16, fontWeight: 800, border: 'none', borderRadius: 10, padding: '14px 32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.3px', transition: 'transform 0.1s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#fff'; }}>
          Create your free account <Icon.ArrowRight />
        </button>
        <p style={{ color: '#374151', fontSize: 12, marginTop: 14, fontFamily: C.mono }}>No credit card required.</p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const col = (title, links) => (
    <div key={title}>
      <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: C.mono }}>{title}</p>
      {links.map(({ label, href, ext }) => (
        <a key={label} href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}
          style={{ display: 'block', color: C.textMuted, fontSize: 13, textDecoration: 'none', marginBottom: 9, transition: 'color 0.15s' }}
          onMouseEnter={e => e.target.style.color = '#94a3b8'}
          onMouseLeave={e => e.target.style.color = C.textMuted}>{label}</a>
      ))}
    </div>
  );

  return (
    <footer style={{ background: '#020712', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 28px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, marginBottom: 44 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src="/decimeshi-icon.svg" alt="DecisionMesh" style={{ width: 34, height: 34, flexShrink: 0 }} />
              <div>
                <div style={{
                  fontWeight: 900, fontSize: 16, letterSpacing: '-0.4px',
                  background: 'linear-gradient(90deg, #f1f5f9 0%, #f1f5f9 54%, #3b82f6 55%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>DecisionMesh</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>AI Control Plane</div>
              </div>
            </div>
            <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>The AI Intent Control Plane. Every decision governed, audited, and compliant by design.</p>
            <a href="mailto:hello@decisionmesh.io" style={{ color: C.blue, fontSize: 13, textDecoration: 'none', fontFamily: C.mono }}>hello@decisionmesh.io</a>
          </div>
          {col('Product', [{ label: 'Features', href: '#features' }, { label: 'Platform', href: '#platform' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#' }])}
          {col('Solutions', [{ label: 'For Engineers', href: '#engineers' }, { label: 'For Executives', href: '#executives' }, { label: 'For Compliance', href: '#compliance' }])}
          {col('Industries', [{ label: 'Fintech & Banking', href: '#industries' }, { label: 'Healthcare', href: '#industries' }, { label: 'Insurance', href: '#industries' }, { label: 'Legal Services', href: '#industries' }])}
          {col('Resources', [{ label: 'API Docs', href: '/docs', ext: true }, { label: 'Blog', href: '/blog' }, { label: 'Status', href: '#' }, { label: 'Support', href: 'mailto:support@decisionmesh.io' }])}
          {col('Legal', [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Security', href: '#' }, { label: 'Contact Sales', href: 'mailto:sales@decisionmesh.io' }])}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#374151', fontSize: 12, fontFamily: C.mono }}>© 2025 DecisionMesh. All rights reserved.</p>
          <p style={{ color: '#1f2937', fontSize: 11, fontFamily: C.mono }}>SOC 2 READY · GDPR · EU AI ACT · HIPAA AWARE</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const auth = useAuth();
  const handleRegister = () => auth.signinRedirect({ extraQueryParams: { prompt: 'create' } });
  const handleLogin = () => auth.signinRedirect();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > *:nth-child(1),
          .hero-grid > *:nth-child(2),
          .hero-grid > *:nth-child(4),
          .hero-grid > *:nth-child(5) { display: none; }
          .hero-connector { display: none !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <NavBar onLogin={handleLogin} onRegister={handleRegister} />
        <Hero onRegister={handleRegister} onLogin={handleLogin} />
        <PainSection />
        <Platform />
        <Features />
        <Audiences />
        <Compliance />
        <Industries />
        <Stats />
        <Pricing onRegister={handleRegister} />
        <FinalCTA onRegister={handleRegister} />
        <Footer />
      </div>
    </>
  );
}
