import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Calendar, Tag, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

export default function BlogPostComponent() {
  const { slug } = useParams<{ slug: string }>();
  const mainRef = useRef<HTMLDivElement>(null);

  const post = slug ? blogConfig.find(p => p.slug === slug && p.published) : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!post) return;

    // Set document title
    document.title = `${post.title} | Ashraful Alam Ashik`;

    // Set dynamic meta tags
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

    setMeta('meta[property="og:title"]', 'content', post.title);
    setMeta('meta[property="og:description"]', 'content', post.excerpt);
    setMeta('meta[property="og:url"]', 'content', `https://ashrafulalamashik.github.io/portfolio/#/blog/${post.slug}`);
    setMeta('meta[property="og:type"]', 'content', 'article');

    setMeta('meta[name="twitter:title"]', 'content', post.title);
    setMeta('meta[name="twitter:description"]', 'content', post.excerpt);

    // Inject JSON-LD Article Schema
    const schemaId = 'blog-post-jsonld';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": { "@type": "Person", "name": "Md. Ashraful Alam Ashik" },
      "url": "https://ashrafulalamashik.github.io/portfolio/#/blog/" + post.slug
    });

    // GSAP fade-in animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.blog-post-animate',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 }
      );
    }, mainRef);

    return () => {
      ctx.revert();
      const scriptToRemove = document.getElementById(schemaId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <ParticleBackground />
        <div className="text-center z-10">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-zinc-400 mb-8 font-medium">The requested blog article does not exist or has not been published yet.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 bg-[#22C55E] text-white px-6 py-3 rounded-full hover:bg-[#16A34A] transition-colors font-medium">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Check if Bangla is the post language to use Hind Siliguri font
  const fontStyle = post.lang === 'bn' ? { fontFamily: "'Hind Siliguri', sans-serif" } : undefined;

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
              to="/blog"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 relative z-10">
        {/* Back navigation link */}
        <div className="mb-8 flex justify-between items-center blog-post-animate">
          <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            <span>Back to Blog</span>
          </Link>
          <span className="text-zinc-500 text-xs sm:text-sm">Ashraful Alam Ashik</span>
        </div>

        <article className="blog-post-animate" style={fontStyle}>
          {/* Post Header */}
          <div className="border-b border-zinc-800/80 pb-8 mb-8">
            <div className="flex flex-wrap items-center gap-3 text-zinc-500 text-xs sm:text-sm mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {post.date}
              </span>
              <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                {post.lang === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
              </span>
              <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Languages size={14} />
                By Md. Ashraful Alam Ashik
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed italic border-l-2 border-[#22C55E] pl-4">
              {post.excerpt}
            </p>
          </div>

          {/* Post Content */}
          <div className="blog-prose" style={fontStyle}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 text-sm flex items-center gap-1.5 mr-2">
              <Tag size={16} /> Tags:
            </span>
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-zinc-400 text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="blog-post-animate mt-16 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/blog" className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-medium text-sm transition-all border border-zinc-800 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Return to Blog
          </Link>
          <a 
            href="http://wa.me/+8801737940250"
            target="_blank"
            rel="noopener noreferrer" 
            className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full font-medium text-sm transition-all text-center w-full sm:w-auto"
          >
            Contact on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
