import React from 'react';
import BlogSeo from '../../components/BlogSeo';

export default function LlmCostControl() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {<div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <a href="/blog" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Blog
        </a>
        <div style={{ marginBottom: 16 }}>
          <span style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Finance
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
          LLM Cost Runaway: How to Set and Enforce AI Budgets
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>
          AI bills spiraling out of control? Learn how to implement cost visibility, attribution, budget enforcement, and optimization for LLM usage across your enterprise.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Thiru · DecisionMesh</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 13 }}>June 2025</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· 10 min read</span>
          <span style={{ color: '#64748b', fontSize: 13 }}>· For CFOs & Engineering Managers</span>
        </div>
      </div>
    </div>}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `The pattern is becoming familiar.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A company integrates AI into their product. Usage grows. Engineers add more AI features. Teams discover the API. The bill arrives.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `It's six times the budget.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Nobody noticed because AI costs don't look like traditional software costs. There's no renewal invoice. No seat license. Just a credit card getting charged based on tokens consumed — and tokens are invisible until the bill arrives.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `This is the LLM cost runaway problem. It's hitting companies of every size, and it's getting worse as AI becomes embedded deeper into every product and every team's workflow.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Why LLM Costs Are Hard to Control</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Traditional software costs are predictable. You pay per seat, per server, or per transaction — and those numbers are known in advance.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `LLM costs are:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Token-based:</strong> You pay for every input token (your prompt) plus every output token (the model's response). A single API call can cost $0.001 or $0.50 depending on prompt length, model choice, and response length.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Usage-elastic:</strong> There's no natural cap. One feature shipped to 1 million users that uses GPT-4o for every page load can generate costs orders of magnitude higher than expected overnight.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Team-distributed:</strong> Every engineering team, product team, and increasingly every business user with Copilot access is generating costs independently. There's no central procurement controlling spend.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Model-variable:</strong> GPT-4o costs roughly 15x more than GPT-4o-mini for the same prompt. Teams choosing models based on capability without considering cost create massive variance.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Invisible until billed:</strong> OpenAI bills monthly. If you set up an integration in week 1 and it starts running hot in week 2, you might not know until week 5 when the invoice arrives.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">What LLM Cost Runaway Actually Looks Like</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Case 1: The product feature that took off</strong>`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A startup adds AI-powered document summarization. They test it in beta with 100 users using GPT-4 Turbo. Costs are $200/month — fine.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `They launch to 50,000 users. Nobody changes the model. Costs jump to $100,000/month. The feature is now unprofitable and has to be pulled.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Case 2: The engineering team that didn't know the price</strong>`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A senior engineer builds an internal tool that uses GPT-4o to analyze code quality on every pull request. It works beautifully. They share it with the team. Then the whole engineering org starts using it.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Each PR triggers 10 API calls averaging 2,000 tokens each. With 200 PRs/day, that's 4 million tokens per day. At $0.005/1K tokens: $20/day, $600/month. Manageable.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Until the tool gets extended to run on every commit, not just PRs. 20x the calls. $12,000/month from one internal tool. Found on month 3.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Case 3: The hallucination that generated costs</strong>`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `A customer service AI gets stuck in a retry loop. When the model returns an unexpected response format, the application retries. The retry also returns an unexpected format. It retries again. 10,000 times in 4 hours.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Each retry: 1,500 tokens. Total runaway: 15 million tokens. Cost: $750. One incident. Found because the API rate limit tripped — not because of any cost monitoring.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The Hidden Cost Multipliers</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Beyond the obvious per-token charges, LLM costs have hidden multipliers that most engineering teams don't account for:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Context window bloat:</strong> RAG (retrieval augmented generation) systems stuff documents into context before the user's question. If you're retrieving 10,000 tokens of context per query, you're paying for those tokens on every call — even if 90% of the retrieved content is irrelevant to the question.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>System prompt overhead:</strong> A detailed system prompt of 500 tokens, sent on every call, at 100,000 calls/day = 50 million tokens/day in system prompt alone. At GPT-4o rates ($2.50/M tokens): $125/day, $3,750/month — from your system prompt.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Output verbosity:</strong> Models are trained to be helpful, which means they're verbose. A prompt that asks for a &quot;brief summary&quot; might return 800 tokens where 150 would suffice. Max tokens limits are often not set, leaving the model to decide how long to be.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Model routing by convenience:</strong> Teams default to the most capable (most expensive) model for all tasks. Sentiment classification that could run on GPT-4o-mini gets routed to GPT-4o because that's what's configured.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Duplicate calls:</strong> The same prompt generated multiple times because results aren't cached. Common in development, often carries into production.`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">Building the Cost Control Framework</h2>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Layer 1: Visibility — Know What You're Spending</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `You can't control what you can't see. The first layer is instrumentation.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>What to track per API call:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`- Timestamp
