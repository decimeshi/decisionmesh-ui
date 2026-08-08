import { useState, useEffect } from 'react';

// ── Design tokens — mirrors the palette already defined in LandingPage.jsx
// (const C) so this section drops into the same page without a visual
// seam. Only the subset this component actually uses is duplicated here,
// same pattern this file's Icon set already follows for ACCELERATOR_EMOJI. ──
//
// stageAi/stageTransition intentionally break from the product's own
// Govern/Prove stage colors (this file's earlier blue/amber) in favor of a
// dedicated teal/orange pairing — matching the reference marketing design
// (D:\DM\images\decisionmesh-landing.html), where the accent color itself is
// the signal for "which audience segment is this" and needed to read as a
// distinct brand moment, not borrow the product UI's own semantics.
const C = {
  bg:            '#0B1220',
  surface:       '#0d1e35',
  border:        '#223049',
  stageAi:            '#4fd1c5',   // teal — "already running AI"
  stageAiDim:         '#2a5f5a',
  stageTransition:    '#f0a868',   // orange — "starting out"
  stageTransitionDim: '#6b4a26',
  textPrimary:   '#f9fafb',
  textSecondary: '#e5e7eb',
  textMuted:     '#9ca3af',
  mono: "ui-monospace, 'SF Mono', 'Menlo', 'Consolas', 'Roboto Mono', monospace",
};

