import { useState, useEffect, useRef } from 'react';
import { PauseCircle, CheckCircle2, RefreshCw, Copy, Check, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIntentAvailability } from '../../utils/api';

/**
 * Shown when the kill switch halts intent submission (HTTP 503).
 *
 * DESIGN PREMISE: there is no "next step" on this task. A kill switch means the platform
 * has decided this work must not run, and no user action can override that — a retry
 * button would be a lie. So the notice does not try to unblock them. It makes the wait
 * survivable:
 *
 *   1. Don't lose their work — the intent JSON is copyable, so closing the tab is safe.
 *   2. Let them leave        — auto-resume with backoff, so they needn't watch a spinner.
 *   3. Say what still works  — submission is halted; the rest of the product is not.
 *   4. Escalate if they can  — an admin seeing this may be the person who can lift it.
 */

// Backoff. A halt can last an hour; "rechecking in 10s" at minute 59 reads as denial,
// and 360 polls per open tab is noise during exactly the incident you paused for.
const SCHEDULE = [10, 10, 10, 30, 30, 60];      // seconds; steady at the last value
const LONG_HALT_AFTER_MS = 3 * 60 * 1000;       // after 3 min, change the story

export default function KillSwitchNotice({ keycloak, onResume, intentJson, isAdmin }) {
  const navigate = useNavigate();

  const [resumed,  setResumed]  = useState(false);
  const [checking, setChecking] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [attempt,  setAttempt]  = useState(0);
  const [nextIn,   setNextIn]   = useState(SCHEDULE[0]);

  const startedAt = useRef(Date.now());
  const timerRef  = useRef(null);

  const isLongHalt = Date.now() - startedAt.current > LONG_HALT_AFTER_MS;
  const interval   = SCHEDULE[Math.min(attempt, SCHEDULE.length - 1)];

  async function check() {
    setChecking(true);
    try {
      const res = await getIntentAvailability(keycloak);
      if (res && res.paused === false) setResumed(true);
    } catch {
      /* probe failed — stay paused, retry on the next tick */
    } finally {
      setChecking(false);
      setAttempt(a => a + 1);
      setNextIn(SCHEDULE[Math.min(attempt + 1, SCHEDULE.length - 1)]);
    }
  }

  useEffect(() => {
    if (resumed) return;
    timerRef.current = setInterval(() => {
      setNextIn(n => { if (n <= 1) { check(); return interval; } return n - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resumed, interval]);   // eslint-disable-line react-hooks/exhaustive-deps

  function copyIntent() {
    navigator.clipboard?.writeText(intentJson ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Resumed — now a submit button means something ──────────────────────────
  if (resumed) {
    return (
      <div role="status"
        className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-emerald-900">Processing has resumed</p>
          <p className="mt-1 text-xs text-emerald-800">Your intent is unchanged and ready to send.</p>
        </div>
        <button onClick={onResume}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
          Submit intent
        </button>
      </div>
    );
  }

  // ── Paused ─────────────────────────────────────────────────────────────────
  return (
    <div role="status" className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <PauseCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-900">AI processing is paused</p>

          <p className="mt-1 text-xs text-amber-800">
            {isLongHalt
              ? <>This is taking longer than usual. Nothing is lost — copy your intent below
                  and come back later. We'll keep checking while this tab is open.</>
              : <>We've paused processing while we run a safety check. Your intent wasn't
                  submitted and your credits haven't been used.</>}
          </p>

          {/* Submission is halted. The rest of the product is not — say so. */}
          <p className="mt-1.5 text-xs text-amber-800">
            You can still review past intents, executions and your audit log.
          </p>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
            <RefreshCw size={11} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : <>Rechecking in {nextIn}s — we'll tell you the moment it's back.</>}
          </p>

          {/* Only actions that are actually available to them. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            {intentJson && (
              <button onClick={copyIntent}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 underline">
                {copied ? <Check size={11}/> : <Copy size={11}/>}
                {copied ? 'Copied' : 'Copy intent'}
              </button>
            )}
            <button onClick={() => navigate('/intents')}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 underline">
              Past intents <ArrowRight size={11}/>
            </button>
            <button onClick={check} disabled={checking}
              className="text-xs font-medium text-amber-900 underline disabled:opacity-50">
              Check now
            </button>
          </div>

          {/* If they can lift it, don't make them hunt for the console. */}
          {isAdmin && (
            <button onClick={() => navigate('/admin/kill-switches')}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline">
              <ShieldAlert size={11}/> Manage kill switches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
