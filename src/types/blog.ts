export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  lang: 'en' | 'bn';
  tags: string[];
  featured: boolean;
  published: boolean;
}
