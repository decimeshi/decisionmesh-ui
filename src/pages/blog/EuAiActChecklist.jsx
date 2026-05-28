import React, { useEffect } from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function EuAiActChecklist() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <BlogSeo
        title='EU AI Act Compliance Checklist for Enterprise LLM Deployments (2025)'
        description='Practical checklist for EU AI Act compliance covering audit trails, human oversight, PII handling, explainability, and incident response with actionable steps.'
        slug='eu-ai-act-compliance-checklist-llm'
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
            EU AI Act Compliance Checklist for Enterprise LLM Deployments (2025)
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
            Practical checklist covering audit trails, human oversight, PII handling, explainability, and incident response — with actionable steps for every requirement.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
              <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· 9 min read</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· For Compliance Teams</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Published on decimeshi.com/blog | Target keyword: &quot;EU AI Act compliance LLMs&quot;</em>`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The EU AI Act is now law. If your company uses AI to make decisions that affect people — loan approvals, insurance underwriting, medical triage, hiring, fraud detection — you're likely operating a high-risk AI system under the Act.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Most compliance guides tell you what the law says. This one tells you what you actually need to build.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Who This Affects</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The EU AI Act classifies AI systems into risk tiers:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Unacceptable risk</strong> (banned outright): social scoring, real-time biometric surveillance, subliminal manipulation.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>High risk</strong> (your problem if you're in fintech, healthcare, HR, or legal): credit scoring, insurance risk assessment, medical devices, hiring tools, essential public services, law enforcement.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Limited risk</strong>: chatbots, deepfakes — transparency obligations only.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Minimal risk</strong>: most AI, no obligations.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you're calling GPT-4 to help approve or deny a loan, assess an insurance claim, screen a job application, or recommend a medical treatment — you're in the high-risk category.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Compliance Checklist</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1. Technical Documentation</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> Before deploying a high-risk AI system, you must produce technical documentation that describes the system's purpose, design, training data, performance metrics, and limitations.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What this means for LLM users:</strong> You need to document which model you're using, what prompts you're sending, what decisions the output feeds into, and what the error rates look like.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>How to get compliant:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Document every LLM integration: model name, version, provider, use case`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Record prompt templates used for high-risk decisions`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Run validation tests and record accuracy metrics`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Update documentation every time you change models or prompts`}} />
      </ul>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ Model registry: every LLM in production documented
□ Prompt library: all prompts used for high-risk decisions versioned
□ Performance metrics: accuracy, false positive/negative rates
□ Data documentation: what training/fine-tuning data was used
□ Limitations documented: what the system cannot reliably do`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2. Audit Trail and Logging</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> High-risk AI systems must automatically log events to enable post-hoc monitoring. Logs must be kept for at minimum the lifetime of the system, or 10 years for certain categories.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What this means for LLM users:</strong> Every AI decision that affects a person must be logged. The log must contain enough information to reconstruct what happened and why.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What a compliant audit record contains:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Timestamp (to the millisecond)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `User or system that initiated the request`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Input data (with PII fields identified)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Which model was called, which version`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The prompt sent (sanitized)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The model's output`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What decision was made based on that output`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human review status (if applicable)`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The problem most companies have:</strong> They log the API call to OpenAI. They don't log the decision that resulted from it, the context it was made in, or whether a human reviewed it.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ Every AI-assisted decision logged with full context
□ Logs are immutable (cannot be modified after writing)
□ Logs retained for required duration (minimum 10 years for financial)
□ Logs exportable in regulator-readable format
□ Log integrity verifiable (cryptographic signatures)`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">3. Human Oversight</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> High-risk AI systems must be designed to allow humans to effectively oversee, understand, intervene, and override the system.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What this means for LLM users:</strong> You cannot fully automate high-risk decisions. A human must be able to understand what the AI recommended and why, and must be able to override it.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What &quot;effective oversight&quot; actually means:</strong> A human clicking &quot;approve&quot; after seeing a score is not effective oversight. Effective oversight means the human understands the AI's reasoning and has the information and authority to override it.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ High-risk decisions have human review step
□ Reviewers can see AI reasoning, not just the output
□ Override mechanism documented and functional
□ Override rates tracked and reviewed
□ Reviewers trained on the AI system's limitations`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4. Data Governance</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> Training data and input data must be subject to appropriate data governance practices. High-risk systems must use data that is relevant, representative, and free from errors and biases.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What this means for LLM users:</strong> If you're using general-purpose LLMs (GPT-4, Claude, etc.), you inherit their training data risks. You're responsible for ensuring the inputs you send are appropriate and that outputs don't perpetuate bias in your decisions.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>PII in prompts — the hidden compliance failure:</strong> The most common violation we see: companies sending customer PII (names, account numbers, medical data) in prompts to external LLM APIs. This is a GDPR violation in addition to an AI Act risk.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ PII detected and masked before sending to external LLM APIs
□ Data minimization: only send what the model needs
□ Purpose limitation: same data not reused for different AI purposes
□ Bias testing: outputs tested across demographic groups
□ Data retention: inputs/outputs not retained by providers longer than necessary`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">5. Transparency and Explainability</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> People subject to high-risk AI decisions must be informed that AI was used, and must be able to request an explanation of the decision.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What this means for LLM users:</strong> If your LLM helps deny a loan, the customer can ask why. You need to be able to explain what the AI considered and how it reached its output.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The explainability problem with LLMs:</strong> LLMs are black boxes. They don't produce structured explanations by default.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Solutions:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Prompt engineering: ask the model to explain its reasoning step by step`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Structured output: require the model to output a decision plus reasoning`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Chain-of-thought logging: capture the model's reasoning process`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Human-readable audit records that can be shown to customers`}} />
      </ul>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ AI usage disclosed to affected individuals
□ Explanation generation tested for all high-risk decision types
□ Explanation stored alongside the decision in the audit log
□ Process for handling subject explanation requests
□ Response time for explanation requests (GDPR: 1 month)`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">6. Incident Response</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What the Act requires:</strong> Providers and deployers of high-risk AI systems must report serious incidents to the relevant national authority.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What counts as a serious incident:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Death or serious harm to health`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Significant property damage`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Serious infringement of fundamental rights`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>For LLM deployers this means:</strong> If your AI system makes a discriminatory decision at scale, denies someone access to essential services incorrectly, or causes financial harm — that's a reportable incident.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Checklist:
□ Incident detection: monitoring for AI decision errors at scale
□ Incident classification: criteria for "serious" vs "minor"
□ Reporting procedure: who reports, to which authority, in what timeframe
□ Post-incident review: root cause analysis and remediation
□ Corrective action: process to pause or recall AI decisions if needed`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Infrastructure Gap</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Most companies can check some of these boxes for their traditional software.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Almost none can check them for their LLM usage.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The reason is that LLM calls are typically made directly from application code, with no governance layer in between. There's no:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Centralized audit trail across all LLM providers`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `PII detection before data leaves your network`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Policy enforcement on who can call which model for which purpose`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Cost attribution by team or decision type`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Explainability capture at the point of decision`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is the governance gap — and it's exactly what we built DecisionMesh to close.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Getting Compliant: Your 90-Day Plan</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 1-30: Discover and Document</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Inventory every place your teams call LLM APIs`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Classify each use case by risk level`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Document the models, prompts, and data used`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 31-60: Instrument and Control</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Deploy a governance layer (or build one) to capture all LLM calls`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Enable PII detection and masking`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Start capturing audit logs`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 61-90: Validate and Certify</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Run bias testing on high-risk decision outputs`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Test human oversight and override workflows`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Prepare technical documentation package`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Engage a compliance consultant for review`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Further Reading</h2>
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">EU AI Act full text</a>`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<a href="https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">NIST AI Risk Management Framework</a>`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<a href="https://ico.org.uk/for-organisations/guide-to-data-protection/key-dp-themes/guidance-on-ai-and-data-protection/" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">ICO guidance on AI and data protection</a>`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh is an AI Intent Control Plane that helps enterprises meet EU AI Act, SOC 2, HIPAA, and GDPR requirements. Free during beta — <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">try it at decimeshi.com</a>.</em>`}} />

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
