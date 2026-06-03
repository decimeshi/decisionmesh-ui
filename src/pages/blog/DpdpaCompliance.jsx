import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function DpdpaCompliance() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      <BlogSeo
        title="DPDPA 2023 Compliance Checklist for AI Systems"
        description="India's Digital Personal Data Protection Act 2023 is in force. Here's a practical checklist for AI systems — covering consent, data minimisation, erasure, and breach notification obligations."
        slug="dpdpa-2023-ai-compliance-checklist"
      />

      <div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to Blog
          </a>
          <div style={{ marginBottom: 16 }}>
            <span style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Compliance
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
            DPDPA 2023 Compliance Checklist for AI Systems
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
            India's Digital Personal Data Protection Act 2023 is now in force. If your AI system processes personal data of Indian citizens, here's exactly what you need to do.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
              <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>June 2026</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· 10 min read</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· For GRC & Legal Teams</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `India's Digital Personal Data Protection Act 2023 (DPDPA) is the country's first comprehensive data protection law. It applies to any organisation that processes the personal data of individuals in India — regardless of where the organisation is based.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For AI systems, this is significant. Every LLM call, every inference run, every AI-assisted decision that involves personal data is now governed by DPDPA. This isn't theoretical — enforcement is coming, and the fines are substantial (up to ₹250 crore per violation).`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This checklist covers what you need to implement, with specific attention to AI and LLM systems.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What DPDPA Covers</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DPDPA applies to <strong>digital personal data</strong> — any data about an identifiable individual, processed digitally. For AI systems this includes:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Names, email addresses, phone numbers in prompts or context`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Customer data sent to LLM APIs for analysis or summarisation`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Employee data processed by AI HR tools`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Financial data used in AI-assisted decisions (credit, fraud, risk)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Biometric data used for AI authentication or identification`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Anonymised data is exempt — but anonymisation must be irreversible. Pseudonymised data (where re-identification is possible) is still covered.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The DPDPA AI Compliance Checklist</h2>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Lawful Basis and Consent</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Identify the lawful basis</strong> for every AI processing activity. DPDPA recognises: consent, legitimate use (employment, public interest, emergency), and legal obligation.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Obtain free, specific, informed consent</strong> before processing personal data with AI. Bundled or pre-ticked consent is invalid.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Record consent timestamps and scope</strong> — you must be able to prove what the user consented to and when.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Allow consent withdrawal</strong> — users must be able to withdraw consent as easily as they gave it. Your AI pipeline must stop processing that user's data within a reasonable time.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Children's data</strong> — processing personal data of minors requires verifiable parental consent. AI systems must not process children's data for behavioural tracking or targeted advertising.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Purpose Limitation and Data Minimisation</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Define the purpose</strong> of each AI processing activity clearly. You cannot use data collected for one purpose in a different AI model or use case without fresh consent.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Minimise data in prompts</strong> — send only the fields your AI actually needs. If the model only needs a customer's order history, don't include their name, address, and payment method.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Audit your LLM prompts</strong> — log what personal data is sent to which provider and for what purpose.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Review AI training data</strong> — if you fine-tune models on customer data, that data must have been collected with consent for that purpose.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Data Principal Rights</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DPDPA gives individuals (called Data Principals) significant rights. Your AI systems must be able to honour all of them:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right to information</strong> — users can ask what personal data you hold and how it's being processed, including by AI systems.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right to correction</strong> — users can request correction of inaccurate data. If your AI trained on this data, you need a process to handle this.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right to erasure</strong> — implement an erasure API. When a user exercises this right, all their personal data must be deleted across your entire stack — including AI logs, training sets, and inference caches.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right to grievance redressal</strong> — provide a mechanism for users to raise complaints about AI processing. Appoint a Data Protection Officer (DPO) or designated point of contact.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right to nominate</strong> — users can nominate someone to exercise their rights in case of death or incapacity.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Data Fiduciary Obligations</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Maintain data accuracy</strong> — personal data used in AI decisions must be accurate. Implement validation before feeding data into AI pipelines.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Implement security safeguards</strong> — encrypt personal data at rest and in transit. This applies to data in AI pipelines, prompt logs, and inference outputs.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Delete data when purpose is fulfilled</strong> — don't retain personal data in AI logs beyond the retention period. Implement automated deletion.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Register as Significant Data Fiduciary (SDF)</strong> if you process large volumes of personal data or process sensitive data — SDFs face additional obligations including DPIA requirements and algorithm audits.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Data Processors and AI Vendors</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Every AI provider is a Data Processor</strong> under DPDPA. You must have a written contract specifying processing purposes, security obligations, and deletion requirements.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Check your LLM provider contracts</strong> — does OpenAI, Anthropic, or Gemini have DPA-compliant terms for Indian personal data? Review their data processing addendums.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Cross-border transfers</strong> — DPDPA allows transfer of personal data outside India unless the Central Government restricts specific countries. Monitor the Government's negative list as it evolves.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>BYOK (Bring Your Own Key)</strong> — using BYOK with AI providers ensures your data isn't used for model training and gives you control over data deletion.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Breach Notification</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Notify the Data Protection Board of India</strong> of any personal data breach — DPDPA requires notification without delay (specific timelines to be prescribed in rules).`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Notify affected individuals</strong> of breaches that may cause harm to them.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>AI-specific breaches</strong> — include scenarios like model inversion attacks, prompt injection exposing PII, and unintended data memorisation in your incident response plan.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Document all incidents</strong> in your audit trail, including those that don't cross the notification threshold.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">DPDPA vs GDPR: Key Differences for AI Teams</h2>
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#0a1045', color: 'white' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Area</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>DPDPA 2023</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>GDPR</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Lawful basis', 'Consent + Legitimate use (narrower)', '6 lawful bases including legitimate interests'],
                ['Data localisation', 'Restrictions possible via negative list', 'Adequacy decisions + SCCs'],
                ['Fines', 'Up to ₹250 crore per violation', 'Up to €20M or 4% global turnover'],
                ['DPO requirement', 'Significant Data Fiduciaries only', 'Mandatory in many cases'],
                ['Right to object', 'Not explicitly included', 'Included (Article 21)'],
                ['AI-specific rules', 'Algorithm audits for SDFs', 'GDPR AI Act alignment'],
              ].map(([area, dpdpa, gdpr], i) => (
                <tr key={area} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0a1045' }}>{area}</td>
                  <td style={{ padding: '10px 16px', color: '#374151' }}>{dpdpa}</td>
                  <td style={{ padding: '10px 16px', color: '#374151' }}>{gdpr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">30-Day Implementation Plan</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 1 — Inventory:</strong>`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Map all AI systems that process Indian personal data`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Identify all LLM API calls and what personal data they include`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review all AI vendor contracts for DPA compliance`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 2 — Controls:</strong>`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Implement consent management for AI processing`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Add PII detection and minimisation to AI pipelines`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Build or verify erasure API covers all AI data stores`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 3 — Documentation:</strong>`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Create Records of Processing Activities (RoPA) for AI systems`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Document consent records and retention schedules`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Update privacy policy to reflect AI processing`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 4 — Testing:</strong>`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Test erasure API end-to-end across all AI systems`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Test consent withdrawal flow`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Run a tabletop breach notification exercise`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Bottom Line</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DPDPA 2023 is India's most significant data protection legislation. For AI systems, it means every LLM call that touches personal data of Indian citizens needs a lawful basis, a purpose, a retention limit, and an erasure path.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The companies that will struggle are those treating DPDPA as a legal checkbox. The ones that will comply cleanly are those that build data governance into their AI infrastructure — logging what data goes where, enforcing purpose limits, and making erasure automatic.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh provides the audit trail, PII detection, and erasure API that DPDPA compliance requires for AI systems — with data residency in the EU and BYOK for all LLM providers. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Learn more at decimeshi.com</a></em>`}} />

        <div style={{ marginTop: 64, background: 'linear-gradient(135deg, #0a1045, #1e3a8a)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
            DecisionMesh · AI Intent Control Plane
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>
            DPDPA-ready AI governance infrastructure
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
            Audit trails, consent tracking, erasure API, and PII detection — built for Indian and global compliance.
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
