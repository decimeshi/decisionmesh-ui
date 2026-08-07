import { PHASE_ORDER } from '../../lib/utils';

// Persistent "AI Execution Pipeline" visualization, per the "Dark Trust +
// Neon Intelligence" palette spec: Intent → Govern → Secure → Optimize →
// Execute → Prove, each stage lighting up in its own semantic color as the
// current intent progresses.
//
// Reuses PHASE_ORDER (lib/utils.js) — the same 6-value phase model
// ExecutionTimeline already drives — rather than inventing a second one.
// Both happen to have exactly 6 entries, so "lit" is a straight positional
// mapping by index: CREATED→Intent, PLANNING→Govern, PLANNED→Secure,
// EXECUTING→Optimize, EVALUATING→Execute, COMPLETED→Prove. Not a perfectly
// pure semantic match (EXECUTING reads more like "Execute" than
// "Optimize"), but there's no backend concept finer than these 6 phases to
// map onto 6 pipeline stages any more precisely without inventing one.
const STAGES = [
  { label: 'Intent',   color: 'var(--brand)'          },
  { label: 'Govern',   color: 'var(--stage-govern)'   },
  { label: 'Secure',   color: 'var(--stage-secure)'   },
  { label: 'Optimize', color: 'var(--stage-optimize)' },
  { label: 'Execute',  color: 'var(--brand-ai-accent)' },
  { label: 'Prove',    color: 'var(--stage-prove)'    },
];

export default function ExecutionPipelineStepper({ phase, terminal, satisfactionState }) {
  const phaseIndex = Math.max(0, PHASE_ORDER.indexOf(phase ?? 'CREATED'));
  // A FAILED/REJECTED/CANCELLED terminal intent never reaches "COMPLETED",
  // so satisfactionState==='VIOLATED' or an unrecognised phase would
  // otherwise leave every later stage looking merely "not yet reached"
  // rather than genuinely blocked — litUpTo caps at where the run actually
  // stopped, terminal or not.
  const litUpTo = terminal && satisfactionState === 'VIOLATED' ? phaseIndex : phaseIndex;

  return (
    <div className="flex items-center gap-1 px-1 py-0.5 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const lit = i <= litUpTo;
        return (
          <div key={stage.label} className="flex items-center gap-1 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
              style={lit
                ? { background: `${stage.color}18`, color: stage.color }
                : { background: '#f1f5f9', color: '#94a3b8' }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lit ? stage.color : '#cbd5e1' }} />
              {stage.label}
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-slate-300 text-xs shrink-0">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
