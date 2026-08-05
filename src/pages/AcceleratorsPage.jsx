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
import {
  Layers, ShieldCheck, MessageSquare, Target, Plug, ShieldAlert,
  CheckCircle2, BarChart3, Workflow, ChevronDown, Sparkles, ArrowRight,
  Landmark, HeartPulse, ShoppingBag, Factory, Radio, Building2,
  FlaskConical, Pill, Zap, Truck, Plane, BedDouble, GraduationCap,
  Scale, Briefcase,
} from 'lucide-react';

// ── Shared framework — every Accelerator contains these ──────────────────────
const FRAMEWORK = [
  { label: 'Business Policies',          icon: ShieldCheck },
  { label: 'Enterprise Prompts',         icon: MessageSquare },
  { label: 'Business Intents',           icon: Target },
  { label: 'Connectors & Integrations',  icon: Plug },
  { label: 'Compliance Controls',        icon: ShieldAlert },
  { label: 'AI Evaluation Suite',        icon: CheckCircle2 },
  { label: 'Dashboards & KPIs',          icon: BarChart3 },
  { label: 'Reference Architectures',    icon: Layers },
  { label: 'Sample Workflows',           icon: Workflow },
];

const ARCHITECTURE_TREE = `DecisionMesh Accelerator
│
├── Industry Policies
├── Enterprise Prompt Library
├── Business Intent Library
├── AI Agents
├── Connectors
├── Compliance Frameworks
├── Evaluation Datasets
├── KPI Dashboards
├── Reference Architectures
├── Sample Workflows
├── Best Practices
└── Deployment Templates`;

