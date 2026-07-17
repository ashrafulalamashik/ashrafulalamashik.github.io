import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  ArrowLeft, 
  Search, 
  Code,
  ExternalLink
} from 'lucide-react';
import siteConfig from '../config/siteConfig';
import ProjectPreviewModal from '../components/ProjectPreviewModal';

// Particle Background Component
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

export default function AllProjects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{isOpen: boolean, url: string, title: string}>({isOpen: false, url: '', title: ''});
  
  const mainRef = useRef<HTMLDivElement>(null);
  const { personal, projects, siteIdentity } = siteConfig;

  useEffect(() => {
    document.title = "All Projects | Ashraful Alam Ashik";
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.fromTo('.project-item-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  // Get all unique categories from projects
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    (projects || []).forEach(p => {
      if ((p as any).category) {
        cats.add((p as any).category);
      }
    });
    return Array.from(cats);
  }, [projects]);

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (projects || []).forEach(p => {
      p.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  }, [projects]);

  // Filter projects based on search query, category, and selected tag
  const filteredProjects = useMemo(() => {
    return (projects || []).filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? (p as any).category === selectedCategory : true;
      const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [projects, searchQuery, selectedCategory, selectedTag]);

  const handleCategoryClick = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
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
                {siteIdentity?.logoType === 'image' && siteIdentity?.logoImgPath ? (
                  <img src={siteIdentity.logoImgPath} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  personal.initials
                )}
              </div>
              <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:block">
                {personal.shortName}
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
          <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-xs sm:text-sm font-medium mb-4">
            Showcase
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            All <span className="text-[#22C55E]">Projects</span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Explore my complete portfolio of web applications, custom ERPs, database management systems, and workflow automation.
          </p>
        </div>

        {/* Search & Tag Filter */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
            />
          </div>

          <div className="space-y-4">
            {allCategories.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider block">Filter by Category</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
                      selectedCategory === null
                        ? 'bg-[#22C55E] text-white border-[#22C55E]'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    All
                  </button>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#22C55E] text-white border-[#22C55E]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider block">Filter by Tech Stack</span>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedTag === tag
                      ? 'bg-[#22C55E] text-white border-[#22C55E]'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <div 
                key={index} 
                className="project-item-card group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 hover:border-[#22C55E]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#22C55E]/5 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/5 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Code className="text-[#22C55E]" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-[#22C55E] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>
                <div className="relative flex flex-col gap-4 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tIndex) => (
                      <span 
                        key={tIndex} 
                        className="text-xs bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    {/* View Details is currently not implemented for projects (no individual project page), so we just add the See Site button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Open the modal with the liveUrl if it exists, otherwise use a placeholder
                        const liveUrl = (project as any).liveUrl || 'https://example.com';
                        setPreviewData({ isOpen: true, url: liveUrl, title: project.title });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white border border-zinc-700 hover:border-[#22C55E] hover:text-[#22C55E] rounded-lg text-sm font-medium transition-all group/btn z-20"
                    >
                      <ExternalLink size={16} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      See Site
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-zinc-500">
              No projects found matching your filters.
            </div>
          )}
        </div>
      </main>

      {/* Project Preview Modal */}
      <ProjectPreviewModal 
        isOpen={previewData.isOpen} 
        onClose={() => setPreviewData({ ...previewData, isOpen: false })} 
        url={previewData.url} 
        title={previewData.title} 
      />
    </div>
  );
}
