import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  BookOpen, 
  Search
} from 'lucide-react';
import { blogConfig } from '../config/blogConfig';
import { siteConfig } from '../config/siteConfig';

// Particle Background Component for rich aesthetics
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = Math.min(30, Math.floor(window.innerWidth / 40));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1
    }));

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
          ctx.fill();
        });

        for (let i = 0; i < particlesRef.current.length; i += 3) {
          for (let j = i + 1; j < particlesRef.current.length; j += 3) {
            const dx = particlesRef.current[i].x - particlesRef.current[j].x;
            const dy = particlesRef.current[i].y - particlesRef.current[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
              ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
              ctx.strokeStyle = `rgba(34, 197, 94, ${0.08 * (1 - dist / 120)})`;
              ctx.stroke();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#22C55E]/10 to-transparent blur-[120px] -top-48 -left-48 animate-float-slow" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-l from-[#22C55E]/8 to-transparent blur-[100px] top-1/3 -right-32 animate-float-medium" />
    </div>
  );
}

export default function Blog() {
  const [selectedLang, setSelectedLang] = useState<'all' | 'en' | 'bn'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mainRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Set document title and OG meta tags dynamically
  useEffect(() => {
    document.title = "Blog | Ashraful Alam Ashik";
    window.scrollTo(0, 0);

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) || [];
        if (attrName && attrVal) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[property="og:title"]', 'content', "Blog | Ashraful Alam Ashik");
    setMeta('meta[property="og:description"]', 'content', "Read my articles on Full-Stack Web Development, SEO, automation, and tech workflows.");
    setMeta('meta[property="og:url"]', 'content', "https://ashrafulalamashik.github.io/portfolio/#/blog");
    setMeta('meta[property="og:type"]', 'content', 'website');
    
    setMeta('meta[name="twitter:title"]', 'content', "Blog | Ashraful Alam Ashik");
    setMeta('meta[name="twitter:description"]', 'content', "Read my articles on Full-Stack Web Development, SEO, automation, and tech workflows.");
  }, []);

  // Filter published posts
  const publishedPosts = useMemo(() => {
    return blogConfig.filter(post => post.published);
  }, []);

  // Get unique tags from published posts
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    publishedPosts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [publishedPosts]);

  // Filter posts based on language, tag and search query
  const filteredPosts = useMemo(() => {
    return publishedPosts.filter(post => {
      const matchLang = selectedLang === 'all' ? true : post.lang === selectedLang;
      const matchTag = !selectedTag ? true : post.tags?.includes(selectedTag);
      const matchSearch = !searchQuery ? true : (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchLang && matchTag && matchSearch;
    });
  }, [publishedPosts, selectedLang, selectedTag, searchQuery]);

  // GSAP animation on component mount/filter change
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in header elements
      gsap.fromTo('.header-animate', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
      );

      // Fade in cards
      if (filteredPosts.length > 0) {
        gsap.fromTo('.post-card',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.1 }
        );
      }
    }, mainRef);

    return () => ctx.revert();
  }, [filteredPosts.length]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Toggle off if clicked again
    } else {
      setSelectedTag(tag);
    }
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden relative pb-20">
      <ParticleBackground />
      <GradientOrbs />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {siteConfig.siteIdentity?.logoType === 'image' && siteConfig.siteIdentity?.logoImgPath ? (
                  <img src={siteConfig.siteIdentity.logoImgPath} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  siteConfig.personal.initials
                )}
              </div>
              <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:block">
                {siteConfig.personal.shortName}
              </span>
            </Link>
            
            <Link 
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="header-animate inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-xs sm:text-sm font-medium mb-4">
            Insights & Tutorials
          </span>
          <h1 className="header-animate text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            My <span className="text-[#22C55E]">Tech Blog</span>
          </h1>
          <p className="header-animate text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Sharing technical knowledge on Laravel, Next.js, automation workflows, and SEO strategies.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="header-animate bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Language filter tabs */}
            <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full md:w-auto">
              <button
                onClick={() => setSelectedLang('all')}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedLang === 'all' 
                    ? 'bg-[#22C55E] text-white shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedLang === 'en' 
                    ? 'bg-[#22C55E] text-white shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🇬🇧</span> English
              </button>
              <button
                onClick={() => setSelectedLang('bn')}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedLang === 'bn' 
                    ? 'bg-[#22C55E] text-white shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                <span>🇧🇩</span> বাংলা
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#22C55E] transition-colors"
              />
            </div>
          </div>

          {/* Tags List */}
          {uniqueTags.length > 0 && (
            <div className="pt-3 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                <Tag size={12} /> Filter by tag:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      selectedTag === tag
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/50'
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts Grid / Cards */}
        <div ref={cardsRef} className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <article
                key={post.id}
                className="post-card group bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/80 hover:border-[#22C55E]/30 p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 text-zinc-500 text-xs sm:text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className="w-1.5 h-1.5 bg-zinc-850 rounded-full" />
                    <span className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      {post.lang === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                    </span>
                  </div>

                  {post.featured && (
                    <span className="text-[10px] sm:text-xs font-semibold text-[#22C55E] uppercase tracking-wider bg-[#22C55E]/10 border border-[#22C55E]/25 px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <h2 
                  className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-[#22C55E] transition-colors"
                  style={post.lang === 'bn' ? { fontFamily: "'Hind Siliguri', sans-serif" } : undefined}
                >
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p 
                  className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3"
                  style={post.lang === 'bn' ? { fontFamily: "'Hind Siliguri', sans-serif" } : undefined}
                >
                  {post.excerpt}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800/60">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-zinc-500 text-xs bg-zinc-950 border border-zinc-800/80 px-2.5 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-[#22C55E] hover:text-[#16A34A] font-medium text-sm group-hover:translate-x-1 transition-all"
                  >
                    <BookOpen size={16} />
                    Read More
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-16 bg-zinc-900/10 border border-zinc-900 border-dashed rounded-2xl">
              <p className="text-zinc-500 text-sm sm:text-base">No posts yet. Check back soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
