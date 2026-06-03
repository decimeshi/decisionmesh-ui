import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function RbacLlmApi() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      <BlogSeo
        title="How to Implement Role-Based Access Control for LLM APIs"
        description="LLM APIs are powerful — and dangerous without access controls. Here's how to implement RBAC for LLM access: intent-based policies, model restrictions, cost limits, and audit trails. With code examples."
        slug="rbac-llm-api-access-control"
      />

      <div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to Blog
          </a>
          <div style={{ marginBottom: 16 }}>
            <span style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Engineering
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
            How to Implement Role-Based Access Control for LLM APIs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
            Your LLM API is as powerful as a database — but most teams secure it like a public endpoint. Here's how to implement proper RBAC, with intent policies, model restrictions, and cost controls.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
              <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>June 2026</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· 12 min read</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>· For Security Engineers</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Most teams add an LLM to their stack the same way they add any third-party API: get a key, call the endpoint, ship the feature. The access control model is effectively binary — you either have the API key or you don't.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is fine for a prototype. It's a security and cost disaster at scale.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `LLM APIs can exfiltrate data, generate harmful content, run up six-figure bills, and make consequential decisions — all based on what prompt they receive. Without access controls, every user of your application has unrestricted access to all of that.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This guide covers how to implement proper role-based access control (RBAC) for LLM APIs — what to restrict, how to enforce it, and how to audit it.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Why Standard RBAC Doesn't Work for LLMs</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Traditional RBAC controls access to resources: this user can read this table, that service can write to this queue. The access decision is binary and deterministic.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `LLM access is different. The "resource" being accessed isn't a fixed record — it's a model that can do almost anything depending on the prompt. Two calls to the same endpoint with the same API key can:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Summarise a document (safe)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Extract all PII from a database (dangerous)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Generate a customer email (intended use case)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Generate a phishing email (policy violation)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Use GPT-4 for a simple task that GPT-3.5 could handle at 10x lower cost`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `RBAC for LLMs needs to control not just <em>who</em> can call the API, but <em>what they can ask it to do</em>, <em>which model they can use</em>, and <em>how much they can spend</em>.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Four Dimensions of LLM Access Control</h2>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Intent-Based Access Control</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Instead of controlling access at the raw prompt level (impractical), control it at the <strong>intent</strong> level. Classify what the user is trying to do, then enforce a policy on that intent.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Example intent taxonomy:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>DOCUMENT_SUMMARISE</code> — summarise internal documents`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>CUSTOMER_EMAIL_DRAFT</code> — draft outbound customer communications`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>DATA_ANALYSIS</code> — analyse datasets and generate insights`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>CODE_GENERATION</code> — generate or review code`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>CREDIT_DECISION_ASSIST</code> — assist with credit underwriting (high-risk, restricted)`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Then map roles to permitted intents:`}} />
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '20px 24px', marginBottom: 24, overflowX: 'auto' }}>
          <pre style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{`// Role → permitted intents mapping
const ROLE_POLICIES = {
  VIEWER: [
    'DOCUMENT_SUMMARISE',
    'DATA_ANALYSIS',
  ],
  ANALYST: [
    'DOCUMENT_SUMMARISE',
    'DATA_ANALYSIS',
    'CUSTOMER_EMAIL_DRAFT',
    'CODE_GENERATION',
  ],
  ADMIN: [
    '*', // all intents
  ],
};

function checkIntentAccess(userRole, intent) {
  const permitted = ROLE_POLICIES[userRole] || [];
  return permitted.includes('*') || permitted.includes(intent);
}`}</pre>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Model-Level Restrictions</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Not every user should be able to invoke your most expensive model. Implement model-level restrictions by role:`}} />
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '20px 24px', marginBottom: 24, overflowX: 'auto' }}>
          <pre style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{`const MODEL_ACCESS = {
  VIEWER:  ['gpt-3.5-turbo', 'claude-haiku'],
  ANALYST: ['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-haiku'],
  ADMIN:   ['gpt-4o', 'claude-sonnet', 'claude-opus', '*'],
};

