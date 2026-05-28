import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function AuditOpenAiCalls() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {<div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
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
          How to Audit Every OpenAI API Call in Your Stack
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          Step-by-step guide to building an audit trail for OpenAI API calls. Covers PII detection, immutable logging, business context, and compliance reports. Python and TypeScript code included.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 11 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For Engineers</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Most engineering teams treat their OpenAI integration like any other external API. You add a key to your environment variables, make a call, parse the response, move on.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `That works fine — until it doesn't.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Until a compliance audit. Until a data breach investigation. Until a customer asks why your AI denied their application. Until your finance team asks why the OpenAI bill doubled last month and nobody knows which team caused it.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `At that point, &quot;we were calling the API&quot; is not an answer.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This guide is about building the audit infrastructure you need before those moments arrive. Not theory — actual code, actual architecture, actual decisions you need to make.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Why OpenAI's Own Logs Aren't Enough</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `OpenAI provides usage data in the dashboard. You can see token counts, model usage, and costs by API key. That's useful for billing.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `It's not useful for compliance.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `What OpenAI's logs don't give you:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Which user</strong> in your system triggered the request`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What business decision</strong> resulted from the response`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What data was in the prompt</strong> (they don't store this)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Whether PII was exposed</strong> in the request`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Which code path</strong> initiated the call`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What happened next</strong> — did a human review it? Was it overridden?`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For a compliance audit — EU AI Act, SOC 2, HIPAA — you need all of that. OpenAI gives you none of it.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Audit Architecture</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A complete audit trail for OpenAI calls has four components:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Request → [Interceptor] → OpenAI API
              ↓
         [Audit Logger] → Immutable Store
              ↓
         [Enricher] → adds business context
              ↓
         [Exporter] → compliance reports`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Let's build each one.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">1. The Interceptor — Capture Everything Before It Leaves</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The interceptor sits between your application code and the OpenAI API. It captures the full request before it's sent, and the full response when it returns.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Option A: Middleware wrapper (simplest, works in any language)</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Python:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`import openai
import json
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, Optional

class AuditedOpenAI:
    def __init__(self, api_key: str, audit_logger, tenant_id: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.audit_logger = audit_logger
        self.tenant_id = tenant_id

    def chat_completions_create(
        self,
        model: str,
        messages: list,
        user_id: Optional[str] = None,
        intent: Optional[str] = None,
        **kwargs
    ):
        request_id = self._generate_request_id()
        started_at = datetime.now(timezone.utc)

        # Capture the request
        audit_record = {
            "request_id": request_id,
            "tenant_id": self.tenant_id,
            "user_id": user_id,
            "intent": intent,
            "model": model,
            "messages": self._sanitize_messages(messages),
            "message_hash": self._hash_messages(messages),
            "started_at": started_at.isoformat(),
            "provider": "openai",
        }

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                **kwargs
            )

            completed_at = datetime.now(timezone.utc)
            latency_ms = (completed_at - started_at).total_seconds() * 1000

            # Capture the response
            audit_record.update({
                "status": "success",
                "completed_at": completed_at.isoformat(),
                "latency_ms": round(latency_ms, 2),
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
                "finish_reason": response.choices[0].finish_reason,
                "response_preview": response.choices[0].message.content[:200],
            })

            self.audit_logger.log(audit_record)
            return response

        except Exception as e:
            audit_record.update({
                "status": "error",
                "error_type": type(e).__name__,
                "error_message": str(e),
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })
            self.audit_logger.log(audit_record)
            raise

    def _sanitize_messages(self, messages: list) -> list:
        """Remove or mask PII from messages before logging."""
        sanitized = []
        for msg in messages:
            sanitized.append({
                "role": msg["role"],
                "content_length": len(msg.get("content", "")),
                "content_preview": msg.get("content", "")[:100] + "...",
                # Full content stored encrypted separately if needed
            })
        return sanitized

    def _hash_messages(self, messages: list) -> str:
        """Create a deterministic hash of the messages for deduplication."""
        content = json.dumps(messages, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def _generate_request_id(self) -> str:
        import uuid
        return str(uuid.uuid4())


# Usage
from your_audit_logger import AuditLogger

audited_client = AuditedOpenAI(
    api_key="sk-...",
    audit_logger=AuditLogger(),
    tenant_id="acme-corp"
)

response = audited_client.chat_completions_create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Assess this loan application..."}],
    user_id="user-123",
    intent="loan_assessment",
)`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>TypeScript/Node:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`import OpenAI from 'openai';
import { createHash } from 'crypto';

interface AuditRecord {
  requestId: string;
  tenantId: string;
  userId?: string;
  intent?: string;
  model: string;
  startedAt: string;
  completedAt?: string;
  status: 'success' | 'error';
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  errorMessage?: string;
}

class AuditedOpenAI {
  private client: OpenAI;
  private auditLogger: AuditLogger;
  private tenantId: string;

  constructor(apiKey: string, auditLogger: AuditLogger, tenantId: string) {
    this.client = new OpenAI({ apiKey });
    this.auditLogger = auditLogger;
    this.tenantId = tenantId;
  }

  async chatCompletionsCreate(params: {
    model: string;
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    userId?: string;
    intent?: string;
  }) {
    const { model, messages, userId, intent, ...rest } = params;
    const requestId = crypto.randomUUID();
    const startedAt = new Date();

    const record: Partial<AuditRecord> = {
      requestId,
      tenantId: this.tenantId,
      userId,
      intent,
      model,
      startedAt: startedAt.toISOString(),
    };

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        ...rest,
      });

      const completedAt = new Date();
      record.status = 'success';
      record.completedAt = completedAt.toISOString();
      record.latencyMs = completedAt.getTime() - startedAt.getTime();
      record.promptTokens = response.usage?.prompt_tokens;
      record.completionTokens = response.usage?.completion_tokens;

      await this.auditLogger.log(record as AuditRecord);
      return response;

    } catch (error) {
      record.status = 'error';
      record.errorMessage = error instanceof Error ? error.message : String(error);
      await this.auditLogger.log(record as AuditRecord);
      throw error;
    }
  }
}`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">2. The Audit Logger — Make It Immutable</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The key requirement for compliance audit logs: <strong>they must be immutable</strong>. A log that can be edited after the fact is not an audit log — it's just a file.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Immutability options:</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Append-only PostgreSQL table:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`CREATE TABLE ai_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID NOT NULL,
    tenant_id       VARCHAR(100) NOT NULL,
    user_id         VARCHAR(100),
    intent          VARCHAR(200),
    model           VARCHAR(100) NOT NULL,
    provider        VARCHAR(50) NOT NULL DEFAULT 'openai',
    status          VARCHAR(20) NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL,
    completed_at    TIMESTAMPTZ,
    latency_ms      NUMERIC(10,2),
    prompt_tokens   INTEGER,
    completion_tokens INTEGER,
    total_tokens    INTEGER,
    error_type      VARCHAR(200),
    error_message   TEXT,
    message_hash    VARCHAR(64),
    content_preview TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make it append-only: revoke UPDATE and DELETE
