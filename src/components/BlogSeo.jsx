import { useEffect } from 'react';

/**
 * BlogSeo — sets document title + meta tags for blog posts.
 * Uses vanilla DOM — no extra npm package needed.
 *
 * Usage:
 *   <BlogSeo
 *     title="Shadow AI: The Hidden Risk in Your Enterprise"
 *     description="Shadow AI is shadow IT — except the data..."
 *     slug="shadow-ai-enterprise-risk-ciso-guide"
 *     date="2025-06-01"
 *   />
 */
export default function BlogSeo({ title, description, slug, date }) {
  const fullTitle  = `${title} | DecisionMesh Blog`;
  const canonical  = `https://decimeshi.com/blog/${slug}`;
  const ogImage    = `https://decimeshi.com/og-image.png`;
  const published  = date || '2025-06-01';

  useEffect(() => {
    // ── Title ────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper ───────────────────────────────────────────────
    const setMeta = (sel, content) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        const attr = sel.includes('name=') ? 'name' : 'property';
        const val  = sel.match(/["']([^"']+)["']/)?.[1];
        if (attr && val) el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ── Standard meta ────────────────────────────────────────
    setMeta('meta[name="description"]',          description);
    setMeta('meta[name="robots"]',               'index, follow');
    setMeta('meta[name="author"]',               'Thiru, DecisionMesh');
    setMeta('meta[property="article:published_time"]', published);

    // ── Open Graph ───────────────────────────────────────────
    setMeta('meta[property="og:title"]',         fullTitle);
    setMeta('meta[property="og:description"]',   description);
    setMeta('meta[property="og:type"]',          'article');
    setMeta('meta[property="og:url"]',           canonical);
    setMeta('meta[property="og:image"]',         ogImage);
    setMeta('meta[property="og:site_name"]',     'DecisionMesh');

    // ── Twitter / X card ─────────────────────────────────────
    setMeta('meta[name="twitter:card"]',         'summary_large_image');
    setMeta('meta[name="twitter:title"]',        fullTitle);
    setMeta('meta[name="twitter:description"]',  description);
    setMeta('meta[name="twitter:image"]',        ogImage);

    // ── Canonical ────────────────────────────────────────────
    setLink('canonical', canonical);

    // ── Article structured data ──────────────────────────────
    const existingScript = document.getElementById('blog-structured-data');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id   = 'blog-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context':       'https://schema.org',
      '@type':          'Article',
      headline:         title,
      description:      description,
      url:              canonical,
      datePublished:    published,
      dateModified:     published,
      author: {
        '@type': 'Person',
        name:    'Thiru',
        url:     'https://decimeshi.com',
      },
      publisher: {
        '@type': 'Organization',
        name:    'DecisionMesh',
        logo: {
          '@type': 'ImageObject',
          url:     'https://decimeshi.com/decimeshi-icon.svg',
        },
      },
      image: ogImage,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    });
    document.head.appendChild(script);

    // ── Cleanup on unmount ───────────────────────────────────
    return () => {
      document.title = 'DecisionMesh — AI Intent Control Plane';
      const s = document.getElementById('blog-structured-data');
      if (s) s.remove();
    };
  }, [title, description, slug]);

  return null;
}
