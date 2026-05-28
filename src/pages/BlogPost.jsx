// src/pages/BlogPost.jsx
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function BlogPost({ slug }) {
    const [content, setContent] = useState('')

    useEffect(() => {
        // Fetch the markdown file from /public/blog/
        fetch(`/blog/${slug}.md`)
            .then(r => r.text())
            .then(setContent)
    }, [slug])

    return (
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px' }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({children}) => <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0a1045', marginBottom: 16 }}>{children}</h1>,
                    h2: ({children}) => <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a1045', marginTop: 40, marginBottom: 12 }}>{children}</h2>,
                    h3: ({children}) => <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a8a', marginTop: 28, marginBottom: 8 }}>{children}</h3>,
                    p:  ({children}) => <p  style={{ fontSize: 16, lineHeight: 1.8, color: '#374151', marginBottom: 16 }}>{children}</p>,
                    code: ({inline, children}) => inline
                        ? <code style={{ background: '#f0f4ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>{children}</code>
                        : <pre style={{ background: '#0a1045', color: '#e2e8f0', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 13, lineHeight: 1.7 }}><code>{children}</code></pre>,
                    ul: ({children}) => <ul style={{ paddingLeft: 24, marginBottom: 16 }}>{children}</ul>,
                    li: ({children}) => <li style={{ fontSize: 16, lineHeight: 1.8, color: '#374151', marginBottom: 6 }}>{children}</li>,
                    table: ({children}) => <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>{children}</table>,
                    th: ({children}) => <th style={{ background: '#0a1045', color: 'white', padding: '10px 14px', textAlign: 'left', fontSize: 13 }}>{children}</th>,
                    td: ({children}) => <td style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: 14, color: '#374151' }}>{children}</td>,
                    blockquote: ({children}) => <blockquote style={{ borderLeft: '4px solid #2563eb', paddingLeft: 16, margin: '24px 0', color: '#64748b', fontStyle: 'italic' }}>{children}</blockquote>,
                    a: ({href, children}) => <a href={href} style={{ color: '#2563eb', textDecoration: 'underline' }}>{children}</a>,
                    hr: () => <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}