REVOKE UPDATE, DELETE ON ai_audit_log FROM application_user;

-- Index for common queries
CREATE INDEX idx_audit_tenant_date ON ai_audit_log(tenant_id, started_at DESC);
CREATE INDEX idx_audit_user ON ai_audit_log(user_id, started_at DESC);
CREATE INDEX idx_audit_intent ON ai_audit_log(intent, started_at DESC);`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Sign each record to detect tampering:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`import hmac
import hashlib
import json

def sign_audit_record(record: dict, signing_key: str) -> str:
    """Create HMAC signature for audit record."""
    payload = json.dumps(record, sort_keys=True, default=str)
    signature = hmac.new(
        signing_key.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_audit_record(record: dict, signature: str, signing_key: str) -> bool:
    """Verify audit record hasn't been tampered with."""
    expected = sign_audit_record(record, signing_key)
    return hmac.compare_digest(expected, signature)`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">3. PII Detection — Stop It Before It Leaves</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The most common compliance failure: PII sent to OpenAI in prompts.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`import re
from typing import List, Tuple

class PIIDetector:
    PATTERNS = {
        'email': r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        'phone': r'\\b(\\+?1[-.]?)?\\(?([0-9]{3})\\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\\b',
        'ssn': r'\\b\\d{3}-\\d{2}-\\d{4}\\b',
        'credit_card': r'\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
        'uk_ni': r'\\b[A-Z]{2}\\d{6}[A-D]\\b',
        'iban': r'\\b[A-Z]{2}\\d{2}[A-Z0-9]{4,}\\b',
    }

    def scan(self, text: str) -> List[Tuple[str, str]]:
        """Returns list of (pii_type, matched_value) tuples."""
        found = []
        for pii_type, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                found.append((pii_type, match if isinstance(match, str)
                              else ''.join(match)))
        return found

    def mask(self, text: str) -> str:
        """Replace PII with masked placeholders."""
        for pii_type, pattern in self.PATTERNS.items():
            replacement = f'[{pii_type.upper()}_REDACTED]'
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        return text

    def check_and_mask(self, messages: list, policy: str = 'mask') -> tuple:
        """
        policy: 'mask' | 'block' | 'allow'
        Returns: (processed_messages, pii_detected, pii_report)
        """
        pii_detected = []
        processed = []

        for msg in messages:
            content = msg.get('content', '')
            found = self.scan(content)

            if found:
                pii_detected.extend(found)
                if policy == 'block':
                    raise ValueError(f"PII detected in prompt: {found}")
                elif policy == 'mask':
                    msg = {**msg, 'content': self.mask(content)}

            processed.append(msg)

        return processed, bool(pii_detected), pii_detected


# Integrate with your wrapper
class AuditedOpenAI:
    def __init__(self, ...):
        self.pii_detector = PIIDetector()

    def chat_completions_create(self, messages, pii_policy='mask', ...):
        # Check for PII before sending
        clean_messages, pii_found, pii_report = \\
            self.pii_detector.check_and_mask(messages, policy=pii_policy)

        audit_record['pii_detected'] = pii_found
        audit_record['pii_types'] = [p[0] for p in pii_report]

        # Send clean messages
        response = self.client.chat.completions.create(
            model=model,
            messages=clean_messages,  # ← masked version
        )`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">4. Business Context — The Missing Layer</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Raw API logs tell you a request was made. Compliance needs to know what decision resulted from it.`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`class DecisionLogger:
    def __init__(self, audit_logger):
        self.audit_logger = audit_logger

    def log_decision(
        self,
        request_id: str,          # links to the AI call
        decision_type: str,        # "loan_approved", "claim_denied"
        decision_value: str,       # the actual decision
        decision_basis: str,       # "AI recommendation, human confirmed"
        reviewer_id: Optional[str] = None,
        reviewer_action: Optional[str] = None,  # "approved", "overridden"
        affected_party_id: Optional[str] = None,
    ):
        self.audit_logger.log({
            "record_type": "decision",
            "request_id": request_id,
            "decision_type": decision_type,
            "decision_value": decision_value,
            "decision_basis": decision_basis,
            "reviewer_id": reviewer_id,
            "reviewer_action": reviewer_action,
            "affected_party_id": affected_party_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


# Usage in your application
response = audited_client.chat_completions_create(
    model="gpt-4o",
    messages=[...],
    intent="loan_assessment",
    user_id="underwriter-456",
)

ai_recommendation = parse_recommendation(response)

# Human review step
if requires_human_review(ai_recommendation):
    human_decision = get_human_review(ai_recommendation)
    decision_logger.log_decision(
        request_id=response.request_id,
        decision_type="loan_decision",
        decision_value=human_decision.outcome,
        decision_basis="AI recommendation reviewed by underwriter",
        reviewer_id="underwriter-456",
        reviewer_action="approved" if human_decision.agreed else "overridden",
        affected_party_id=applicant_id,
    )`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">5. The Compliance Report</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `After building the above, generating compliance reports becomes a SQL query:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`-- All AI decisions in Q1 2025
SELECT
    a.request_id,
    a.tenant_id,
    a.user_id,
    a.intent,
    a.model,
    a.started_at,
    a.pii_detected,
    d.decision_type,
    d.decision_value,
    d.reviewer_id,
    d.reviewer_action,
    d.affected_party_id
FROM ai_audit_log a
LEFT JOIN ai_decisions d ON d.request_id = a.request_id
WHERE a.tenant_id = 'acme-corp'
  AND a.started_at BETWEEN '2025-01-01' AND '2025-03-31'
  AND a.intent IN ('loan_assessment', 'credit_decision')
ORDER BY a.started_at DESC;

-- PII incidents
SELECT
    DATE(started_at) as date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN pii_detected THEN 1 ELSE 0 END) as pii_incidents,
    ROUND(100.0 * SUM(CASE WHEN pii_detected THEN 1 ELSE 0 END) / COUNT(*), 2) as pii_rate
