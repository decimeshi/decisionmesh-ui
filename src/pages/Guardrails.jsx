import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, CardContent } from '../components/shared';

// ── Pipeline stages ──────────────────────────────────────────────────────────
// Distinct from IntentPhase (CREATED/PLANNING/PLANNED/EXECUTING/EVALUATING/
// COMPLETED, see PHASE_COLORS in lib/utils.js) — these are the policy-engine's
// own phase names (evaluatePreSubmission/evaluatePreExecution/
// evaluatePostExecution) plus the two pipeline points that sit outside the
// policy engine entirely (PLANNING's injection/PII guards, EXECUTING's egress
// scan). Colors are local to this page, not reused from elsewhere.
const STAGE_META = {
  PRE_SUBMISSION: { label: 'Pre-submission', color: '#64748b' },
  PLANNING:       { label: 'Planning',       color: '#2563eb' },
  PRE_EXECUTION:  { label: 'Pre-execution',  color: '#7c3aed' },
  EXECUTING:      { label: 'Executing',      color: '#d97706' },
  POST_EXECUTION: { label: 'Post-execution', color: '#16a34a' },
};

// ── The pipeline, in the exact order DecisionmeshOrchestrator runs it ───────
// Verified against source, not documentation — DecisionmeshOrchestrator.java
// (submit()/processIntentWorkflow()/executeWithRetry()), IntentCentricSLAGuard,
// IntentCentricPolicyEngine, LlmEgressGuard, GuardPromptInjectionService.
const STEPS = [
  {
    stage: 'PRE_SUBMISSION', type: 'built-in', name: 'Duplicate request',
    desc: 'Rejects a resubmission that reuses an idempotency key already seen for this tenant.',
  },
  {
    stage: 'PRE_SUBMISSION', type: 'built-in', name: 'Rate limit',
    desc: 'Blocks execution once the tenant’s request rate exceeds its configured ceiling.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  {
    stage: 'PRE_SUBMISSION', type: 'built-in', name: 'Budget exhausted / already terminal',
    desc: 'Two checks hardcoded into the policy engine itself, run before any persisted policy: the intent has no budget remaining, or it has already reached a terminal state.',
  },
  {
    stage: 'PRE_SUBMISSION', type: 'configurable', name: 'Your policies (pre-submission)',
    desc: 'Reachable now via Policy Builder’s "Runs at" selector — but empty in practice, since none of the current metrics resolve this early. pii_detected/injection_risk need Planning to have run first; cost/latency/risk need a completed execution. Policy Builder warns inline if you pick this phase with an incompatible metric.',
  },
  {
    stage: 'PRE_SUBMISSION', type: 'built-in', name: 'Budget validation',
    desc: 'A second, independent budget check before the intent record is even created.',
    code: 'BUDGET_EXCEEDED',
  },
  {
    stage: 'PLANNING', type: 'built-in', name: 'Prompt-injection scan',
    desc: 'Scans the raw objective for injection patterns before a plan is built. Critical severity blocks the request outright; high-risk is flagged on the intent and execution continues.',
    code: 'POLICY_INJECTION_BLOCKED',
  },
  {
    stage: 'PLANNING', type: 'built-in', name: 'PII masking',
    desc: 'Scans the objective’s free-text fields for personal data and masks what it finds before anything is sent onward. A field that can’t be safely masked is refused rather than sent partially redacted.',
    code: 'PII_MASKING_FAILED',
  },
  {
    stage: 'PRE_EXECUTION', type: 'built-in', name: 'SLA guard',
    desc: 'Per-request checks driven by the constraints you set on the intent itself (max retries, budget ceiling, drift threshold, execution-window TTL) — not a tenant-wide policy, and not editable in Policy Builder.',
    code: 'RETRY_BUDGET_EXHAUSTED',
  },
  {
    stage: 'PRE_EXECUTION', type: 'built-in', name: 'Max retries exceeded',
    desc: 'A second, policy-engine-level guardrail alongside the SLA guard’s own retry check.',
  },
  {
    stage: 'PRE_EXECUTION', type: 'configurable', name: 'Your policies (pre-execution)',
    desc: 'pii_detected and injection_risk resolve from here onward (Planning has already run) — pick this phase in Policy Builder for a genuine pre-flight block on either signal, before the request reaches a provider. cost/latency/risk still won’t resolve until Post-execution.',
  },
  {
    stage: 'EXECUTING', type: 'built-in', name: 'PII egress scan',
    desc: 'The last-mile check: scans the exact serialized payload immediately before it reaches the provider. Exists to catch anything the earlier masking step missed — deliberately does not mask here, so the audit trail can’t claim redaction happened when it didn’t.',
    code: 'PII_EGRESS_BLOCKED',
  },
  {
    stage: 'EXECUTING', type: 'built-in', name: 'Adapter failure',
    desc: 'The provider itself returned an error or didn’t respond in time.',
    code: 'ADAPTER_ERROR / ADAPTER_TIMEOUT',
  },
  {
    stage: 'POST_EXECUTION', type: 'built-in', name: 'SLA guard',
    desc: 'Cost vs. remaining budget, latency vs. your maxLatencyMs, and execution success/failure — evaluated against what actually happened.',
    code: 'BUDGET_EXCEEDED / LATENCY_EXCEEDED',
  },
  {
    stage: 'POST_EXECUTION', type: 'configurable', name: 'Your policies (post-execution)',
    desc: 'The default "Runs at" phase in Policy Builder, and the only place cost/latency/risk ever resolve — evaluated against the completed execution, each Log-only or Enforce. Each policy can also be tagged with a country — see Policy Builder — and only applies when that jurisdiction is one the tenant is actually configured to operate in.',
    highlight: true,
  },
];

