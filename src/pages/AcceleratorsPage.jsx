/**
 * DecisionMesh Accelerators — product family placeholder page.
 *
 * Placeholder: presents the planned product line (16 industry packages,
 * shared framework, architecture, platform/marketplace positioning) for
 * review and roadmap discussion — nothing here is wired to a backend or
 * purchasable. Public route (registered in main.jsx before the auth
 * gate, same as /architecture, /demo, /docs, /blog) since this is
 * marketing/roadmap content, not an authenticated app feature.
 */
import { useState } from 'react';
import { ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { FRAMEWORK, ARCHITECTURE_TREE, ACCELERATORS, LAYERS } from '../data/accelerators';

// ── Includes rendering — handles every content depth in ACCELERATORS uniformly ─
function IncludesSection({ includes }) {
  if (!includes) return null;
  const groups = [
    { key: 'flat',            label: 'Includes' },
    { key: 'policies',        label: 'Policies' },
    { key: 'prompts',         label: 'Prompts' },
    { key: 'businessIntents', label: 'Business Intents' },
    { key: 'integrations',    label: 'Integrations' },
  ];
  return (
    <div className="accelerator-includes">
      {groups.filter(g => includes[g.key]?.length).map(g => (
        <div key={g.key} className="accelerator-includes__group">
          <span className="accelerator-includes__label">{g.label}</span>
          <div className="accelerator-includes__chips">
            {includes[g.key].map(item => (
              <span key={item} className="accelerator-chip">{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AcceleratorCard({ accelerator, expanded, onToggle }) {
  const Icon = accelerator.icon;
  return (
    <div className={`accelerator-card ${expanded ? 'accelerator-card--expanded' : ''}`}>
      <button className="accelerator-card__header" onClick={onToggle} aria-expanded={expanded}>
        <span className="accelerator-card__icon"><Icon size={18} /></span>
        <span className="accelerator-card__title">
          {accelerator.name}
          {accelerator.tagline && <span className="accelerator-card__tagline">{accelerator.tagline}</span>}
        </span>
        <span className="accelerator-card__chevron"><ChevronDown size={16} /></span>
      </button>

      <div className="accelerator-card__problems">
        {accelerator.problemsSolved.map(p => (
          <span key={p} className="accelerator-chip accelerator-chip--problem">{p}</span>
        ))}
      </div>

      {expanded && (
        accelerator.includes
          ? <IncludesSection includes={accelerator.includes} />
          : <p className="accelerator-card__placeholder-note">Package contents not yet published for this industry.</p>
      )}
    </div>
  );
}

export default function AcceleratorsPage() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="accelerators-page">
      <div className="accelerators-hero">
        <span className="accelerators-hero__badge"><Sparkles size={12} /> Coming soon — roadmap preview</span>
        <h1 className="accelerators-hero__title">DecisionMesh Accelerators</h1>
        <p className="accelerators-hero__subtitle">
          Production-ready AI governance packages, one per industry. Every
          Accelerator ships the same framework — policies, prompts, intents,
          connectors, compliance controls, evaluation suites, dashboards,
          reference architectures, and sample workflows — pre-built for a
          specific vertical.
        </p>
        <p className="accelerators-hero__callout">
          The customer isn't buying prompts — they're buying a faster path to production.
        </p>
      </div>

      <section className="accelerators-framework" aria-labelledby="framework-heading">
        <h2 id="framework-heading" className="accelerators-section-heading">Every Accelerator, Same Framework</h2>
        <div className="accelerators-framework__grid">
          {FRAMEWORK.map(({ label, icon: Icon }) => (
            <div key={label} className="framework-pill">
              <Icon size={16} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="accelerators-grid-section" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="accelerators-section-heading">16 Accelerators</h2>
        <p className="accelerators-section-subtitle">Click any card for what's included so far.</p>
        <div className="accelerators-grid">
          {ACCELERATORS.map(acc => (
            <AcceleratorCard
              key={acc.id}
              accelerator={acc}
              expanded={expandedId === acc.id}
              onToggle={() => setExpandedId(id => id === acc.id ? null : acc.id)}
            />
          ))}
        </div>
      </section>

      <section className="accelerators-architecture" aria-labelledby="arch-heading">
        <h2 id="arch-heading" className="accelerators-section-heading">Accelerator Architecture</h2>
        <p className="accelerators-section-subtitle">
          Every accelerator follows the same structure — consistency that
          makes it easier for customers and partners to understand and
          adopt new accelerators.
        </p>
        <pre className="accelerators-tree">{ARCHITECTURE_TREE}</pre>
      </section>

      <section className="accelerators-layers" aria-labelledby="layers-heading">
        <h2 id="layers-heading" className="accelerators-section-heading">The Bigger Picture</h2>
        <p className="accelerators-section-subtitle">A second layer above the accelerators:</p>
        <div className="accelerators-layers__stack">
          {LAYERS.map((layer, i) => (
            <div key={layer.name} className="accelerator-layer-card">
              <div className="accelerator-layer-card__row">
                <span className="accelerator-layer-card__index">{i + 1}</span>
                <span className="accelerator-layer-card__name">{layer.name}</span>
                <span className="accelerator-layer-card__tag">{layer.tag}</span>
              </div>
              <p className="accelerator-layer-card__desc">{layer.description}</p>
              {i < LAYERS.length - 1 && <ArrowRight size={16} className="accelerator-layer-card__arrow" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
