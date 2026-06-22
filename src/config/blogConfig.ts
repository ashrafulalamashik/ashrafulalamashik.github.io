import type { BlogPost } from '../types/blog';

export const blogConfig: BlogPost[] = [
  {
    id: "post-001",
    slug: "welcome-to-my-blog",
    title: "Welcome to My Blog",
    excerpt: "Starting a space to share what I learn in Full-Stack development, SEO, and digital operations.",
    content: `## Hello World!\n\nThis is my first blog post. I will be sharing insights about:\n\n- Full-Stack web development with **Laravel** and **Next.js**\n- Technical SEO strategies that actually work\n- Automation workflows with n8n\n- My project case studies and lessons learned\n\nStay tuned for more content!\n`,
    date: "2025-06-22",
    lang: "en",
    tags: ["General", "Introduction"],
    featured: true,
    published: true,
  },
];
