import React from 'react';

export default function CisoVendorChecklist() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {<div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Blog
        </a>
        <div style={{ marginBottom: 16 }}>
          <span style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Security
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
          The CISO\'s AI Vendor Security Assessment Checklist
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          Complete security assessment checklist for AI vendors including OpenAI, Anthropic, and Google. Covers SOC 2, DPAs, HIPAA BAAs, data handling, and risk rating.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 11 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For CISOs & GRC</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `When your engineering team wants to integrate a new SaaS tool, you have a process. Vendor questionnaire. SOC 2 review. Legal review. Risk rating. Sign-off before production.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `When your engineering team wants to integrate OpenAI, that process often gets skipped. It's &quot;just an API.&quot; The developer adds a key and ships it.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is a problem. OpenAI, Anthropic, Google, and every other AI provider is a third-party data processor with access to whatever your team sends in prompts — which, in practice, is often sensitive customer data, source code, financial records, and internal strategy documents.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `They deserve the same scrutiny as any other critical vendor. This checklist is how you do that assessment.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Before You Start: Classify What Data Will Be Sent</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The most important question before any AI vendor assessment is what data will actually flow to this provider. The answer determines the risk level and the depth of assessment required.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Data Classification for AI Vendor:

[ ] Public data only (marketing content, public documentation)
    → Low risk. Standard assessment.

[ ] Internal data (business processes, non-sensitive employee info)
    → Medium risk. Standard assessment + DPA required.

[ ] Confidential data (proprietary code, financial models, strategy)
    → High risk. Full assessment + strong DPA + legal review.

[ ] Customer PII (names, emails, account data, behavior)
    → High risk. Full assessment + DPA + GDPR/CCPA analysis + legal sign-off.

[ ] Sensitive PII (health data, financial data, government IDs)
    → Critical risk. Full assessment + BAA or equivalent + regulatory review
      + may require on-premise/private deployment.

[ ] Regulated data (PHI, PCI, ITAR, classified)
    → Do not use commercial cloud AI without specific authorization.`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Section 1: Security Posture</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1.1 Certifications and Audits</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Required Documentation:

[ ] SOC 2 Type II report (current year — must be <12 months old)
    → Request directly from vendor or via their trust portal
    → Review: availability, security, confidentiality sections
    → Check for exceptions and management responses

[ ] ISO 27001 certificate (if applicable)
    → Verify certificate is current (check expiry date)
    → Confirm scope covers AI inference services

[ ] Penetration testing — ask:
    - How often do you conduct penetration tests?
    - Do you use external third parties?
    - Will you share the executive summary?
    - What is your remediation SLA for critical findings?

[ ] Bug bounty program
    → Does one exist? What is the scope?
    → What is the average time to resolution?

Vendor responses to document:
OpenAI: SOC 2 Type II ✓ | ISO 27001 ✓ | Pen test: Yes, external
Anthropic: SOC 2 Type II ✓ | ISO 27001 ✓ | Bug bounty ✓
Google (Vertex AI): SOC 2 ✓ | ISO 27001 ✓ | FedRAMP ✓`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1.2 Infrastructure Security</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Questions to ask:

[ ] What cloud providers host your inference infrastructure?
    (AWS, GCP, Azure, owned data centers?)

[ ] What data regions are available?
    - EU data residency for GDPR?
    - US-only options?
    - Can we specify region?

[ ] Is infrastructure shared or dedicated?
    - Multi-tenant by default?
    - Is dedicated/private deployment available?

[ ] How are API keys secured on your end?
    - Where are they stored?
    - What access controls exist?
    - What happens on compromise?

[ ] What is your vulnerability management process?
    - How quickly are critical vulnerabilities patched?
    - Do you notify customers of infrastructure CVEs?

[ ] Do you have a CSPM/cloud security posture program?`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1.3 Access Controls</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Who at the vendor has access to prompt data?
    - Engineering staff?
    - Trust and safety reviewers?
    - Customer support?
    - Under what circumstances?

[ ] Is access to customer data logged and audited?

[ ] Do employees with data access undergo background checks?

[ ] What is the access review cadence?

[ ] How is privileged access managed?
    - Just-in-time access?
    - MFA required?
    - Session recording?`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Section 2: Data Handling</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is the most critical section for AI vendors. The questions here determine whether your data is safe.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2.1 Data Retention</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Key questions:

[ ] How long are prompts and completions retained?
    - Default retention period?
    - Can we reduce or eliminate retention?
    - Does retention differ by tier (free vs enterprise)?

[ ] Where is retention documented?
    - In the DPA?
    - In Terms of Service?
    - Will they confirm in writing?

[ ] What triggers retention?
    - Is content retained even if request fails?
    - Are metadata retained longer than content?

Standard answers to know:
OpenAI (enterprise API with zero data retention): 0 days
OpenAI (default API): 30 days
Anthropic (enterprise): configurable
Google Vertex AI: 0 days (not used for training)`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2.2 Training Data Usage</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Is our data used to train or fine-tune models?
    - Default behavior?
    - How to opt out?
    - Is opt-out confirmed in the DPA?

[ ] Does opting out affect service quality or pricing?

[ ] What data is used for safety monitoring vs training?
    (Trust and safety review is not the same as training)

[ ] What happens to data used for trust and safety review?
    - Who reviews it?
    - How long is it retained?
    - Is it ever used to improve models?

[ ] If we use fine-tuning, who owns the fine-tuned model?
    - Can we export it?
    - What happens if we terminate the contract?

Document the answer:
"[Vendor] will not use Customer Data submitted via the API to train
or improve [Vendor]'s models, as confirmed in Section X of the DPA
dated [date]."`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2.3 Data Isolation</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Is our data logically isolated from other customers?

[ ] Could a prompt from another customer expose our data?
    (Ask specifically about prompt caching, model state)

[ ] How is multi-tenancy implemented?
    - Database-level isolation?
    - Container-level?
    - What are the isolation guarantees?

[ ] In the event of a security incident at another customer,
    could our data be exposed?`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2.4 Data Deletion</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] What is the process to delete our data?

[ ] What is the SLA for deletion completion?

[ ] Does deletion extend to backups and disaster recovery systems?

[ ] Can we verify deletion occurred?
    - Certificate of destruction?
    - Audit log?

[ ] What data is exempt from deletion requests?
    (Billing records, legal hold, etc.)`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Section 3: Incident Response</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">3.1 Breach Notification</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] What is the contractual breach notification timeline?
    - GDPR requires 72 hours to supervisory authority
    - Your DPA should match or exceed this
    - Target: 24-48 hours for initial notification

[ ] What constitutes a notifiable incident?
    - Any unauthorized access to your data?
    - Only confirmed exfiltration?

[ ] Who is notified?
    - Your security contact?
    - Legal?
    - DPO?

[ ] What information is included in notifications?
    - Nature of the incident?
    - Data categories affected?
    - Estimated number of records?
    - Remediation steps?

[ ] Historical incidents:
    - Have they had notifiable incidents in the last 3 years?
    - Were customers notified appropriately?
    - What was the root cause and remediation?`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">3.2 Business Continuity</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] What is the SLA for API availability?
    - Target: 99.9% (8.7 hours downtime/year) minimum
    - 99.95% for critical production use

[ ] Where is the status page?

[ ] What is the incident communication process?
    - How do you notify customers of outages?
    - What is the typical notification lag?

[ ] What is the RTO/RPO for your inference infrastructure?

[ ] How do you handle regional outages?
    - Automatic failover?
    - Manual?
    - Customer responsibility?

[ ] Review their last 3 major incidents:
    - Duration?
    - Root cause?
    - Customer communication quality?`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Section 4: Legal and Compliance</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4.1 Data Processing Agreement</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`The DPA must include:

[ ] Data controller / data processor designation
    (You are controller, vendor is processor)

[ ] Purpose limitation
    - Data used only for providing the service
    - Not for training (or explicit opt-out clause)

[ ] Data subject rights support
    - How they support your GDPR/CCPA obligations
    - Access, deletion, portability

[ ] Sub-processors list
    - Who else processes the data?
    - Do they accept liability for sub-processors?
    - How are you notified of sub-processor changes?

[ ] International data transfers
    - Standard Contractual Clauses (SCCs) for EU data
    - Transfer Impact Assessment completed?
    - UK IDTA if UK data involved

[ ] Data breach obligations (matches Section 3.1 above)

[ ] Term and termination
    - Data deleted within X days of termination
    - Export mechanism before deletion

[ ] Audit rights
    - Can you audit their controls?
    - Or do they provide audit reports in lieu?

[ ] Liability cap
    - Is it sufficient relative to the data you're sharing?
    - Standard: 12 months of fees paid. Negotiate for sensitive data.`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4.2 Regulatory Compliance</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] GDPR
    - Are they certified under an EU adequacy decision or using SCCs?
    - GDPR-compliant DPA available?
    - EU data residency available if required?