- Model used
- Input tokens
- Output tokens
- Estimated cost (tokens × rate)
- Calling service/team
- User or use case
- Latency`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Cost dashboard metrics you need:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Daily spend (total and by team/service)
Cost per user (for customer-facing features)
Cost per transaction (for specific workflows)
Model distribution (what % going to expensive vs cheap models)
Token efficiency (output tokens / input tokens ratio)
Cost trend (week over week)
Projected monthly spend`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Alerting thresholds:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Alert when daily spend > $X (your daily budget)
Alert when any single service > Y% of total spend
Alert when cost per transaction increases > 20% week over week
Alert when spend rate suggests monthly budget will be exceeded`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Layer 2: Attribution — Know Who's Spending</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Every API call needs a cost center attached to it. This requires discipline in how teams make API calls.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Tag every API call with:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`headers = {
    "OpenAI-Organization": "org-xxx",
    # Use request metadata for internal attribution
}

# Or via your API wrapper
response = ai_client.chat(
    messages=messages,
    metadata={
        "team": "payments",
        "service": "fraud-detection",
        "feature": "transaction-analysis",
        "environment": "production",
        "cost_center": "CC-1042",
    }
)`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Monthly cost by team report:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`SELECT
    metadata->>'team' as team,
    metadata->>'service' as service,
    SUM(input_tokens + output_tokens) as total_tokens,
    SUM(estimated_cost_usd) as total_cost_usd,
    COUNT(*) as api_calls,
    AVG(input_tokens) as avg_prompt_tokens,
    AVG(output_tokens) as avg_completion_tokens
FROM ai_usage_log
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
GROUP BY 1, 2
ORDER BY total_cost_usd DESC;`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Layer 3: Budgets — Set Limits and Enforce Them</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Visibility tells you what happened. Budgets prevent it from happening.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Budget structure:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`Company budget: $50,000/month
  ├── Engineering: $20,000/month
  │     ├── Product API: $10,000/month
  │     ├── Internal tools: $5,000/month
  │     └── Dev/staging: $5,000/month
  ├── Customer Success: $15,000/month
  ├── Marketing: $5,000/month
  └── Buffer/contingency: $10,000/month`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Budget enforcement options:</strong>`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Soft limits (alert only):</em> When a team reaches 80% of their budget, alert them and their manager. At 100%, alert escalates to engineering leadership. No blocking.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Hard limits (block above threshold):</em> When a team reaches their budget, API calls from that team are blocked until the budget resets or is manually increased. Requires buy-in — can block production if not implemented carefully.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>Rate limits (prevent runaway):</em> Independent of budget, limit calls per minute/hour to prevent runaway loops. Any service calling more than 1,000 times per minute gets throttled.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Implementing budget enforcement:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`class BudgetEnforcedAIClient:
    def __init__(self, budget_manager, team_id, hard_limit=False):
        self.budget_manager = budget_manager
        self.team_id = team_id
        self.hard_limit = hard_limit

    def chat(self, messages, model="gpt-4o-mini", **kwargs):
        # Check budget before making call
        budget_status = self.budget_manager.get_status(self.team_id)

        if budget_status.remaining_usd <= 0 and self.hard_limit:
            raise BudgetExceededError(
                f"Team {self.team_id} has exceeded their AI budget. "
                f"Contact your manager to request an increase."
            )

        if budget_status.percent_used >= 80:
            # Log warning but proceed
            self.budget_manager.send_alert(
                self.team_id,
                f"80% of AI budget used ({budget_status.percent_used:.0f}%)"
            )

        # Make the API call
        response = self.openai_client.chat.completions.create(
            model=model, messages=messages, **kwargs
        )

        # Record the spend
        cost = self.estimate_cost(response, model)
        self.budget_manager.record_spend(self.team_id, cost, {
            "model": model,
            "tokens": response.usage.total_tokens,
        })

        return response

    def estimate_cost(self, response, model):
        rates = {
            "gpt-4o": {"input": 0.0025, "output": 0.010},
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
            "gpt-4-turbo": {"input": 0.010, "output": 0.030},
        }
        rate = rates.get(model, rates["gpt-4o"])
        return (
            response.usage.prompt_tokens / 1000 * rate["input"] +
            response.usage.completion_tokens / 1000 * rate["output"]
        )`}</code>
      </pre>
      <h3 className="text-xl font-bold text-blue-900 mt-8 mb-3">Layer 4: Optimization — Reduce Cost Without Reducing Value</h3>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Once you have visibility and controls, optimize:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Right-size model selection:</strong>`}} />
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Task`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Recommended Model`}} />
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap" dangerouslySetInnerHTML={{__html: `Cost vs GPT-4o`}} />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Classification, sentiment`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `GPT-4o-mini`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `15x cheaper`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Summarization (short)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `GPT-4o-mini`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `15x cheaper`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Extraction, formatting`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `GPT-4o-mini`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `15x cheaper`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Complex reasoning`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `GPT-4o`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `baseline`}} />
            </tr>
            <tr className="bg-white border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Code generation (complex)`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `GPT-4o`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `baseline`}} />
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Long document analysis`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `Claude 3.5 Sonnet`}} />
              <td className="px-4 py-3 align-top" dangerouslySetInnerHTML={{__html: `varies`}} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Implement semantic caching:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`import hashlib
