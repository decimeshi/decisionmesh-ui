import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function AiGovernanceFintech() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      <BlogSeo
        title="AI Governance for Fintech: Meeting RBI and SEBI AI Guidelines"
        description="RBI and SEBI are issuing guidance on AI use in financial services. Here's what fintech companies need to implement — model risk management, audit trails, explainability, and bias testing."
        slug="ai-governance-fintech-rbi-sebi-guidelines"
      />

      <div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to Blog
          </a>
          <div style={{ marginBottom: 16 }}>
            <span style={{ background: 'rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Finance
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
            AI Governance for Fintech: Meeting RBI and SEBI AI Guidelines
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
            India's financial regulators are watching AI adoption closely. Here's what fintech companies need to build before the audit questions arrive.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
              <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>June 2026</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· 11 min read</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· For Fintech CTOs & Compliance</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Fintech companies in India are deploying AI faster than any other sector — credit scoring, fraud detection, KYC automation, customer service, investment advice. The technology is moving fast. The regulation is catching up.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The Reserve Bank of India (RBI) and Securities and Exchange Board of India (SEBI) have both issued guidance on AI use in financial services. The message is consistent: AI is welcome, but it must be explainable, auditable, fair, and governed.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This guide covers what fintech companies need to implement — practically, not theoretically.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What RBI Says About AI</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `RBI's guidance on AI in banking and financial services emphasises several principles:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Model risk management</strong> — AI models used for credit decisions, fraud detection, or risk assessment must be validated, monitored, and periodically reviewed.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Explainability</strong> — decisions affecting customers must be explainable. "The model decided" is not an acceptable answer when a loan is rejected or an account is flagged.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Human oversight</strong> — high-impact AI decisions require a human review mechanism. Fully automated adverse decisions without human oversight are a regulatory risk.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Data governance</strong> — training data must be representative, accurate, and compliant with DPDPA. Biased training data produces biased models.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Vendor due diligence</strong> — outsourcing AI to a third-party provider doesn't outsource the regulatory responsibility. The regulated entity remains accountable.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What SEBI Says About AI</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `SEBI's focus is on AI used in investment management, algo trading, and investor advisory:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Algorithm audit trails</strong> — every AI-driven trade or investment recommendation must have a complete audit trail showing inputs, model version, outputs, and execution.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Market manipulation controls</strong> — AI trading systems must have controls preventing wash trading, spoofing, or other manipulative patterns.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Investor suitability</strong> — AI advisory systems must document why a recommendation was suitable for a specific investor profile.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>System resilience</strong> — AI trading systems must have circuit breakers, kill switches, and tested failover procedures.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The AI Governance Framework for Fintech</h2>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Model Inventory and Classification</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Start with a complete inventory of every AI model in production. For each model, document:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Purpose</strong> — what decision does it support? Credit scoring, fraud detection, KYC, customer service?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Risk tier</strong> — high (directly affects credit/fraud decisions), medium (advisory), low (internal operations)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Data inputs</strong> — what personal/financial data does it consume?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Model owner</strong> — who is accountable for model performance and compliance?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Vendor</strong> — is it in-house or a third-party model? (LLM providers count)`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Immutable Audit Trail for AI Decisions</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Every AI decision that affects a customer must be logged with sufficient detail to reconstruct what happened. For a credit decision, the audit record must include:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Customer identifier (anonymised or encrypted)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Model version and configuration at time of decision`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Input features used (not raw PII — feature values)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Model output (score, classification, recommendation)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Timestamp — immutable, cannot be modified after the fact`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human review action (if applicable)`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The audit trail must be <strong>immutable</strong> — RBI and SEBI auditors will look for evidence that logs haven't been modified. Implement database-level protection (triggers that prevent UPDATE/DELETE on audit tables).`}} />

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Explainability for Customer-Facing Decisions</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If your AI rejects a loan, declines a transaction, or flags an account, the customer has a right to know why. Implement:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>SHAP or LIME values</strong> for ML models — shows which features most influenced the decision`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Plain language explanations</strong> for customers — "Your application was declined because your debt-to-income ratio exceeded our threshold" not "The model score was 0.23"`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>LLM reasoning logs</strong> — if using an LLM for decisions, log the full chain of thought, not just the output`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Appeal mechanism</strong> — customers must be able to challenge automated decisions and have them reviewed by a human`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Bias Testing and Fairness</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `RBI is particularly focused on discriminatory AI outcomes in credit and financial inclusion. Test your models for:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Demographic parity</strong> — are approval rates significantly different across gender, age, location, or religion?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Equal opportunity</strong> — among qualified applicants, are acceptance rates consistent across groups?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Proxy discrimination</strong> — is the model using proxies for protected characteristics (e.g., PIN code as a proxy for caste or religion)?`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Run bias tests quarterly and after every model update. Document results and remediation steps.`}} />
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Model Risk Management</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Validation before deployment</strong> — every model must be independently validated before going live. Don't let the model builder validate their own model.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Performance monitoring</strong> — track model accuracy, false positive/negative rates, and concept drift in production. Set thresholds that trigger review.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Champion/challenger testing</strong> — run new model versions against the current model in parallel before full rollout.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Model versioning</strong> — every deployed model must have a version number. The audit trail must record which version made which decision.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Decommission process</strong> — retiring a model must include archiving its documentation and decision logs for the required retention period.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">LLM-Specific Requirements for Fintech</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Traditional ML model governance frameworks weren't designed for LLMs. Here's what's different:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Prompt logging</strong> — every prompt sent to an LLM in a regulated context must be logged. The prompt is the "input" that explains the output.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Hallucination controls</strong> — LLMs can generate plausible but incorrect financial information. Implement RAG (Retrieval Augmented Generation) with verified sources, and add output validation for financial data.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>PII in prompts</strong> — detect and mask PII before sending to any external LLM API. Customer financial data must not flow to third-party LLMs without DPA compliance.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>BYOK for LLM providers</strong> — use Bring Your Own Key to prevent your prompts from being used for model training by the LLM provider.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Bottom Line</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `RBI and SEBI are not trying to slow down AI adoption in fintech. They're trying to ensure that AI adoption doesn't create systemic risks, discriminatory outcomes, or unaccountable decisions.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The fintech companies that will win long-term are those that treat AI governance as a competitive advantage — not just a compliance burden. An immutable audit trail isn't just for regulators. It's what lets your risk team understand model behaviour, your engineering team debug production issues, and your executive team make confident AI deployment decisions.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh provides the AI intent control plane that fintech companies need — immutable audit trails, policy enforcement, explainability capture, and BYOK for all LLM providers. Built for RBI/SEBI compliance from the ground up. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">See how at decimeshi.com</a></em>`}} />

        <div style={{ marginTop: 64, background: 'linear-gradient(135deg, #0a1045, #1e3a8a)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
            DecisionMesh · AI Intent Control Plane
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>
            AI governance built for financial services
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
            Audit trails, model versioning, explainability, and policy enforcement — free during beta.
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