[ ] HIPAA (if processing any health information)
    - Will they sign a Business Associate Agreement (BAA)?
    - Does the BAA cover the specific services you're using?
    - Note: OpenAI does not sign BAAs for standard API; enterprise only

[ ] PCI-DSS (if processing payment card data)
    - Are they PCI-DSS compliant?
    - Do they have an Attestation of Compliance (AoC)?
    - Note: Do not send raw card data to AI APIs

[ ] FedRAMP (if US federal government use)
    - FedRAMP Authorized?
    - At what impact level (Low/Moderate/High)?

[ ] SOX (if processing financial records)
    - Do they maintain audit trails sufficient for SOX?

[ ] EU AI Act
    - For providers of general-purpose AI models: transparency obligations
    - For high-risk use cases: your obligation, not theirs`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4.3 Intellectual Property</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Who owns the outputs generated using our prompts?
    - Default: usually you own the outputs
    - Confirm this is in the Terms of Service or DPA

[ ] Do they claim any license to our inputs?
    - Some services claim broad licenses to user content
    - Enterprise agreements typically exclude this

[ ] If we use fine-tuning, who owns the fine-tuned model?

[ ] Trade secret risk:
    - If we send proprietary code or algorithms in prompts,
      do we risk waiving trade secret protection?
    - Get legal opinion on this for high-sensitivity use cases`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Section 5: Operational Security</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">5.1 API Security</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Authentication mechanism
    - API keys only, or OAuth/OIDC available?
    - Key rotation support?
    - Scoped keys (limit by model, rate, etc.)?

