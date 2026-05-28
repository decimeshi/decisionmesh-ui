import React from 'react';
import BlogSeo from '../../components/BlogSeo';
import { Link } from 'react-router-dom';

const ARTICLES = [
  {
    slug: 'eu-ai-act-compliance-checklist-llm',
    title: 'EU AI Act Compliance Checklist for Enterprise LLM Deployments',
    description: 'Practical checklist covering audit trails, human oversight, PII handling, and explainability — with actionable steps for every requirement.',
    category: 'Compliance',
    audience: 'Compliance Teams',
    date: 'June 2025',
    readTime: 9,
    color: '#7c3aed',
  },
  {
    slug: 'soc2-ai-compliance-what-auditors-ask',
    title: 'SOC 2 + AI: What Auditors Are Asking in 2025',
    description: 'SOC 2 auditors are now asking detailed questions about AI usage and data flows. Here\'s exactly what they want to see and how to build the evidence package.',
    category: 'Compliance',
    audience: 'GRC Teams',
    date: 'June 2025',
    readTime: 10,
    color: '#7c3aed',
  },
  {
    slug: 'shadow-ai-enterprise-risk-ciso-guide',
    title: 'Shadow AI: The Hidden Risk in Your Enterprise',
    description: 'Employees are sending proprietary data to ChatGPT, Copilot, and Claude without oversight. How to detect, control, and govern it.',
    category: 'Security',
    audience: 'CISOs',
    date: 'June 2025',
    readTime: 10,
    color: '#ef4444',
  },
  {
    slug: 'how-to-audit-openai-api-calls',
    title: 'How to Audit Every OpenAI API Call in Your Stack',
    description: 'Step-by-step guide to building an audit trail for OpenAI calls. Covers PII detection, immutable logging, business context, and compliance reports. With Python and TypeScript code.',
    category: 'Engineering',
    audience: 'Engineers',
    date: 'June 2025',
    readTime: 11,
    color: '#2563eb',
  },
  {
    slug: 'llm-cost-control-enterprise-budgets',
    title: 'LLM Cost Runaway: How to Set and Enforce AI Budgets',
    description: 'AI bills spiraling out of control? Learn how to implement cost visibility, attribution, budget enforcement, and optimization across your enterprise.',
    category: 'Finance',
    audience: 'CFOs & Engineering Managers',
    date: 'June 2025',
    readTime: 10,
    color: '#10b981',
  },
  {
    slug: 'prompt-injection-detection-llm',
    title: 'How to Detect Prompt Injection Before It Reaches Your LLM',
    description: 'Prompt injection is the SQL injection of the AI era. Pattern matching, structural analysis, LLM-based detection, and architectural defenses — with complete Python code.',
    category: 'Security',
    audience: 'Security Engineers',
    date: 'June 2025',
    readTime: 12,
    color: '#ef4444',
  },
  {
    slug: 'ciso-ai-vendor-security-assessment-checklist',
    title: 'The CISO\'s AI Vendor Security Assessment Checklist',
    description: 'Complete security assessment for AI vendors. Covers SOC 2, DPAs, HIPAA BAAs, data handling, and risk rating. Includes provider comparison: OpenAI vs Anthropic vs Google vs Azure.',
    category: 'Security',
    audience: 'CISOs & GRC',
    date: 'June 2025',
    readTime: 11,
    color: '#ef4444',
  },
  {
    slug: 'eu-ai-act-vs-us-ai-executive-order-comparison',
    title: 'EU AI Act vs US AI Executive Order: What\'s Actually Different',
    description: 'Side-by-side comparison of EU AI Act and US Executive Order 14110. Covers scope, risk classification, documentation, penalties, and how to build a compliance program for both.',
    category: 'Compliance',
    audience: 'Global Compliance',
    date: 'June 2025',
    readTime: 11,
    color: '#7c3aed',
  },
];

const CATEGORY_COLORS = {
  'Compliance': { bg: 'rgba(124,58,237,0.1)', text: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  'Security':   { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  'Engineering':{ bg: 'rgba(37,99,235,0.1)',   text: '#2563eb', border: 'rgba(37,99,235,0.25)' },
  'Finance':    { bg: 'rgba(16,185,129,0.1)',  text: '#10b981', border: 'rgba(16,185,129,0.25)' },
};

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS['Engineering'];
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
      {category}
    </span>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
        padding: '28px', transition: 'all 0.2s', cursor: 'pointer',
        borderLeft: `4px solid ${article.color}`,
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(10,16,69,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <CategoryBadge category={article.category} />
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0a1045', lineHeight: 1.4, marginBottom: 10, flex: 1 }}>
          {article.title}
        </h2>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 18 }}>
          {article.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white' }}>T</div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Thiru · {article.date}</span>
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{article.readTime} min read</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const [filter, setFilter] = React.useState('All');
  const categories = ['All', 'Compliance', 'Security', 'Engineering', 'Finance'];
  const filtered = filter === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === filter);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <BlogSeo
        title='AI Governance, Compliance and Security Blog'
        description='Practical guides on EU AI Act compliance, SOC 2 + AI, shadow AI risks, LLM cost control, prompt injection detection, and AI vendor assessment for enterprise teams.'
        slug=''
      />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0a1045 0%, #1e3a8a 100%)', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
            DecisionMesh Blog
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            AI Governance, Compliance<br />& Security Insights
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Practical guides for compliance teams, CISOs, engineers, and executives
            navigating the AI governance landscape.
          </p>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: filter === cat ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  background: filter === cat ? '#2563eb' : 'rgba(255,255,255,0.07)',
                  color: filter === cat ? 'white' : '#94a3b8',
                  transition: 'all 0.15s',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filtered.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* Newsletter CTA */}
        <div style={{ marginTop: 64, background: 'linear-gradient(135deg, #0a1045, #1e3a8a)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>
            Govern every AI decision
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15 }}>
            DecisionMesh — AI audit trails, policy enforcement, and cost controls. Free during beta.
          </p>
          <a href="/auth/login" style={{ background: '#2563eb', color: 'white', padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Start for free →
          </a>
        </div>
      </div>
    </div>
  );
}