function TypeBadge({ type }) {
  const isBuiltIn = type === 'built-in';
  return (
    <span
      className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={isBuiltIn
        ? { background: '#f1f5f9', color: '#475569' }
        : { background: '#eff6ff', color: '#2563eb' }}
    >
      {isBuiltIn ? <Lock size={10} /> : <ShieldCheck size={10} />}
      {isBuiltIn ? 'Built-in' : 'Your policies'}
    </span>
  );
}

export default function Guardrails() {
  return (
    <Page
      title="Guardrails"
      subtitle="Every check DecisionMesh runs on an intent, in the order it actually runs — built-in and always on, plus the policies you configure."
    >
      <Card className="p-4 flex items-start gap-3" style={{ background: '#f8fafc' }}>
        <Lock size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[13px] text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Built-in</strong> guardrails run on every intent in every tenant and
          cannot be disabled or edited here — they’re platform invariants, not tenant configuration.
          <strong className="text-slate-800"> Your policies</strong> are the rules you build in{' '}
          <Link to="/policies" className="text-blue-600 font-medium hover:underline">Policy Builder</Link>,
          scoped to your organization or a project.
        </p>
      </Card>

      <div className="relative">
        {/* Timeline rail */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" aria-hidden="true" />

        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const prevStage = i > 0 ? STEPS[i - 1].stage : null;
            const showStageLabel = step.stage !== prevStage;

            return (
              <div key={i}>
                {showStageLabel && (
                  <div className="relative flex items-center gap-3 pl-0 mb-2 mt-5 first:mt-0">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 text-2xs font-bold text-white"
                      style={{ background: meta.color }}
                    >
                      {i === 0 ? '1' : ''}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                      {meta.label}
                    </p>
                  </div>
                )}
                <Card
                  className={step.highlight ? 'p-4 ml-11' : 'p-4 ml-11'}
                  style={step.highlight ? { borderColor: '#bfdbfe', background: '#f8fbff' } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-slate-800">{step.name}</p>
                        <TypeBadge type={step.type} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
                      {step.code && (
                        <span className="inline-block mt-2 text-2xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {step.code}
                        </span>
                      )}
                    </div>
                    {step.highlight && (
                      <Link
                        to="/policies"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
                      >
                        Open Policy Builder <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