[ ] Rate limiting and DDoS protection
    - What are the default rate limits?
    - Can we increase them with notice?
    - What protects against abuse of our API key?

[ ] IP allowlisting
    - Can we restrict API key use to specific IP ranges?

[ ] Webhook security (if applicable)
    - HMAC signature verification?
    - TLS required?`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">5.2 Monitoring and Alerting</h3>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`[ ] Usage monitoring
    - Dashboard for token usage?
    - Spend alerts?
    - Anomaly detection?

[ ] Security alerts
    - Notification on unusual access patterns?
    - Notification on key compromise attempts?

[ ] Audit logging
    - Can we access logs of all API calls made with our keys?
    - Log retention period?
    - Log export capability?`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Risk Rating Framework</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Use this to assign a risk rating after completing the assessment.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`CRITICAL — Do not proceed without executive sign-off and legal review:
- No DPA available
- Data used for training without opt-out
- No SOC 2 report
- No breach notification obligation in contract

HIGH — Proceed with strong controls and enhanced monitoring:
- DPA available but weak terms
- Training opt-out available but not in DPA (only ToS)
- SOC 2 Type I only (not Type II)
- No HIPAA BAA for health-adjacent use cases

MEDIUM — Proceed with standard controls:
- Strong DPA with training opt-out
- Current SOC 2 Type II
- Data retention configurable
- Standard breach notification terms

LOW — Proceed with normal vendor management:
- Strong DPA
- Multiple compliance certifications
- Zero retention option available
- Strong breach notification (24-48 hours)
- Regular audit reports available`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Quick Reference: Major AI Providers</h2>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`OpenAI (API, Enterprise tier):
  SOC 2 Type II: ✓
  ISO 27001: ✓
  HIPAA BAA: Enterprise only
  Training opt-out: API default (Enterprise: zero retention)
  DPA: Available
  EU data residency: Limited
  Status: trust.openai.com

Anthropic (Claude API):
  SOC 2 Type II: ✓
  ISO 27001: ✓
  HIPAA BAA: Enterprise
  Training opt-out: API default
  DPA: Available
  EU data residency: Via AWS regions

Google (Vertex AI):
  SOC 2 Type II: ✓
  ISO 27001: ✓
  FedRAMP: Moderate
  HIPAA: ✓ (covered under Google BAA)
  Training opt-out: Default (Vertex does not train on customer data)
  DPA: Google DPA
  EU data residency: ✓

Microsoft Azure OpenAI:
  SOC 2 Type II: ✓
  ISO 27001: ✓
  FedRAMP High: ✓
  HIPAA: ✓ (Microsoft BAA)
  Training opt-out: Default (Azure does not train on customer data)
  EU data residency: ✓
  Note: Best enterprise compliance posture of the major providers`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Checklist Summary (One-Page Version)</h2>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`SECURITY
□ SOC 2 Type II (current year)
□ ISO 27001 or equivalent
□ Penetration testing (external, annual)
□ Data region selection available
□ Access to our data restricted and audited

DATA HANDLING
□ Retention period documented and acceptable
□ Training opt-out confirmed in writing
□ Data deletion process and SLA defined
□ Data isolation guaranteed

LEGAL
□ DPA signed before production data flows
□ Sub-processor list reviewed
□ International transfer mechanism in place (SCCs)
□ Breach notification ≤72 hours in contract
□ HIPAA BAA if any health-adjacent use
□ Output ownership confirmed

INCIDENT RESPONSE
□ Breach notification timeline ≤72 hours
□ Status page reviewed
□ Historical incidents reviewed
□ Availability SLA acceptable

OPERATIONAL
□ API key security reviewed
□ Usage monitoring available
□ Audit logs accessible

RISK RATING: [ ] Low [ ] Medium [ ] High [ ] Critical

Assessed by: ________________
Date: ________________
Next review: ________________
Sign-off: ________________`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh routes all AI requests through a governed control plane, giving you a complete audit trail of what data goes to which AI provider — the foundation of your AI vendor risk program. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Learn more at decimeshi.com</a></em>`}} />


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