from redis import Redis

class CachedAIClient:
    def __init__(self, ai_client, redis_client, ttl_seconds=3600):
        self.ai = ai_client
        self.redis = redis_client
        self.ttl = ttl_seconds

    def chat(self, messages, model="gpt-4o", **kwargs):
        # Create cache key from messages + model
        cache_key = self._make_key(messages, model)
        cached = self.redis.get(cache_key)

        if cached:
            return json.loads(cached)  # Free!

        response = self.ai.chat(messages=messages, model=model, **kwargs)
        self.redis.setex(cache_key, self.ttl, json.dumps(response))
        return response

    def _make_key(self, messages, model):
        content = json.dumps({"messages": messages, "model": model},
                             sort_keys=True)
        return f"ai_cache:{hashlib.sha256(content.encode()).hexdigest()}"`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Set output token limits:</strong>`}} />
      <pre className="bg-gray-950 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono mb-6 mt-2 border border-gray-800">
        <code>{`# Always set max_tokens to prevent verbose responses
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=500,  # Don't let the model decide
)`}</code>
      </pre>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Prompt compression:</strong> Long prompts cost more. Compress context before sending:`}} />
      <ul className="list-disc list-inside mb-6 space-y-2 pl-2">
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Remove duplicate whitespace and formatting`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Summarize long documents before including them`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Use retrieval to include only relevant context, not entire documents`}} />
        <li className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `Test shorter system prompts — often a 200-token system prompt works as well as a 1,000-token one`}} />
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">The CFO Conversation</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `When presenting AI cost governance to your CFO or board:`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Frame it as margin protection:</strong> &quot;AI features have COGS just like cloud infrastructure. Without controls, AI COGS will scale with revenue in ways we can't predict. Governance ensures AI features remain profitable.&quot;`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Show the unit economics:</strong> &quot;Our AI summarization feature costs $0.003 per user per session. At 10,000 daily active users, that's $30/day, $900/month. If we grow to 100,000 DAU without optimization, that's $9,000/month from one feature. With model optimization (GPT-4o-mini instead of GPT-4o), we reduce to $600/month at 100K DAU.&quot;`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Show the downside scenario:</strong> &quot;Without budget enforcement, a single misconfigured feature could generate $50,000 in API costs before anyone notices. We've seen this happen at companies our size. Budget enforcement makes this impossible.&quot;`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Show the competitive angle:</strong> &quot;Companies with AI cost discipline can price AI features competitively. Companies without it either undercharge and lose margin or overcharge and lose customers.&quot;`}} />
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b-2 border-gray-100">30-Day Cost Control Implementation</h2>
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 1:</strong> Instrument — add cost tracking to every AI API call`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 2:</strong> Attribute — tag every call with team/service/cost center, build the cost dashboard`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 3:</strong> Budget — set initial budgets by team (start generous, tighten over 90 days), implement soft limits and alerts`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Week 4:</strong> Optimize — identify top 3 cost drivers, implement right-sizing and caching for those use cases specifically`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<strong>Expected result:</strong> 30-50% cost reduction within 60 days of full implementation, with full budget predictability within 90 days.`}} />
      <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: `<em>DecisionMesh includes built-in budget enforcement, cost attribution by team, and real-time spend dashboards across all LLM providers. <a href="https://decimeshi.com" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Start free at decimeshi.com</a></em>`}} />


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
