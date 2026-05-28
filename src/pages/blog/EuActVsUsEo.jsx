import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function EuActVsUsEo() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {<div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Blog
        </a>
        <div style={{ marginBottom: 16 }}>
          <span style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Compliance
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
          EU AI Act vs US AI Executive Order: What\'s Actually Different
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          Side-by-side comparison of EU AI Act and US Executive Order 14110. Covers scope, risk classification, documentation, penalties, and how to build a dual-jurisdiction compliance program.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 11 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For Global Compliance</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Two major jurisdictions. Two very different approaches to AI governance. One company trying to comply with both.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you're a compliance or legal professional at a company operating in both the US and EU, you're navigating two frameworks that share goals but diverge significantly on scope, enforcement, and what they actually require you to do.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This article cuts through the noise and tells you what's actually different, what overlaps, and how to build a compliance program that satisfies both.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Basic Difference in Philosophy</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The EU AI Act</strong> is a risk-based, prescriptive framework. It classifies AI systems by risk level and imposes specific mandatory requirements on high-risk systems. Non-compliance can result in fines up to €35 million or 7% of global annual revenue — whichever is higher.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The US AI Executive Order (EO 14110)</strong> is a directive-based framework. It directs federal agencies to develop standards, guidelines, and requirements. It doesn't directly impose obligations on private companies — it shapes what federal contractors must do and sets direction for future regulation.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `In plain terms: <strong>the EU Act has teeth and affects you now. The US EO is directional and primarily affects you if you sell to the federal government.</strong>`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Scope: Who and What Is Covered</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">EU AI Act</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Who it applies to:</strong> Any company that:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Places an AI system on the EU market`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Uses an AI system in the EU`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Provides AI services to users in the EU`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is intentionally broad. If you have EU customers using AI-powered features of your product, the Act applies to you — regardless of where your company is headquartered.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> AI systems across all sectors. The Act uses a functional definition: an AI system is any machine-based system that, given objectives, generates outputs (predictions, recommendations, decisions, content) that influence real or virtual environments.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `LLMs, recommendation engines, fraud detection models, computer vision systems — all covered. The risk level determines what obligations apply.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Prohibited AI (Article 5):</strong> Certain AI applications are banned entirely:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Social scoring by governments or private entities`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Real-time biometric surveillance in public spaces (with narrow exceptions)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI that exploits psychological vulnerabilities for manipulation`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Predictive policing based solely on profiling`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Emotion recognition in workplace and educational settings`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>High-risk AI (Annex III):</strong> The category most relevant to enterprise compliance:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Biometric identification and categorization`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Critical infrastructure (energy, water, transport)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Education and vocational training`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Employment and workforce management (hiring, performance)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Access to essential private services (credit, insurance)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Law enforcement`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Migration and border control`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Administration of justice`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If your AI system falls into these categories, mandatory requirements apply.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">US Executive Order 14110</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Who it applies to:</strong> The EO directly applies to:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Federal agencies (must follow OMB guidance on AI use)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Companies selling AI to the federal government`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Developers of &quot;dual-use foundation models&quot; with national security implications`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Private companies not selling to the government are largely outside the direct mandate — but the EO's downstream effects (NIST standards, sector-specific regulations, procurement requirements) create indirect pressure.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> The EO addresses:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Safety and security of frontier AI models`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI's impact on workers and equity`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI use in critical infrastructure and national security`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `International AI governance leadership`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Federal government's own AI procurement and use`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Substantive Requirements: Where They Differ</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Risk Classification</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act:</strong> Mandatory, legally defined categories. If your system meets the criteria for high-risk, you have mandatory compliance obligations. No discretion.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> No mandatory risk classification for private companies. NIST's AI Risk Management Framework (AI RMF) provides voluntary guidance. Federal agencies must follow OMB guidance, but private companies choose whether to adopt NIST standards.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Compliance implication:</em> The EU Act requires you to formally classify every AI system you deploy in the EU. The US does not. However, using NIST AI RMF categorization for US systems is good practice and increasingly required in federal contracts.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Technical Documentation</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act (Article 11):</strong> High-risk AI systems require comprehensive technical documentation before deployment:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `System architecture and components`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Training data sources and characteristics`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Validation and testing results`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Performance metrics including accuracy, robustness, and cybersecurity`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Intended purpose and foreseeable misuse scenarios`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human oversight measures`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Instructions for use`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This documentation must be kept updated throughout the system's lifecycle and made available to national authorities on request.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> Developers of dual-use foundation models (those posing serious national security risks) must report to the government on training runs, safety tests, and red-teaming results. This affects frontier model developers (OpenAI, Anthropic, Google DeepMind, etc.) more than enterprise deployers.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For enterprise deployers, no mandatory documentation requirements exist at the federal level — but sector regulators (OCC for banking, CMS for healthcare) are increasingly requiring AI documentation.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Compliance implication:</em> For EU operations, build technical documentation for every high-risk AI system. Structure it to meet Article 11 requirements. For US operations, follow NIST AI RMF documentation guidance voluntarily and watch for sector-specific requirements.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Human Oversight</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act (Article 14):</strong> High-risk AI systems must be designed to allow effective human oversight. This includes:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The ability to understand the system's capabilities and limitations`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The ability to monitor for anomalies, malfunctions, or unexpected behavior`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The ability to override, interrupt, or disable the system`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Appropriate human interface features to enable oversight`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human oversight isn't optional for high-risk systems. &quot;The AI decided&quot; is not a compliant decision-making process.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> Emphasizes human oversight for national security and critical infrastructure AI, but doesn't mandate specific mechanisms for private sector systems. NIST AI RMF includes human oversight as a best practice.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Compliance implication:</em> For EU high-risk AI, build mandatory human review into your decision workflow. Document that it exists and that reviewers can and do override the system. For US, implement human oversight as best practice — sector regulators and future legislation will likely require it.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Transparency and Explainability</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act (Article 13):</strong> High-risk AI systems must be sufficiently transparent. Users must receive:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A description of the system's capabilities and limitations`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The degree of accuracy and robustness`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The purpose, conditions, and limitations of use`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human oversight measures`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Users subject to high-risk AI decisions have the right to request explanations.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The Act also requires transparency for AI-generated content (watermarking or disclosure) and for AI in chatbots (disclosure that the user is interacting with an AI).`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> Directs NIST to develop standards for content authentication and watermarking for AI-generated content. No mandatory private sector requirement currently — but several US states (California, Texas) have passed AI disclosure laws.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Compliance implication:</em> For EU, build explainability into every high-risk AI deployment. Log explanations alongside decisions. For US, watch state-level legislation — California's AI transparency requirements are likely to influence other states.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Conformity Assessment</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act (Articles 43-48):</strong> Before placing a high-risk AI system on the market, it must undergo conformity assessment. Depending on the risk category:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Some systems can be self-assessed (internal conformity assessment)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Systems in sensitive categories (biometrics, law enforcement) require third-party assessment by a Notified Body`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `After conformity assessment, the system must be registered in the EU AI database and bear CE marking.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> No conformity assessment requirement for private sector AI. Federal agencies must conduct risk assessments before deploying AI in high-impact uses.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Compliance implication:</em> For EU high-risk AI, plan for conformity assessment. Determine whether self-assessment is sufficient for your system category or whether you need a Notified Body. This takes months — build it into your product launch timeline.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Penalties</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act:</strong> Fines scale with violation type:`}} />
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Violation`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Maximum Fine`}} />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Prohibited AI practices`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `€35M or 7% global revenue`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `High-risk AI obligations`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `€15M or 3% global revenue`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Providing incorrect information`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `€7.5M or 1.5% global revenue`}} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `SME multiplier: fines for small companies calculated on the lower of the fixed amount or the percentage figure.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Enforcement: National market surveillance authorities in each member state. The EU AI Office oversees general-purpose AI models.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US EO:</strong> No direct penalty mechanism for private companies (it's an executive order, not legislation). FTC authority over deceptive AI practices (Section 5 FTC Act) can result in civil penalties. Sector regulators (OCC, CFPB, CMS) can enforce AI governance in their sectors.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The EU AI Liability Directive (separate from the Act, still pending) would create private rights of action for AI-caused harm.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What Overlaps: Build Once, Use Both</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Despite the differences, several compliance investments satisfy both frameworks:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Risk assessment:</strong> Both frameworks require understanding and documenting AI risks. A thorough risk assessment using NIST AI RMF serves as the foundation for EU Act classification and US best practice.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Audit trails:</strong> EU Act Article 12 requires high-risk systems to log enough data to enable post-market monitoring. NIST AI RMF recommends audit trails for all high-impact AI. Build once, satisfies both.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Incident response:</strong> Both frameworks expect you to detect, investigate, and report AI system failures. An AI incident response plan is required for EU high-risk systems and best practice for US.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Vendor assessment:</strong> If you're using third-party AI (GPT-4, Claude, etc.), both frameworks require understanding how those providers handle your data. The CISO's AI vendor assessment checklist applies to both jurisdictions.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Human oversight:</strong> Mandatory for EU high-risk AI. Best practice for US. Implementing it once covers both.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Timeline Problem</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The EU AI Act phases in over time:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`February 2025: Prohibitions take effect
               (banned AI practices prohibited)

August 2025:   GPAI model obligations take effect
               (applies to providers of general-purpose AI models)

August 2026:   High-risk AI obligations take effect
               (core compliance obligations for high-risk systems)

August 2027:   High-risk AI in Annex I take effect
               (AI in regulated products: medical devices, machinery, etc.)`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>If you have high-risk AI systems operating in the EU, your compliance deadline for most obligations is August 2026.</strong> That's not a long runway for systems that require conformity assessment, technical documentation, and human oversight infrastructure.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>US timeline:</strong> The EO's deadlines are staggered across federal agencies and largely completed. AI-specific legislation at the federal level remains uncertain — the AI Act equivalent bill has not passed as of this writing.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Building a Dual-Jurisdiction Compliance Program</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Given the overlap in goals but divergence in requirements, here's how to structure a program that covers both:`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Phase 1: Inventory and Classification (Months 1-2)</h3>
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Inventory all AI systems used in EU-facing or US-facing products`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Classify each against EU Act risk categories`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Flag systems that may require conformity assessment`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Identify NIST AI RMF profile appropriate for each`}} />
      </ul>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Phase 2: Gap Assessment (Months 2-3)</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For each high-risk EU system, assess gaps in:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Technical documentation`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human oversight mechanisms`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Transparency and explainability features`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Audit logging`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Conformity assessment readiness`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For US systems, assess gaps against NIST AI RMF Govern, Map, Measure, Manage functions.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Phase 3: Remediation (Months 3-12)</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Prioritize by risk and timeline:`}} />
      <ol className="list-decimal list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Prohibited AI — immediate`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `EU high-risk systems with August 2026 deadline`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `US federal contractor requirements`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Voluntary NIST alignment for non-regulated US systems`}} />
      </ol>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Phase 4: Ongoing Governance</h3>
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Quarterly AI system review`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Annual risk reassessment`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Monitoring for new sector-specific requirements`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `EU AI database registration maintenance`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Incident reporting procedures in place`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Bottom Line</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Dimension`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `EU AI Act`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `US EO 14110`}} />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Legally binding`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Yes`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Mostly no (for private sector)`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Risk classification`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Mandatory`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Voluntary (NIST)`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Technical documentation`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Mandatory (high-risk)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Voluntary`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Human oversight`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Mandatory (high-risk)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Best practice`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Conformity assessment`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Mandatory (high-risk)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `None`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Penalties`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Up to 7% global revenue`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Indirect (FTC, sector)`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Deadline`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `August 2026 (high-risk)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Ongoing`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Who it hits`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Anyone in EU market`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Federal contractors mainly`}} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you operate in the EU: the Act is law, it applies to you, and the August 2026 deadline is sooner than it looks.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you're US-only: the EO sets direction. Sector regulators and state laws are the near-term enforcement risk. But the EU Act establishes a global standard that US regulation will likely follow.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Build for the EU Act. You'll be ahead of where US regulation is going.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh helps enterprises meet EU AI Act audit trail, human oversight, and documentation requirements — across all LLM providers, without changing your existing architecture. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">See how at decimeshi.com</a></em>`}} />


      <div style={{ marginTop: 64, background: 'linear-gradient(135deg, #0a1045, #1e3a8a)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
          DecisionMesh · AI Intent Control Plane
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>
          Govern every AI decision your company makes
        </h3>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
          Audit trails, policy enforcement, cost controls, and compliance reporting — free during beta.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/auth/login" style={{ background: '#2563eb', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Start for free →
          </a>
          <a href="/blog" style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Read more articles
          </a>
        </div>
      </div>

      </div>
    </div>
  );
}
