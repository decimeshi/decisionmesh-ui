import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function Soc2AiCompliance() {
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
          SOC 2 + AI: What Auditors Are Asking in 2025
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          SOC 2 auditors are now asking detailed questions about AI usage and LLM data flows. Here\'s exactly what they want to see and how to build the evidence package.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 10 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For GRC Teams</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `SOC 2 audits have changed.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For years, auditors focused on the same categories: access controls, change management, incident response, availability, confidentiality. AI wasn't on the checklist because AI wasn't in the stack.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `That changed in 2024. AI is now in almost every company's stack — and auditors know it. They're asking questions that compliance teams aren't prepared for, and the evidence you used to provide isn't adequate anymore.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This article covers exactly what auditors are asking, what they want to see, and how to build the evidence that satisfies them.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The New AI Questions on Every SOC 2 Audit</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `These are real questions auditors are now asking. Compliance teams have been surprised by them. You shouldn't be.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>On access and data flows:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;Describe all AI services your systems connect to and what data is transmitted.&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;Do you have Data Processing Agreements with your AI providers?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;Can employees send customer data to AI APIs directly? How is this controlled?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;What data classification applies to AI API inputs and outputs?&quot;`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>On model governance:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;How do you validate that AI outputs meet accuracy requirements before acting on them?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;What is your process for detecting and responding to AI model failures?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;How do you manage model versioning and changes?&quot;`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>On audit trails:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;Provide evidence that AI-assisted decisions involving customer data are logged with sufficient detail for audit.&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;How do you demonstrate that AI decisions are explainable to affected parties?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;Are AI audit logs protected from modification?&quot;`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>On risk:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;What is your AI risk assessment process?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;How do you assess third-party AI providers for security and compliance?&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `&quot;What controls prevent AI outputs from being used for unauthorized purposes?&quot;`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you're not ready for these, your audit is in trouble.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The SOC 2 Trust Services Criteria Most Affected by AI</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">CC6.1 — Logical and Physical Access Controls</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What auditors want to see for AI:</strong> Evidence that access to AI services is controlled and monitored.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Questions they'll ask:</em>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are AI API keys stored securely (secrets manager, not hardcoded)?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Who has access to AI API keys, and is it reviewed regularly?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are employee-facing AI tools provisioned through SSO?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are there controls preventing unauthorized AI tool usage?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Evidence you need:</em>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`✓ AI API key inventory with access control documentation
✓ Secrets management system showing AI credentials
✓ Access review records for AI service accounts
✓ Network controls (firewall rules) restricting AI API egress
✓ SSO/SAML records for employee AI tool provisioning`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">CC6.6 — Transmission of Data</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For AI, auditors have expanded this to cover data transmitted to external AI services.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What auditors want to see:</strong> Evidence that data transmitted to AI APIs is appropriate for external processing.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Questions they'll ask:</em>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Is customer PII transmitted to external AI APIs? If so, under what legal basis?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are AI providers assessed as third-party vendors?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What encryption is used for AI API calls?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Is there a DPA with each AI provider?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Evidence you need:</em>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`✓ Third-party vendor assessment for each AI provider (OpenAI, Anthropic, etc.)
✓ Signed Data Processing Agreements
✓ Data flow diagrams showing what data goes to which AI service
✓ PII scanning/masking documentation
✓ TLS configuration for all AI API connections`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">CC7.2 — System Monitoring</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> The entity monitors system components and the operation of controls for anomalies, and evaluates anomalies to determine if they represent security events.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What auditors want to see for AI:</strong> Evidence that AI usage is monitored for anomalies, unauthorized use, and unexpected behavior.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Questions they'll ask:</em>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `How do you detect unusual patterns in AI usage?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are there alerts for unexpected cost spikes that might indicate compromise?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `How do you monitor for prompt injection attempts?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What logging exists for AI API calls?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Evidence you need:</em>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`✓ AI usage monitoring dashboard screenshots
✓ Alert configuration for anomalous AI usage patterns
✓ Incident records for any AI-related security events
✓ Log retention configuration for AI audit logs`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">CC9.2 — Risk Mitigation — Vendor and Business Partner Risk</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> The entity assesses and manages risks associated with vendors and business partners.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What auditors want to see:</strong> Evidence that AI providers are assessed as vendors with the same rigor as other critical third parties.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Questions they'll ask:</em>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Is OpenAI/Anthropic on your vendor list?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Have you reviewed their SOC 2 reports?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What is your risk rating for each AI provider?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Do you have contractual protections (DPA, data return/deletion clauses)?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Evidence you need:</em>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`✓ Vendor risk assessment for each AI provider
✓ AI provider SOC 2 reports (OpenAI, Anthropic, Google all publish these)
✓ Contract documentation including DPA
✓ Annual vendor review records
✓ Risk rating and acceptance documentation`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">A1.1 and A1.2 — Availability</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What it covers:</strong> Current and projected processing capacity requirements are managed to help meet availability commitments.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What auditors want to see for AI:</strong> Evidence that AI dependencies don't create single points of failure for availability commitments.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Questions they'll ask:</em>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What is your fallback if your primary AI provider has an outage?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Are your SLAs achievable if OpenAI is unavailable for 4 hours?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `How do you handle AI API rate limiting?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Evidence you need:</em>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`✓ Business impact analysis for AI provider outages
✓ Fallback configuration (secondary providers, graceful degradation)
✓ Rate limit handling documentation
✓ Incident records for any AI availability events`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Building the AI Compliance Evidence Package</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The evidence you need isn't just documentation — auditors want to see controls in place with evidence they operate effectively. Here's the complete package.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1. AI Inventory</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A complete list of every AI service your company uses.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`AI System Inventory Template:

| System | Provider | Use Case | Data Processed | DPA? | Risk Rating | Owner |
|--------|----------|----------|----------------|------|-------------|-------|
| GPT-4o | OpenAI | Contract review | Contract text (no PII) | Yes | Medium | Legal |
| Claude | Anthropic | Customer support draft | Customer inquiries | Yes | Medium | Support |
| Copilot M365 | Microsoft | Employee productivity | Email, docs | Yes (MSFT DPA) | Low | IT |
| Internal LLM | Self-hosted | Fraud detection | Transaction data | N/A | High | Risk |`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2. Data Flow Documentation</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For each AI system: where does data come from, what data specifically, where does it go, who has access to the response.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Data Flow: Contract Review AI

Source: Legal team uploads contracts to internal portal
Data: Contract text, party names, financial terms
PII present: Yes (party names, possibly SSNs if consumer contracts)
PII handling: Names retained, SSNs masked before transmission
Transmitted to: Anthropic Claude API (US East region)
Legal basis: Legitimate interest (internal business process)
DPA: Anthropic DPA signed 2024-03-15
Retention by provider: Per Anthropic enterprise DPA: not used for training,
  retained 30 days then deleted
Response handling: Stored internally, access limited to legal team
Audit log: Yes, all API calls logged with request/response hash`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">3. DPAs and Vendor Assessments</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For every AI provider, you need:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Vendor Assessment Checklist — AI Providers:

□ SOC 2 Type II report reviewed (current year)
□ Penetration test results reviewed (if available)
□ Data Processing Agreement signed
□ Data retention and deletion terms documented
□ Training data usage restrictions confirmed
□ Data residency/region confirmed and appropriate
□ Incident notification terms confirmed
□ Annual review scheduled
□ Risk rating assigned and accepted

Signed by: [CISO name]
Date: [date]
Next review: [date + 1 year]`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4. AI Audit Log Evidence</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Auditors want to see that AI audit logs exist, are complete, and are protected.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Sample audit log entry for auditor review:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`{
  "request_id": "req_01HX...",
  "timestamp": "2025-03-15T14:23:11.847Z",
  "tenant_id": "acme-corp",
  "user_id": "user-legal-1042",
  "use_case": "contract_review",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "input_tokens": 1842,
  "output_tokens": 312,
  "pii_detected": true,
  "pii_types": ["person_name"],
  "pii_handling": "masked_before_transmission",
  "status": "success",
  "latency_ms": 1247,
  "signature": "sha256:a3f2...",
  "immutable": true
}`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Evidence of immutability:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Database table with REVOKE UPDATE/DELETE on application user`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Write-once cloud storage (S3 Object Lock, Azure Immutable Blob Storage)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Cryptographic signatures on each record`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Log integrity reports showing no modification`}} />
      </ul>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">5. AI Risk Assessment</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`AI Risk Assessment — [Company Name] — [Date]

Scope: All AI systems identified in AI Inventory (v2.1, [date])

Risk Categories Assessed:
1. Data exposure: Risk of sensitive data transmitted to external AI APIs
2. Model reliability: Risk of incorrect AI outputs affecting business decisions
3. Third-party dependency: Risk of AI provider outage or security incident
4. Regulatory compliance: Risk of non-compliance with AI regulations (EU AI Act, etc.)
5. Shadow AI: Risk of unauthorized AI tool usage

Risk Ratings:
[Table with each system, each risk category, likelihood, impact, rating, controls]

Residual Risk Acceptance:
Signed by: [Risk owner]
Date: [date]
Review frequency: Annual, or upon material change to AI systems`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What Good Looks Like vs. What Auditors Actually Find</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `What Auditors Expect`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `What They Typically Find`}} />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI providers on vendor list with assessments`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `&quot;We didn't think of OpenAI as a vendor&quot;`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `DPAs with all AI providers`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `No DPA with consumer API tier`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI usage monitored and alerted`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `No AI-specific monitoring`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI audit logs retained per policy`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI calls logged to ephemeral application logs`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `PII controls for AI API inputs`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `No PII scanning before AI API calls`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Employee AI tools via SSO`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Teams signed up for AI tools with personal accounts`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI in risk assessment`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `AI not mentioned in risk assessment`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Model versioning documented`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `&quot;We just use whatever version the API returns&quot;`}} />
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Conversation with Your Auditor</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `If you're mid-audit and getting AI questions you're not prepared for, here's how to handle it:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Don't panic and don't guess.</strong> &quot;I'll get back to you on that with documentation&quot; is a legitimate response. Making up an answer that's later found to be inaccurate is much worse than a gap.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Assess materiality.</strong> Not every AI control gap is a finding. An employee using ChatGPT for email drafts with no sensitive data is a different risk profile than customer PII flowing to an AI API uncontrolled. Focus your remediation effort on high-risk gaps.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Commit to a remediation timeline.</strong> For gaps found during an audit, auditors typically accept a documented remediation plan with a timeline as evidence that the control will be in place. &quot;We are implementing X by [date]&quot; with a project plan is better than a gap with no response.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Don't try to hide it.</strong> If an auditor finds that you knew about a control gap and didn't disclose it, that's an integrity issue that's much harder to remediate than the original gap.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Building Ongoing AI Compliance (Not Just Audit Readiness)</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Audit readiness is a snapshot. Compliance is continuous.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Quarterly:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review AI inventory — any new systems?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review vendor assessments — any new providers?`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review AI audit logs for anomalies`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review AI-related incidents`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Annually:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Full AI risk assessment refresh`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DPA renewals and provider SOC 2 report reviews`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI policy updates`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Employee training on AI acceptable use`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>On material change:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Any new AI system goes through vendor assessment before production`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Model changes documented`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Data flow changes assessed for PII implications`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Bottom Line</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `SOC 2 auditors have caught up with AI. The companies that pass cleanly are the ones who treated AI governance as infrastructure from the start — not something they retrofit after an audit finding.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The good news: the evidence package isn't as hard to build as it sounds. Most of it is documentation of controls you should have anyway. The gaps tend to be AI API logging, PII controls, and vendor assessments — all of which are solvable in 30-60 days with the right tooling.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh generates the AI audit logs, PII masking records, and compliance reports that your SOC 2 auditor is asking for — without requiring changes to every service in your stack. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">See how at decimeshi.com</a></em>`}} />


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