const Icon = {
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

const CONTENT = {
  ai: {
    stageColor: C.stageAi,
    stageColorDim: C.stageAiDim,
    switchLabel: 'RUNNING AI',
    panelLabel: 'Governance check',
    questions: [
      'Are you confident your AI meets evolving regulatory standards?',
      'Is your control framework truly comprehensive?',
      'Could you produce a full audit trail for every AI decision today?',
      'If a model call went rogue at 3am, would anything have stopped it?',
    ],
    ctaText: 'See it in the platform',
    ctaTarget: '#platform',
    target: 'Built for mid-market and enterprise teams — financial services, healthcare, insurance, government, and SaaS — running 3+ LLM or agent use cases in production, where security and compliance are already asking hard questions.',
  },
  transition: {
    stageColor: C.stageTransition,
    stageColorDim: C.stageTransitionDim,
    switchLabel: 'STARTING OUT',
    panelLabel: 'Curiosity check',
    questions: [
      'What if your customer support could predict issues before they happen?',
      'Unlock hidden revenue: can your current apps do this?',
      'How many manual workflows could AI take off your team\u2019s plate?',
      'What\u2019s the one process you\u2019d automate first, if you trusted it?',
    ],
    ctaText: 'See how we build it',
    ctaTarget: '#features',
    target: 'The same regulated, risk-sensitive organizations — financial services, healthcare, insurance, government, and SaaS — now weighing cost, timeline, and how to execute a first AI rollout without creating a compliance problem later.',
  },
};

// Scrolls within the current landing page rather than navigating away —
// both CTA targets are real sections already rendered by LandingPage.jsx
// (Platform → id="platform", Features → id="features"), so "learn more"
// keeps the visitor on-page instead of sending them to an external link.
function scrollToSection(target) {
  const el = document.querySelector(target);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const AUTOPLAY_MS = 6000;

// hero switches on the reference design's open hero treatment (D:\DM\images\
// decisionmesh-landing.html) — bigger centered typography, premium
// two-button CTA row, "Know more" link — used only when this component is
// the full-screen first section of the landing page (LandingPage.jsx,
// right below NavBar). The embedded mid-page instance (further down the
// same page, standalone) leaves it off and keeps its original compact
// boxed-card look unchanged. There's no gating here — every other section
// is always mounted on the page; "Know more" just scrolls to knowMoreTarget.
export default function SegmentToggle({ hero = false, knowMoreTarget = '#hero-section' }) {
  const [state, setState] = useState('ai');
  const [qIndex, setQIndex] = useState({ ai: 0, transition: 0 });
  const c = CONTENT[state];

  const cycleQuestion = () => {
    setQIndex(prev => ({ ...prev, [state]: (prev[state] + 1) % c.questions.length }));
  };

  // Gentle autoplay flash between the two segments. A single setInterval
  // set up once on mount, not re-subscribed on every state change — an
  // earlier version depended on [state] so it could restart the countdown
  // after a manual click, but re-running setTimeout on every flip raced
  // against React's own re-render and left the switch highlight and panel
  // label disagreeing about which segment was active. The functional
  // setState update below still always reads the latest state correctly;
  // it just no longer needs the effect itself to re-fire to do that.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setState(s => (s === 'ai' ? 'transition' : 'ai'));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ position: 'relative', padding: hero ? '0 24px' : '56px 24px', background: C.bg, overflow: 'hidden' }}>
      <style>{`
        @keyframes segToggleFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes segTogglePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* ambient glow, same idiom as Hero's radial-gradient flash, tinted to the active stage color */}
      <div
        style={{
          position: 'absolute', top: hero ? '-10%' : '5%', left: '50%', transform: 'translateX(-50%)',
          width: hero ? 900 : 640, height: hero ? 700 : 420, pointerEvents: 'none', filter: 'blur(50px)',
          background: `radial-gradient(ellipse at center, ${c.stageColor}${hero ? '33' : '26'} 0%, transparent 70%)`,
          transition: 'background 0.4s ease',
        }}
      />

      <div style={{ position: 'relative', maxWidth: hero ? 720 : 560, margin: '0 auto' }}>
        {/* segmented switch */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: hero ? 32 : 28 }}>
          {hero && <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: '0.12em', color: C.textMuted, textTransform: 'uppercase' }}>State</span>}
          <div style={{ display: 'flex', gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: 4 }}>
            {['ai', 'transition'].map(key => (
              <button
                key={key}
                onClick={() => setState(key)}
                style={{
                  padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: C.mono, letterSpacing: '0.04em',
                  background: state === key ? CONTENT[key].stageColor : 'transparent',
                  color: state === key ? '#fff' : C.textMuted,
                  transition: 'all 0.2s ease',
                }}
              >
                {CONTENT[key].switchLabel}
              </button>
            ))}
          </div>
          {hero && <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.stageColor, boxShadow: `0 0 10px ${c.stageColor}`, transition: 'background 0.5s ease' }} />}
        </div>

        {/* provocation card — an open, centered hero treatment when hero=true; the
            original boxed card everywhere else this component is embedded */}
        <div
          key={state}
          style={{
            background: hero ? 'transparent' : C.surface,
            border: hero ? 'none' : `1px solid ${C.border}`,
            borderRadius: 14,
            padding: hero ? 0 : '26px 28px',
            textAlign: hero ? 'center' : 'left',
            animation: 'segToggleFadeUp 0.35s ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: hero ? 'center' : 'flex-start', gap: 8, marginBottom: hero ? 18 : 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.stageColor, display: 'inline-block', animation: 'segTogglePulse 1.5s infinite' }} />
            <span style={{ fontFamily: C.mono, fontSize: hero ? 12 : 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.stageColor }}>
              {c.panelLabel}
            </span>
          </div>

          <p
            key={qIndex[state]}
            style={{
              fontFamily: hero ? "'Space Grotesk', sans-serif" : 'inherit',
              fontSize: hero ? 'clamp(28px, 4.2vw, 44px)' : 20,
              fontWeight: hero ? 700 : 600,
              lineHeight: hero ? 1.15 : 1.4,
              letterSpacing: hero ? '-0.01em' : 'normal',
              color: C.textPrimary,
              margin: hero ? '0 auto 28px' : '0 0 22px',
              maxWidth: hero ? 640 : 'none',
              minHeight: hero ? 'clamp(90px, 12vw, 140px)' : 56,
              animation: 'segToggleFadeUp 0.3s ease both',
            }}
          >
            {c.questions[qIndex[state]]}
          </p>

          <div style={{ display: 'flex', gap: hero ? 14 : 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: hero ? 'center' : 'flex-start' }}>
            <button
              onClick={cycleQuestion}
              style={{
                background: 'transparent',
                border: `1px solid ${hero ? 'rgba(255,255,255,0.22)' : C.border}`,
                color: hero ? C.textPrimary : C.textMuted,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                ...(hero
                  ? { padding: '14px 26px', fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }
                  : { padding: '9px 14px', fontSize: 12, fontFamily: C.mono, letterSpacing: '0.04em' }),
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = hero ? 'rgba(255,255,255,0.45)' : C.textMuted; e.currentTarget.style.color = C.textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = hero ? 'rgba(255,255,255,0.22)' : C.border; e.currentTarget.style.color = hero ? C.textPrimary : C.textMuted; }}
            >
              Another question
            </button>

            <button
              onClick={() => scrollToSection(c.ctaTarget)}
              style={{
                background: `linear-gradient(135deg, ${c.stageColor}, ${c.stageColorDim})`,
                color: '#fff', fontWeight: 700,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                letterSpacing: '-0.2px', transition: 'background 0.4s ease, filter 0.15s, transform 0.1s',
                ...(hero
                  ? { padding: '14px 26px', fontSize: 15 }
                  : { marginLeft: 'auto', padding: '9px 18px', fontSize: 13 }),
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {c.ctaText} <Icon.ArrowRight />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: hero ? 26 : 18, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {hero && (
            <button
              onClick={() => scrollToSection(knowMoreTarget)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                color: C.textMuted, fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              Know more
            </button>
          )}
          <a href="/demo" style={{ color: C.textMuted, fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Or talk to us directly
          </a>
        </div>

        {/* TARGET strip — who this is built for, matching the reference
            design's audience-context line. minHeight keeps the strip's
            height stable across the two states' differently-sized copy. */}
        {hero && (
          <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginTop: 40, padding: '22px 0' }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', maxWidth: 760, margin: '0 auto' }}>
              <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: '0.1em', color: c.stageColor, paddingTop: 3, whiteSpace: 'nowrap', transition: 'color 0.5s ease' }}>
                TARGET
              </span>
              <p style={{ margin: 0, color: C.textMuted, fontSize: 14.5, lineHeight: 1.65, minHeight: 66 }}>
                {c.target}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