// ── The 16 accelerators — data-driven, not repeated JSX per industry ─────────
const ACCELERATORS = [
  {
    id: 'banking', name: 'Banking', icon: Landmark,
    problemsSolved: ['AI Governance', 'Model Risk Management', 'Fraud Operations', 'Lending', 'Customer Service', 'Regulatory Compliance', 'Treasury Operations', 'AI Cost Governance'],
    includes: {
      policies: ['Lending policies', 'RBI policies', 'PCI DSS controls', 'Model risk thresholds'],
      prompts: ['Fraud detection prompts', 'Loan underwriting prompts', 'Customer service responses', 'Collections correspondence'],
      businessIntents: ['KYC Verification', 'Loan Application Review', 'Fraud Alert Investigation', 'Credit Risk Assessment', 'Transaction Dispute Resolution'],
      integrations: ['Finacle', 'Temenos', 'SWIFT', 'Core Banking Systems', 'Credit Bureaus'],
    },
  },
  {
    id: 'insurance', name: 'Insurance', icon: ShieldCheck,
    problemsSolved: ['Claims Processing', 'Underwriting', 'Policy Servicing', 'Fraud Detection', 'Regulatory Compliance', 'Customer Experience'],
    includes: {
      policies: ['Claims approval rules', 'Underwriting governance', 'Sensitive data protection', 'Human approval thresholds'],
      prompts: ['Claims summarization', 'Loss assessment', 'Underwriting recommendations', 'Policy comparison', 'Customer correspondence'],
      businessIntents: ['Claim Intake', 'Claim Validation', 'Underwriting Review', 'Fraud Investigation', 'Policy Renewal', 'Quote Generation'],
      integrations: ['Guidewire', 'Duck Creek', 'Salesforce', 'Document repositories', 'DLP', 'SIEM'],
    },
  },
  {
    id: 'healthcare', name: 'Healthcare', icon: HeartPulse,
    problemsSolved: ['Clinical Documentation', 'Patient Summarization', 'Medical Coding', 'Prior Authorization', 'HIPAA Compliance', 'Clinical Decision Support'],
    includes: {
      policies: ['PHI protection', 'Clinical approval', 'Human review', 'AI explainability'],
      prompts: ['Clinical notes', 'Discharge summaries', 'Medical coding', 'Referral summaries'],
      businessIntents: ['Patient Summary', 'Medication Review', 'Prior Authorization', 'Clinical Coding', 'Lab Result Analysis'],
      integrations: ['Epic', 'Cerner', 'HL7/FHIR', 'PACS', 'DLP', 'Identity'],
    },
  },
  {
    id: 'retail', name: 'Retail', icon: ShoppingBag,
    problemsSolved: ['Customer Support', 'Inventory Optimization', 'Personalized Recommendations', 'Merchandising', 'Demand Forecasting'],
    includes: {
      policies: ['Customer data privacy policy', 'Promotion approval thresholds', 'Return & refund governance', 'Content moderation rules'],
      prompts: ['Product recommendation prompts', 'Customer support responses', 'Promotional copy generation', 'Review summarization'],
      businessIntents: ['Product Recommendation', 'Promotion Optimization', 'Customer Assistance', 'Inventory Inquiry', 'Return Processing'],
      integrations: ['SAP', 'Oracle Retail', 'Shopify', 'Salesforce Commerce', 'POS'],
    },
  },
  {
    id: 'manufacturing', name: 'Manufacturing', icon: Factory,
    problemsSolved: ['Predictive Maintenance', 'Quality Assurance', 'Production Planning', 'Factory Operations', 'Supply Chain Optimization'],
    includes: {
      policies: ['Safety incident escalation rules', 'Maintenance approval thresholds', 'Quality deviation governance', 'Vendor risk policy'],
      prompts: ['Maintenance recommendation prompts', 'Root cause analysis prompts', 'Quality inspection reports', 'Safety incident summaries'],
      businessIntents: ['Equipment Diagnosis', 'Maintenance Recommendation', 'Production Scheduling', 'Root Cause Analysis', 'Safety Incident Review'],
      integrations: ['SAP', 'Siemens', 'Rockwell', 'MES', 'SCADA', 'IoT'],
    },
  },
  {
    id: 'telecom', name: 'Telecommunications', icon: Radio,
    problemsSolved: ['Customer Care', 'Network Operations', 'Service Assurance', 'Billing', 'Fraud Detection'],
    includes: {
      policies: ['Network incident escalation policy', 'Customer data protection rules', 'Billing dispute governance', 'Service outage SLA thresholds'],
      prompts: ['Fault diagnosis prompts', 'Customer support responses', 'Billing inquiry resolution', 'Network incident summaries'],
      businessIntents: ['Fault Diagnosis', 'Customer Support', 'Billing Inquiry', 'Network Incident', 'Service Provisioning'],
      integrations: ['Amdocs', 'Netcracker', 'CRM Systems', 'Network Monitoring Tools'],
    },
  },
  {
    id: 'government', name: 'Government', icon: Building2,
    problemsSolved: ['Citizen Services', 'Regulatory Compliance', 'Case Management', 'Document Intelligence', 'AI Transparency'],
    includes: {
      policies: ['Citizen data privacy policy', 'AI transparency & explainability rules', 'Case escalation governance', 'Public records disclosure rules'],
      prompts: ['Permit review prompts', 'Case summary generation', 'Citizen assistance responses', 'Policy research briefs'],
      businessIntents: ['Permit Review', 'Case Summary', 'Citizen Assistance', 'Compliance Analysis', 'Policy Research'],
      integrations: ['Case Management Systems', 'Document Management Systems', 'Identity Verification', 'Public Records Databases'],
    },
  },
  {
    id: 'life-sciences', name: 'Life Sciences', icon: FlaskConical,
    problemsSolved: ['Clinical Trials', 'Regulatory Submission', 'Pharmacovigilance', 'Scientific Research'],
    includes: {
      policies: ['Adverse event reporting rules', 'Clinical data privacy policy', 'Regulatory submission governance', 'Human review thresholds'],
      prompts: ['Trial summary prompts', 'Adverse event analysis prompts', 'Research assistant queries', 'Regulatory review summaries'],
      businessIntents: ['Trial Summary', 'Adverse Event Analysis', 'Research Assistant', 'Regulatory Review'],
      integrations: ['Clinical Trial Management Systems (CTMS)', 'Electronic Data Capture (EDC)', 'FDA Submission Systems', 'Literature Databases'],
    },
  },
  {
    id: 'pharmaceutical', name: 'Pharmaceutical', icon: Pill,
    problemsSolved: ['Drug Discovery', 'Medical Affairs', 'Manufacturing Compliance', 'Regulatory Documentation'],
    includes: {
      policies: ['Manufacturing compliance rules', 'Regulatory documentation governance', 'Medical affairs approval thresholds', 'Data integrity policy'],
      prompts: ['Drug discovery research summaries', 'Medical affairs correspondence', 'Regulatory documentation drafting', 'Manufacturing deviation reports'],
      businessIntents: ['Compound Research Summary', 'Medical Affairs Inquiry', 'Manufacturing Deviation Review', 'Regulatory Documentation'],
      integrations: ['LIMS', 'SAP', 'Regulatory Submission Platforms', 'Electronic Lab Notebooks'],
    },
  },
  {
    id: 'energy-utilities', name: 'Energy & Utilities', icon: Zap,
    problemsSolved: ['Asset Monitoring', 'Grid Operations', 'Predictive Maintenance', 'Field Service', 'Regulatory Compliance'],
    includes: {
      policies: ['Grid safety governance', 'Predictive maintenance thresholds', 'Regulatory compliance rules', 'Field service escalation policy'],
      prompts: ['Asset monitoring alerts', 'Grid incident summaries', 'Field service work orders', 'Regulatory compliance reports'],
      businessIntents: ['Asset Health Diagnosis', 'Grid Incident Response', 'Field Service Dispatch', 'Compliance Reporting'],
      integrations: ['SCADA', 'OSIsoft PI', 'GIS Systems', 'IoT Sensor Platforms'],
    },
  },
  {
    id: 'logistics', name: 'Logistics & Supply Chain', icon: Truck,
    problemsSolved: ['Shipment Tracking', 'Route Optimization', 'Warehouse Operations', 'Vendor Management', 'Procurement'],
    includes: {
      policies: ['Vendor risk governance', 'Shipment exception escalation rules', 'Procurement approval thresholds', 'Data sharing policy'],
      prompts: ['Shipment tracking updates', 'Route optimization recommendations', 'Vendor risk summaries', 'Procurement request drafting'],
      businessIntents: ['Shipment Exception Handling', 'Route Optimization', 'Vendor Risk Review', 'Procurement Request'],
      integrations: ['SAP TM', 'Oracle SCM', 'EDI Systems', 'Warehouse Management Systems (WMS)'],
    },
  },
  {
    id: 'airline', name: 'Airline & Aviation', icon: Plane,
    problemsSolved: ['Passenger Services', 'Flight Operations', 'Crew Scheduling', 'Maintenance', 'Safety Compliance'],
    includes: {
      policies: ['Safety compliance governance', 'Crew scheduling rules', 'Maintenance approval thresholds', 'Passenger data privacy policy'],
      prompts: ['Passenger service responses', 'Flight disruption communications', 'Maintenance report summaries', 'Crew scheduling recommendations'],
      businessIntents: ['Flight Disruption Response', 'Maintenance Diagnosis', 'Crew Scheduling Assistance', 'Passenger Service Inquiry'],
      integrations: ['Sabre', 'Amadeus', 'MRO Systems', 'Crew Management Platforms'],
    },
  },
  {
    id: 'hospitality', name: 'Hospitality', icon: BedDouble,
    problemsSolved: ['Guest Experience', 'Booking Operations', 'Revenue Management', 'Concierge Services'],
    includes: {
      policies: ['Guest data privacy policy', 'Revenue management approval rules', 'Booking cancellation governance', 'Concierge escalation thresholds'],
      prompts: ['Guest correspondence', 'Concierge recommendations', 'Revenue management summaries', 'Booking confirmation drafting'],
      businessIntents: ['Guest Request Handling', 'Booking Modification', 'Revenue Optimization', 'Concierge Recommendation'],
      integrations: ['Opera PMS', 'OTA APIs (Booking.com, Expedia)', 'CRM Systems', 'Revenue Management Systems'],
    },
  },
  {
    id: 'education', name: 'Education', icon: GraduationCap,
    problemsSolved: ['Student Support', 'Admissions', 'Curriculum Assistance', 'Research', 'Faculty Productivity'],
    includes: {
      policies: ['Student data privacy (FERPA) policy', 'Admissions review governance', 'Academic integrity rules', 'Faculty approval thresholds'],
      prompts: ['Student support responses', 'Admissions review summaries', 'Curriculum recommendations', 'Research assistant queries'],
      businessIntents: ['Student Inquiry Response', 'Admissions Review', 'Curriculum Recommendation', 'Research Assistance'],
      integrations: ['Student Information Systems (SIS)', 'LMS (Canvas/Blackboard)', 'CRM Systems', 'Learning Analytics Platforms'],
    },
  },
  {
    id: 'legal', name: 'Legal', icon: Scale,
    problemsSolved: ['Contract Review', 'Legal Research', 'Compliance', 'Document Drafting', 'Case Summaries'],
    includes: {
      policies: ['Privilege & confidentiality protection', 'Document review approval thresholds', 'Client data governance', 'Human review requirements'],
      prompts: ['Contract review summaries', 'Legal research briefs', 'Document drafting assistance', 'Case summary generation'],
      businessIntents: ['Contract Review', 'Legal Research Query', 'Document Drafting', 'Case Summary'],
      integrations: ['iManage', 'Relativity', 'Westlaw/LexisNexis', 'Document Management Systems'],
    },
  },
  {
    id: 'enterprise-shared', name: 'Enterprise Shared Services', icon: Briefcase,
    tagline: 'Every enterprise needs this.',
    problemsSolved: ['HR', 'Finance', 'Procurement', 'IT', 'Legal', 'Internal Audit'],
    includes: {
      policies: ['Expense approval thresholds', 'Vendor risk governance', 'IT access control policy', 'HR data privacy rules'],
      prompts: ['HR policy responses', 'IT helpdesk resolution', 'Invoice processing summaries', 'Vendor risk assessment reports'],
      businessIntents: ['HR Assistant', 'IT Helpdesk', 'Invoice Processing', 'Vendor Risk Review', 'Procurement Assistant', 'Contract Review', 'Policy Search'],
      integrations: ['Workday', 'ServiceNow', 'SAP Ariba', 'DocuSign'],
    },
  },
];

const LAYERS = [
  {
    name: 'DecisionMesh Platform',
    tag: 'Foundation',
    description: 'The universal Enterprise AI Control Plane — governance, execution, and audit for every intent, regardless of industry.',
  },
  {
    name: 'DecisionMesh Accelerators',
    tag: 'Packaged',
    description: 'Industry-specific deployment packages built on the Platform — policies, prompts, intents, connectors, and dashboards tuned for a vertical.',
  },
  {
    name: 'DecisionMesh Marketplace',
    tag: 'Ecosystem',
    description: 'A partner ecosystem where banks, insurers, system integrators, ISVs, and consulting firms publish and monetize their own policies, prompts, intents, connectors, dashboards, and compliance packs.',
  },
];

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
