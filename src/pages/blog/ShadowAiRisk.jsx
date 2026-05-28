import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function ShadowAiRisk() {
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
          Shadow AI: The Hidden Risk in Your Enterprise
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          Shadow AI is shadow IT — except the data going out is your source code, customer records, and financial models. How to detect, control, and govern it.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 10 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For CISOs</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `You've spent years building a program to manage shadow IT. Unauthorized SaaS. Personal Dropbox accounts. Consumer apps on corporate devices.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `You thought you had it under control.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Then your developers discovered ChatGPT.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Shadow AI is shadow IT — except the data going out is your source code, your customer records, your financial models, and your internal strategy documents. And the scale at which it's happening makes every previous shadow IT problem look manageable.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What Shadow AI Actually Looks Like</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Shadow AI isn't just employees using ChatGPT for email drafts. It's:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Developer shadow AI:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Copilot, Cursor, and CodeWhisperer completing code that contains proprietary algorithms and hardcoded credentials`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `ChatGPT used to debug production code — with actual customer data pasted into the prompt to &quot;make the example clearer&quot;`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Claude used to write and review internal architecture documents`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Finance shadow AI:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Excel Copilot analyzing financial models with unreleased earnings data`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `ChatGPT used to draft investor communications before board approval`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI used to build financial projections with confidential M&amp;A targets`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>HR shadow AI:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Hiring managers using AI to screen resumes — creating EU AI Act high-risk classification obligations nobody knows about`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Performance reviews written or assisted by AI tools with no policy oversight`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Salary band analysis done via AI with HR system exports`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Legal and compliance shadow AI:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Contract review via ChatGPT — attorney-client privileged content sent to a third-party API`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Regulatory filings drafted with AI tools that aren't approved for the data sensitivity involved`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `IP disclosures reviewed with AI — potentially waiving privilege`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The common thread: <strong>data that should not leave your network is leaving it</strong>, in the worst possible way — sent to a third-party AI provider, processed on their infrastructure, potentially used for model training.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Scale Is Bigger Than You Think</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `OpenAI's enterprise tier requires opt-out from training data use. The free and Plus tiers do not. Most of your employees are on free or Plus.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Consider: if 500 employees each use ChatGPT 10 times per day, that's 5,000 prompts per day leaving your network. Each prompt might contain:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `500-2,000 tokens of context`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Drawn from internal documents, code, emails, or customer data`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Sent to OpenAI servers in the US or EU depending on region`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Retained for 30 days by default (unless you've opted out)`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Over a year, that's <strong>1.8 million prompts</strong> containing unknown quantities of your most sensitive data. You have no idea what's in any of them.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What Makes Shadow AI Different from Shadow IT</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Traditional shadow IT:</strong> An employee uses Dropbox to share files. The data goes to Dropbox's servers. Dropbox stores it. You can, in theory, run DLP to detect and block the upload. The data is at rest somewhere and you could recover it.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Shadow AI:</strong> An employee pastes source code into ChatGPT. The data goes to OpenAI. The model processes it. The employee gets a response. The conversation may or may not be retained. The data has been <em>processed</em> by a third party — not just stored. There is no &quot;recovery.&quot; The damage, if any, is already done.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This makes shadow AI fundamentally harder to remediate than shadow IT. Discovery is reactive. Prevention is the only viable strategy.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Regulatory Exposure</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Shadow AI creates regulatory risk across multiple frameworks simultaneously.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>GDPR:</strong> Any customer PII sent to an external AI API is a third-party data transfer. You need a Data Processing Agreement with that provider. If your employees are pasting customer records into ChatGPT (and they are), you're in violation of Article 28.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>EU AI Act:</strong> If employees are using AI to assist with high-risk decisions — credit scoring, hiring, medical assessment, law enforcement — those uses are regulated regardless of whether they're &quot;official&quot; deployments. &quot;My employee just used ChatGPT, I didn't deploy an AI system&quot; is not a defense.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>HIPAA:</strong> Protected health information sent to any third party requires a Business Associate Agreement. OpenAI does not sign BAAs for consumer products. Healthcare employees using consumer ChatGPT with patient data is a reportable breach.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>SOC 2:</strong> Your SOC 2 auditors will ask about data flows. &quot;Employees may be sending sensitive data to external AI services but we don't know&quot; is not a passing answer for CC6.1 (logical access) or CC6.6 (data transmission security).`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Confidentiality / Trade secrets:</strong> Source code, financial projections, unreleased product roadmaps — all of these have been sent to AI providers by employees of major companies. If your proprietary algorithms end up in model training data, your trade secret protection is compromised.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">How to Detect Shadow AI in Your Environment</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">1. DNS and Proxy Analysis</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Most AI providers have known API endpoints. Audit your egress traffic:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`# Common AI API destinations to monitor
api.openai.com
api.anthropic.com
generativelanguage.googleapis.com
api.deepseek.com
api.mistral.ai
api.cohere.ai
api.together.xyz
api.groq.com

# AI-assisted products that phone home
copilot.github.com
*.cortana.ai
api.cursor.sh`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Set up logging on your egress proxy and alert on high-volume traffic to these destinations from unexpected source hosts.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">2. Browser Extension Audit</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Copilot for Microsoft 365, Grammarly, and dozens of AI writing assistants run as browser extensions that can read page content, including internal web apps and SaaS tools. Run an inventory:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`# Chrome extension policy audit (via endpoint management)
# Extensions with access to all sites are highest risk
# Look for: AI assistants, writing tools, productivity tools`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">3. SaaS App Review</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Review your SSO/SAML logs for AI products your employees have signed up for with corporate email. Every new OAuth grant to an AI service is a potential data channel. Tools to use: Okta, Entra ID (Azure AD) app registration logs, Netskope, Zscaler.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">4. DLP Pattern Matching</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Add AI-specific patterns to your DLP rules:`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`# Prompt-like patterns that suggest AI usage
"You are a helpful assistant"
"Ignore previous instructions"
"As an AI language model"
"Please summarize the following"

# Responses that suggest AI generation
"Certainly! Here is"
"As requested, here is"
"I understand you're asking about"`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `These aren't perfect — they'll have false positives — but they're a starting point for identifying the volume of shadow AI activity.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Shadow AI Policy Framework</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Detection is reactive. You need a policy before the next incident.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Tier 1: Approved for all employees</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI tools that have signed DPAs, are approved for general business use, and have been vetted for your data classification requirements. Examples (subject to your review): Microsoft Copilot M365 (with proper licensing), approved internal tools built on enterprise APIs.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Tier 2: Approved with restrictions</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `AI tools approved for use with non-sensitive data only. Employees can use them for general productivity but must not input customer data, proprietary information, or regulated data. Examples: ChatGPT Plus (with your Data Processing Agreement in place), Claude for general writing.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Tier 3: Prohibited</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Consumer AI tools with no DPA, no data protection guarantees, or tools that have been involved in known data incidents.`}} />
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Policy requirements:</h3>
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `All Tier 1 tools must route through your approved AI gateway`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `PII and confidential data must not be input into Tier 2 tools`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Tier 3 tools blocked at network level`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Employees must disclose AI use in deliverables where required`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Technical Controls</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Policy without controls is just wishful thinking.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Network controls:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Block unauthorized AI API endpoints at your egress proxy`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Allow only traffic to approved endpoints from your approved gateway`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Alert on attempts to reach blocked AI destinations`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Endpoint controls:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Manage browser extensions via policy (Chrome Enterprise, Intune)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Block installation of unapproved AI extensions`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Monitor for AI tool installations on corporate devices`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>SaaS controls:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Require SSO for all approved AI tools`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Audit OAuth grants regularly`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Revoke access to unapproved AI applications`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Data controls:</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DLP rules to detect PII in outbound traffic to AI endpoints`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `CASB policies for AI-specific SaaS applications`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Content inspection on AI API traffic (requires decryption)`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Governance Model</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Technical controls stop the obvious violations. Governance is how you handle the sophisticated user who finds a workaround.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>AI Governance Committee:</strong> Representatives from Security, Legal, Compliance, Engineering, and HR. Meets monthly. Reviews new AI tool requests. Updates the approved list. Handles incidents.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>AI Tool Request Process:</strong> When an employee wants to use a new AI tool, they submit a request. Security reviews the DPA, data handling practices, and breach history. Legal reviews the terms of service. The committee approves or denies. Turnaround: 5 business days for standard requests.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>AI Use Disclosure:</strong> Customer-facing deliverables: employees must disclose when AI was used to produce them. Internal documents: optional but encouraged. This creates accountability and reduces the temptation to use unapproved tools.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Incident Response:</strong> Shadow AI incident = data incident. Treat it as such. Investigation, root cause, notification requirements (GDPR 72-hour clock), remediation.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What CISOs Get Wrong About Shadow AI</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>&quot;We can block ChatGPT at the firewall.&quot;</strong> You can block <code class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-200">chat.openai.com</code>. You can't block employees using their phones on cellular, working from home on personal networks, or using the dozens of other AI tools that have emerged. Network blocking is necessary but not sufficient.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>&quot;Our employees know not to use AI with sensitive data.&quot;</strong> They don't. Not because they're malicious — because the boundary between &quot;sensitive&quot; and &quot;not sensitive&quot; is unclear to most people, and AI tools are so useful that the temptation to use them with any available context is overwhelming.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>&quot;The AI providers guarantee our data is safe.&quot;</strong> Enterprise contracts with strong DPAs are better than consumer terms. They're not guarantees. You're still sending data to a third party you don't control, running on infrastructure you can't inspect, with employees you trust but can't audit.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>&quot;AI governance is an IT problem.&quot;</strong> It's a risk problem. It belongs on the board agenda alongside your other material risks. The financial, legal, and reputational exposure from a shadow AI data incident is comparable to a traditional data breach.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Building the Business Case for AI Governance</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `To get budget for AI governance, you need to frame it in terms the board and CFO understand.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The risk scenario (quantify it):</strong> &quot;We have 800 employees. If 30% use AI tools daily, that's 240 people potentially sending sensitive data to external AI services every day. One PHI exposure incident costs an average of $10.9M in HIPAA penalties. One GDPR fine for unauthorized data transfers is up to 4% of global revenue.&quot;`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The compliance scenario:</strong> &quot;EU AI Act Article 28 requires documentation of all AI system deployments. We currently have no inventory of AI use across the organization. If we're audited, we cannot demonstrate compliance.&quot;`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>The competitive scenario:</strong> &quot;Our competitors are moving fast on AI. We need to move fast too. AI governance is how we move fast without breaking compliance. An approved AI program that employees trust is more effective than a prohibition that gets ignored.&quot;`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The 90-Day Shadow AI Response Plan</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 1-30: Discover</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `DNS/proxy analysis: inventory all AI traffic`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `SSO audit: all AI tools employees have connected`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Survey: ask employees what AI tools they're using (anonymized)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Risk assessment: classify discovered tools by data risk`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 31-60: Control</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Block highest-risk unapproved endpoints`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Deploy approved AI tool set (start with Microsoft Copilot M365 if on M365)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Publish AI use policy`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Train employees on approved tools and prohibited uses`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Days 61-90: Govern</strong>`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Establish AI governance committee`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Deploy technical controls (DLP, CASB, endpoint management)`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Create AI tool request process`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `First quarterly AI risk report to CISO`}} />
      </ul>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh gives enterprises a central control plane for all approved AI usage — so you can enable AI productivity while maintaining full audit and governance. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Learn more at decimeshi.com</a></em>`}} />


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
