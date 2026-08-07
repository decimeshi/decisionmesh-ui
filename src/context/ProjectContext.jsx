import { createContext, useContext, useState, useEffect } from 'react';
import { getOrg, listProjects, setCurrentProject } from '../utils/api';


// ── Default data ──────────────────────────────────────────────────────────────
// Used as fallback when the API hasn't returned yet or isn't available.

const DEFAULT_ORG = {
  id:          'org-default',
  name:        'My Organisation',
  plan:        'Pro',
  logoInitial: 'M',
};

const DEFAULT_PROJECT = {
  id:          'proj-default',
  name:        'Default Project',
  environment: 'Production',
  description: 'Default project',
  isDefault:   true,
};

// ── Context ───────────────────────────────────────────────────────────────────

const ProjectContext = createContext(null);

export function ProjectProvider({ keycloak, children }) {
  const [org,             setOrg]             = useState(DEFAULT_ORG);
  const [projects,        setProjects]        = useState([DEFAULT_PROJECT]);
  const [activeProject,   setActiveProject]   = useState(DEFAULT_PROJECT);
  const [loading,         setLoading]         = useState(true);
  // True when the caller has more than one project in this org and nothing
  // validly remembered picks one for them — App.jsx gates on this to show
  // ChooseProject instead of the normal app shell. A single-project org
  // never sets this; auto-select still "just works" for the common case.
  const [needsProjectPick, setNeedsProjectPick] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!keycloak?.authenticated || !keycloak?.token) {
        setLoading(false);
        return;
      }
      try {
        // Uses the shared request() helper (token refresh + 401 handling)
        // instead of duplicate fetch calls with a hardcoded URL.
        const [orgRes, projRes] = await Promise.allSettled([
          getOrg(keycloak),
          listProjects(keycloak),
        ]);

        if (!active) return;

        if (orgRes.status === 'fulfilled' && orgRes.value) {
          setOrg({ ...DEFAULT_ORG, ...orgRes.value });
        }

        if (projRes.status === 'fulfilled' && projRes.value) {
          const data = projRes.value;
          const list = Array.isArray(data) ? data : (data.content ?? []);
          if (list.length > 0) {
            setProjects(list);
            // Restore last selected project from localStorage — but only
            // within THIS org's own project list. A remembered id from a
            // different org (or a now-revoked project) simply won't be in
            // `list`, and falls through to the picker below rather than
            // silently resolving to some other project — this is what makes
            // "remember last org + project" a joint, validated restore
            // instead of two independent guesses.
            const saved = localStorage.getItem('dm_active_project');
            const found = saved ? list.find(p => p.id === saved) : null;
            if (found) {
              setActiveProject(found);
              setCurrentProject(found.id);
              setNeedsProjectPick(false);
            } else if (list.length === 1) {
              // Only one possible answer — no reason to ask.
              setActiveProject(list[0]);
              setCurrentProject(list[0].id);
              setNeedsProjectPick(false);
            } else {
              // Multiple candidates, nothing validly remembered — let
              // App.jsx render ChooseProject instead of guessing.
              setNeedsProjectPick(true);
            }
          }
        }
      } catch {
        // API not ready — keep defaults
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [keycloak?.authenticated]);

  function switchProject(project) {
    setActiveProject(project);
    localStorage.setItem('dm_active_project', project.id);
    // Every subsequent API call carries this project on X-Project-Id, which the
    // backend validates against the tenant and uses to derive the owning team.
    setCurrentProject(project.id);
  }

  // Same as switchProject, but also clears needsProjectPick — the answer to
  // "which project" from ChooseProject's first-run picker, as distinct from
  // a later, deliberate switch via the sidebar.
  function chooseProject(project) {
    switchProject(project);
    setNeedsProjectPick(false);
  }

  function addProject(project) {
    const newList = [...projects, project];
    setProjects(newList);
    switchProject(project);
  }

  function updateProject(updated) {
    setProjects(ps => ps.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    if (activeProject.id === updated.id) setActiveProject(p => ({ ...p, ...updated }));
  }

  return (
    <ProjectContext.Provider value={{
      org, setOrg,
      projects, setProjects,
      activeProject, switchProject,
      addProject, updateProject,
      loading,
      needsProjectPick, chooseProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
  return ctx;
}
