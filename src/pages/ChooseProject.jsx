import { FolderKanban, ChevronRight } from 'lucide-react';

// Shown once, right after an org resolves (either auto-selected as the
// user's only one, or just picked via ChooseOrganization), only when that
// org has more than one project and nothing validly remembered picks one —
// see ProjectContext's needsProjectPick. The common single-project case
// never reaches this screen at all.
export default function ChooseProject({ projects, orgName, onSelect }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src="/decimeshi-icon.svg" alt="DecisionMesh" style={{ width: 44, height: 44 }} />
        </div>
        <h1 style={styles.title}>Choose a project</h1>
        <p style={styles.subtitle}>
          {orgName ? <>{orgName} has more than one — pick where you want to land.</>
                   : <>Pick a project to land in.</>}
        </p>

        <div style={styles.options}>
          {projects.map(project => (
            <button
              key={project.id}
              style={styles.option}
              onClick={() => onSelect(project)}
              onMouseEnter={e => { e.currentTarget.style.border = styles.optionHover.border; e.currentTarget.style.background = styles.optionHover.background; }}
              onMouseLeave={e => { e.currentTarget.style.border = styles.option.border; e.currentTarget.style.background = styles.option.background; }}
            >
              <FolderKanban size={20} color="#7c3aed" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <p style={styles.optionTitle}>{project.name}</p>
                {project.environment && (
                  <p style={styles.optionDesc}>{project.environment}</p>
                )}
              </div>
              {project.isDefault && <span style={styles.badge}>default</span>}
              <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
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
    maxHeight: 360,
    overflowY: 'auto',
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
    border: '2px solid #7c3aed',
    background: '#f5f3ff',
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
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    flexShrink: 0,
  },
};
