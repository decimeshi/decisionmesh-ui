import { Building2, ChevronRight, LogOut } from 'lucide-react';

// Shown once, right after login, only for a user who belongs to more than one
// tenant (see InvitationService.acceptInvitation on the backend — a user is no
// longer capped at one workspace). The common single-tenant case never reaches
// this screen at all; see main.jsx's AppWrapper for the auto-select logic.
export default function ChooseOrganization({ organizations, onSelect, onLogout }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src="/decimeshi-icon.svg" alt="DecisionMesh" style={{ width: 44, height: 44 }} />
        </div>
        <h1 style={styles.title}>Choose a workspace</h1>
        <p style={styles.subtitle}>You belong to more than one — pick where you want to land.</p>

        <div style={styles.options}>
          {organizations.map(org => (
            <button
              key={org.tenantId}
              style={styles.option}
              onClick={() => onSelect(org.tenantId)}
              onMouseEnter={e => { e.currentTarget.style.border = styles.optionHover.border; e.currentTarget.style.background = styles.optionHover.background; }}
              onMouseLeave={e => { e.currentTarget.style.border = styles.option.border; e.currentTarget.style.background = styles.option.background; }}
            >
              <Building2 size={22} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <p style={styles.optionTitle}>{org.tenantName}</p>
                {org.organizationName && org.organizationName !== org.tenantName && (
                  <p style={styles.optionDesc}>{org.organizationName}</p>
                )}
              </div>
              <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {onLogout && (
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={13} /> Sign out
          </button>
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
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 28px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  },
  optionHover: {
    border: '2px solid #2563eb',
    background: '#eff6ff',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
    margin: '2px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    marginTop: 20,
    padding: '10px 16px',
    background: 'transparent',
    color: '#64748b',
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
};
