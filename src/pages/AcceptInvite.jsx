import { useState, useEffect } from 'react';
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { previewInvitation, acceptInvitation } from '../utils/api';
import { INVITE_TOKEN_KEY } from '../utils/inviteToken';


// Rendered whenever there's an active invite token — either from the URL
// (/invite/:token, first visit, not logged in yet) or sessionStorage
// (returning from the Zitadel login redirect). See main.jsx's AppWrapper for
// how `token` is resolved; it has to be a prop rather than read here via
// useParams() because the sessionStorage case isn't matched by any route.
export default function AcceptInvite({ token, auth, keycloak, onConsumed }) {
  const [preview, setPreview] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    previewInvitation(token)
      .then(p => { if (!cancelled) setPreview(p); })
      .catch(err => {
        if (cancelled) return;
        const msg = err?.message || '';
        setLoadError(msg || 'This invitation link is invalid.');
        // A genuinely dead invite (bad token, expired, already used) should
        // stop hijacking every future app load via the sessionStorage flag —
        // but a still-valid invite must NOT be cleared here. This used to run
        // unconditionally on every mount regardless of outcome, which raced
        // with the Zitadel login/registration round-trip: if this component
        // remounted more than once while auth.isLoading settled (normal
        // during OIDC's loading-state transitions), the token could be
        // cleared before AppWrapper got a chance to route back into this
        // flow, silently dropping a brand-new invitee into the generic
        // "create your own workspace" onboarding instead of joining the
        // tenant they were actually invited to.
        if (/invitation-not-found|invitation-expired|invitation-already-accepted/.test(msg)) {
          onConsumed?.();
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Most invitees are brand-new to the product — they have no account to log
  // into. This used to only offer a plain signinRedirect() (Zitadel's LOGIN
  // form), which left a new invitee stuck with nothing to sign in with.
  // register=true adds prompt=create, the same param LandingPage.jsx's
  // "Get started free" uses to send Zitadel straight to its registration
  // form instead of login.
  function handleLogin(register) {
    // The redirect navigates away entirely, so stash the token in
    // sessionStorage — onSigninCallback rewrites the URL on return, and
    // React state doesn't survive a full navigation either way.
    sessionStorage.setItem(INVITE_TOKEN_KEY, token);
    auth?.signinRedirect?.(register ? { extraQueryParams: { prompt: 'create' } } : undefined);
  }

  async function handleAccept() {
    setAccepting(true);
    setAcceptError('');
    try {
      await acceptInvitation(keycloak, token);
      onConsumed?.();
      setAccepted(true);
      // Roles resolve from role_grant on every request (no token refresh
      // needed — see ZitadelRoleAugmentor) — a plain reload is enough to
      // land in the newly-joined workspace.
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('already-in-workspace')) {
        setAcceptError('This account already belongs to a workspace, so it can’t also join this one.');
      } else if (msg.includes('email-mismatch')) {
        setAcceptError('This invitation was sent to a different email address than the one you’re logged in with.');
      } else if (msg.includes('invitation-expired')) {
        setAcceptError('This invitation has expired. Ask whoever invited you to send a new one.');
      } else if (msg.includes('invitation-already-accepted')) {
        setAcceptError('This invitation has already been accepted.');
      } else {
        setAcceptError('Could not accept this invitation. Please try again.');
      }
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src="/decimeshi-icon.svg" alt="DecisionMesh" style={{ width: 44, height: 44 }} />
        </div>

        {loading && (
          <div style={styles.center}>
            <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} color="#64748b" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && loadError && (
          <>
            <div style={styles.center}><XCircle size={36} color="#dc2626" /></div>
            <h1 style={styles.title}>Invitation not found</h1>
            <p style={styles.subtitle}>{loadError}</p>
          </>
        )}

        {!loading && !loadError && preview && accepted && (
          <>
            <div style={styles.center}><CheckCircle2 size={36} color="#16a34a" /></div>
            <h1 style={styles.title}>You're in</h1>
            <p style={styles.subtitle}>
              Redirecting you to {preview.tenantName}
              {preview.projectName ? ` — ${preview.projectName}` : ''}…
            </p>
          </>
        )}

        {!loading && !loadError && preview && !accepted && (
          <>
            <div style={styles.center}><Mail size={32} color="#2563eb" /></div>
            <h1 style={styles.title}>You're invited to {preview.tenantName}</h1>
            <p style={styles.subtitle}>
              {preview.projectName
                ? <>Join <strong>{preview.projectName}</strong> as <strong>{preview.role}</strong>.</>
                : <>Join as <strong>{preview.role}</strong>, with access across the workspace.</>}
            </p>

            {preview.expired && (
              <p style={styles.error}>This invitation has expired. Ask whoever invited you to send a new one.</p>
            )}

            {!preview.expired && preview.status === 'ACCEPTED' && (
              <p style={styles.error}>This invitation has already been accepted.</p>
            )}

            {!preview.expired && preview.status === 'PENDING' && (
              <>
                {acceptError && <p style={styles.error}>{acceptError}</p>}

                {!auth?.isAuthenticated ? (
                  <>
                    <button style={styles.btn} onClick={() => handleLogin(true)}>
                      Create account &amp; accept
                    </button>
                    <p style={styles.subtitle}>
                      Already have a DecisionMesh account?{' '}
                      <a href="#" onClick={e => { e.preventDefault(); handleLogin(false); }} style={{ color: '#2563eb', fontWeight: 600 }}>
                        Log in instead
                      </a>
                    </p>
                  </>
                ) : (
                  <button style={styles.btn} onClick={handleAccept} disabled={accepting}>
                    {accepting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                    Accept invitation
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    padding: 16,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 460,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 24px',
    lineHeight: 1.5,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 20px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    margin: '0 0 12px',
    padding: '8px 12px',
    background: '#fef2f2',
    borderRadius: 8,
    textAlign: 'center',
  },
};
