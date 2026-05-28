// src/pages/BlogPostPage.jsx
import { useParams } from 'react-router-dom'
import BlogPost from './BlogPost'

export default function BlogPostPage() {
    const { slug } = useParams()
    return <BlogPost slug={slug} />
}