FROM ai_audit_log
WHERE tenant_id = 'acme-corp'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Cost by team
SELECT
    user_id,
    SUM(total_tokens) as total_tokens,
    SUM(total_tokens) * 0.00003 as estimated_cost_usd  -- adjust per model
FROM ai_audit_log
WHERE status = 'success'
GROUP BY user_id
ORDER BY total_tokens DESC;`}</code>
      </pre>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Harder Problem: You Have 20 Services</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The approach above works great for one service. Most engineering teams have 10-20 services all making their own OpenAI calls.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Your options:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Option 1: Add the wrapper to every service</strong> — works but requires buy-in from every team, consistent implementation, and ongoing maintenance.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Option 2: Central proxy</strong> — all services route OpenAI calls through a central gateway you control. One place for all audit logic, PII detection, and cost controls. Harder to set up but better long-term.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Option 3: Network-level interception</strong> — use egress proxy rules to intercept all traffic to <code class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-200">api.openai.com</code>. Works without code changes but harder to add business context.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `For most companies, <strong>Option 2</strong> (central proxy) is the right answer. It's the approach we took building DecisionMesh — a control plane that all your services route through, so you get complete audit coverage without touching every codebase.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Summary Checklist</h2>
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`□ Interceptor in place — capturing all OpenAI calls
□ PII detection before requests leave your network
□ Immutable audit log (append-only, signed)
□ Business context linked to AI calls (decisions, reviewers)
□ Cost tracking by user/team/project
□ Compliance report queries defined and tested
□ Retention policy set (10 years for financial, varies by industry)
□ Log access controls — who can read audit logs?
□ Alert on PII incidents
□ Alert on budget threshold crossings`}</code>
      </pre>


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