function resolveModel(requestedModel, userRole) {
  const allowed = MODEL_ACCESS[userRole] || [];
  if (allowed.includes('*') || allowed.includes(requestedModel)) {
    return requestedModel;
  }
  // Downgrade to cheapest allowed model
  return allowed[0];
}`}</pre>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Cost and Token Limits</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Enforce budget limits per user, per team, and per intent. Track spend in real time and block calls that exceed limits:`}} />
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '20px 24px', marginBottom: 24, overflowX: 'auto' }}>
          <pre style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{`// Budget limits per role per month (USD)
const BUDGET_LIMITS = {
  VIEWER:  5.00,
  ANALYST: 50.00,
  ADMIN:   500.00,
};

async function checkBudget(userId, userRole, estimatedCost) {
  const spent = await getMonthlySpend(userId);
  const limit = BUDGET_LIMITS[userRole];
  
  if (spent + estimatedCost > limit) {
    throw new Error(
      \`Budget limit exceeded. Spent: $\${spent.toFixed(2)}, 
       Limit: $\${limit.toFixed(2)}\`
    );
  }
}`}</pre>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Data Scope Restrictions</h3>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Control what data each role can include in LLM prompts. This is the hardest dimension to enforce but the most important for compliance:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>PII detection</strong> — scan all prompts for PII before sending to external LLM APIs. Block or mask based on role and intent.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Data classification enforcement</strong> — prevent CONFIDENTIAL data from being sent to LLMs by users without CONFIDENTIAL access.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Context window limits</strong> — cap how much data can be included in a single prompt, reducing the blast radius of a prompt injection attack.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Architecture: LLM Gateway Pattern</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `All of the above requires a <strong>gateway layer</strong> between your application and the LLM provider. Every LLM call routes through the gateway, which enforces all access controls before the call reaches the model.`}} />
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '20px 24px', marginBottom: 24, overflowX: 'auto' }}>
          <pre style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{`Application → LLM Gateway → LLM Provider
                  │
                  ├── 1. Authenticate user (JWT/API key)
                  ├── 2. Extract intent from request  
                  ├── 3. Check intent policy (role → intent)
                  ├── 4. Validate model selection
                  ├── 5. Check budget limit
                  ├── 6. Scan prompt for PII
                  ├── 7. Log request to audit trail (immutable)
                  ├── 8. Forward to LLM provider
                  ├── 9. Log response + token usage + cost
                  └── 10. Return response to application`}</pre>
        </div>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The gateway is a single enforcement point. Build it once, and every LLM integration in your stack gets access controls, audit logging, and cost tracking automatically.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Audit Trail Requirements</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Every LLM call must produce an audit record containing:`}} />
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>user_id</code> — who made the call`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>role</code> — their role at time of call`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>intent</code> — classified intent`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>model</code> — model used (may differ from requested if downgraded)`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>tokens_in / tokens_out</code> — for cost attribution`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>cost_usd</code> — actual cost of this call`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>pii_detected</code> — boolean + categories detected`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>policy_decision</code> — ALLOW / DENY + reason`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<code>timestamp</code> — immutable, server-generated`}} />
        </ul>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The audit trail must be <strong>append-only</strong>. Use a database trigger to prevent UPDATE and DELETE on the audit table. This is what SOC 2, EU AI Act, and most financial regulations require.`}} />

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Common Mistakes</h2>
        <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>One API key for the whole team</strong> — no user-level attribution, no per-user budget limits, impossible to audit who did what.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Enforcing access in the frontend only</strong> — any user with the API key can bypass frontend checks. Enforce at the gateway, not the UI.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Logging prompts in plaintext</strong> — if prompts contain PII, your audit logs are a PII data store requiring full data protection controls. Hash or mask PII before logging.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Not logging denied requests</strong> — denied requests are often the most interesting security events. Log them with the reason for denial.`}} />
          <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Static role assignments</strong> — roles should be dynamic. A contractor might have ANALYST access Monday to Friday during business hours only.`}} />
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Bottom Line</h2>
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `LLM APIs are the most powerful external services most applications connect to. Treating them with less access control rigour than your database is a security and compliance risk that will catch up with you — either in a breach, a regulatory audit, or an unexpected six-figure cloud bill.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The gateway pattern solves all four dimensions — intent control, model restrictions, cost limits, and data scope — in a single layer that works for every LLM integration in your stack.`}} />
        <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh is the AI Intent Control Plane that implements all of this out of the box — RBAC for LLM access, intent classification, policy enforcement, immutable audit trails, and cost attribution. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Try it free at decimeshi.com</a></em>`}} />

        <div style={{ marginTop: 64, background: 'linear-gradient(135deg, #0a1045, #1e3a8a)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
            DecisionMesh · AI Intent Control Plane
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>
            RBAC for every LLM call in your stack
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
            Intent policies, model restrictions, cost controls, and immutable audit trails — free during beta.
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
