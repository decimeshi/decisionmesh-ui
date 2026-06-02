import { useState } from "react";
import { Trash2, AlertTriangle, Shield } from "lucide-react";

/**
 * GDPR Right to Erasure — Delete Account Section
 * Place in: src/components/shared/DeleteAccountSection.jsx
 *
 * Usage in UserProfile.jsx (already imported):
 *   <DeleteAccountSection keycloak={keycloak} />
 */
export default function DeleteAccountSection({ keycloak }) {
  const [open,    setOpen]    = useState(false);
  const [confirm, setConfirm] = useState("");
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const CONFIRMATION_PHRASE = "delete my account";
  const isConfirmed = confirm.toLowerCase() === CONFIRMATION_PHRASE;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(keycloak?.token ? { Authorization: `Bearer ${keycloak.token}` } : {}),
        },
        body: JSON.stringify({ confirmation: confirm, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Sign out after 3 seconds
        setTimeout(() => {
          keycloak?.logout?.() ?? window.location.replace("/");
        }, 3000);
      } else {
        setError(data.detail || data.error || "Deletion failed. Please contact support.");
      }
    } catch (e) {
      setError("Network error. Please try again or contact support@decimeshi.com");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <Shield size={32} className="text-green-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-green-800 mb-1">Account deletion complete</p>
        <p className="text-xs text-green-700">
          All your data has been permanently deleted in accordance with GDPR Article 17.
          You will be signed out shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Danger zone header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-red-500" />
        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
          Danger Zone
        </span>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">Delete my account</p>
            <p className="text-xs text-red-700 leading-relaxed max-w-md">
              Permanently delete your account and all associated data — intents, executions,
              audit logs, API keys, policies, and billing records. This action is irreversible
              and complies with GDPR Article 17 (Right to Erasure).
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} />
            Delete account
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Delete your account</p>
                <p className="text-xs text-slate-500">This cannot be undone</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>What will be deleted:</strong> All intents, executions, audit logs,
                API keys, policies, adapters, billing records, and your organisation data.
                Your data will be permanently erased within 30 days per GDPR Article 17.
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Reason for leaving <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                placeholder="Help us improve..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Type{" "}
                <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-red-600">
                  delete my account
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="delete my account"
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  confirm && !isConfirmed
                    ? "border-red-300 focus:ring-red-300"
                    : isConfirmed
                    ? "border-green-300 focus:ring-green-300"
                    : "border-slate-200 focus:ring-slate-300"
                }`}
              />
            </div>

            {error && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setConfirm(""); setError(null); }}
                className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || loading}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isConfirmed && !loading
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Deleting..." : "Permanently delete"}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-3">
              GDPR Article 17 — Right to Erasure · support@decimeshi.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
