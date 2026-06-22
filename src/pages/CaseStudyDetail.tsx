import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Terminal, 
  Award,
  Lock,
  Server,
  Code
} from 'lucide-react';
import siteConfig from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

const CACHE_BUSTER = Date.now();

// Particle Component
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
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#22C55E]/5 to-transparent blur-[80px] bottom-0 right-1/4 animate-pulse-slow" />
    </div>
  );
}

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const mainRef = useRef<HTMLDivElement>(null);

  const rawData = slug ? siteConfig.caseStudies.find(study => study.slug === slug) : null;

  // Process data with robust fallbacks to support simple dynamically added case studies
  const data = rawData ? {
    ...rawData,
    category: rawData.category || "Case Study",
    title: rawData.title || "Untitled Project",
    subtitle: rawData.subtitle || rawData.title || "Detailed project case study.",
    role: rawData.role || "Lead Full-Stack Web Developer",
    status: rawData.status || "Completed",
    completionProgress: rawData.completionProgress || {
      backend: 100,
      frontend: 100
    },
    techStack: rawData.techStack || {
      frontend: ["React", "TypeScript", "Tailwind CSS"],
      backend: ["Laravel", "MySQL"],
      infrastructure: ["Web Hosting"]
    },
    summary: rawData.summary || rawData.problem || "",
    challenge: rawData.challenge || {
      description: rawData.problem || "Implementing a custom service solution to address client requirements.",
      objectives: rawData.results || ["Build a scalable, lightweight architecture.", "Optimize speed and organic performance."]
    },
    architectureAndSecurity: rawData.architectureAndSecurity || {
      title: "System Architecture & Security Highlights",
      points: [
        {
          title: "Production Implementation",
          description: rawData.solution || "Custom business logic and API integrations."
        }
      ]
    },
    keyFeatures: rawData.keyFeatures || [
      {
        title: "Responsive Front-End UI",
        description: "Mobile-first layouts with modern user experiences and fast load times."
      },
      {
        title: "Secure Operations",
        description: rawData.solution || "Robust backend integrations that guarantee system reliability."
      }
    ],
    outcomes: rawData.outcomes || rawData.results || ["Project successfully optimized and launched."]
  } : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!data) return;

    const ctx = gsap.context(() => {
      // Fade in header and quick info
      gsap.fromTo('.header-animate', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 }
      );

      // Scroll trigger for sections
      const sections = ['.challenge-section', '.tech-stack-section', '.architecture-section', '.features-section', '.outcomes-section'];
      sections.forEach((sectionClass) => {
        gsap.fromTo(sectionClass,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionClass,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <ParticleBackground />
        <div className="text-center z-10">
          <h1 className="text-4xl font-bold mb-4">Case Study Not Found</h1>
          <p className="text-zinc-400 mb-8">The requested portfolio case study could not be located.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#22C55E] text-white px-6 py-3 rounded-full hover:bg-[#16A34A] transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
                  <img src={`${siteConfig.siteIdentity.logoImgPath}?v=${CACHE_BUSTER}`} alt="Logo" className="w-full h-full object-cover" />
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

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {data.image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={data.image} 
              alt={data.title} 
              className="w-full h-full object-cover opacity-10 filter blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]"></div>
          </div>
        )}
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <span className="header-animate inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-xs sm:text-sm font-medium mb-6">
            {data.category}
          </span>
          <h1 className="header-animate text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            {data.title}
          </h1>
          <p className="header-animate text-zinc-400 text-base sm:text-lg md:text-xl mb-8 leading-relaxed">
            {data.subtitle}
          </p>

          {/* Quick Stats Grid */}
          <div className="header-animate grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">My Role</p>
              <p className="text-white text-sm font-medium">{data.role}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Project Status</p>
              <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-medium">{data.status}</span>
                {/* Visual completion progress bar */}
                <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>Backend</span>
                      <span className="text-[#22C55E] font-medium">{data.completionProgress.backend}%</span>
                    </div>
                    <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#22C55E] h-full" style={{ width: `${data.completionProgress.backend}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>Frontend</span>
                      <span className="text-[#22C55E] font-medium">{data.completionProgress.frontend}%</span>
                    </div>
                    <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#22C55E] h-full" style={{ width: `${data.completionProgress.frontend}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Location Context</p>
              <p className="text-white text-sm font-medium">Sherpur & Bogura, Bangladesh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-24">
        
        {/* Project Summary */}
        <section className="challenge-section bg-gradient-to-r from-zinc-900/40 to-zinc-900/20 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2.5">
            <Cpu className="text-[#22C55E]" size={22} /> Project Summary
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            {data.summary}
          </p>
        </section>

        {/* The Challenge & Objective */}
        <section className="challenge-section grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-red-500/90 flex items-center gap-2">
              <Lock className="text-red-500/80" size={18} /> The Challenge
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {data.challenge.description}
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#22C55E] flex items-center gap-2">
              <Check className="text-[#22C55E]" size={18} /> Engineering Objectives
            </h3>
            <ul className="space-y-3">
              {data.challenge.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-sm">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full mt-2 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tech Stack Badge List */}
        <section className="tech-stack-section">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2.5">
            <Layers className="text-[#22C55E]" size={22} /> Technology Stack
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {data.techStack.frontend.map((tech, i) => (
                  <span key={i} className="bg-zinc-800/60 text-zinc-300 text-xs px-2.5 py-1 rounded-md border border-zinc-700/50">{tech}</span>
                ))}
              </div>
            </div>
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Backend & DB</h3>
              <div className="flex flex-wrap gap-2">
                {data.techStack.backend.map((tech, i) => (
                  <span key={i} className="bg-zinc-800/60 text-[#22C55E] text-xs px-2.5 py-1 rounded-md border border-[#22C55E]/10">{tech}</span>
                ))}
              </div>
            </div>
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Integrations & Infra</h3>
              <div className="flex flex-wrap gap-2">
                {data.techStack.infrastructure.map((tech, i) => (
                  <span key={i} className="bg-zinc-800/60 text-zinc-300 text-xs px-2.5 py-1 rounded-md border border-zinc-700/50">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Security Highlights */}
        <section className="architecture-section space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2.5">
            <ShieldCheck className="text-[#22C55E]" size={22} /> {data.architectureAndSecurity.title}
          </h2>
          <div className="space-y-6">
            {data.architectureAndSecurity.points.map((point: any, i) => (
              <div key={i} className="group bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 p-6 rounded-2xl hover:border-[#22C55E]/30 transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold mb-2 text-[#22C55E] flex items-center gap-2">
                  <Terminal size={16} /> {point.title}
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
                  {point.description}
                </p>
                {point.codeSnippet && (
                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 shadow-inner">
                    <div className="absolute right-2 top-2 flex items-center gap-1.5 text-zinc-600 text-[10px]">
                      <Code size={10} /> CODE SNIPPET
                    </div>
                    <pre className="overflow-x-auto whitespace-pre">{point.codeSnippet}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Developed */}
        <section className="features-section space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2.5">
            <Server className="text-[#22C55E]" size={22} /> Key System Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {data.keyFeatures.map((feat, i) => (
              <div key={i} className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-xl hover:border-zinc-700/80 transition-colors">
                <h3 className="font-bold text-white mb-2 text-sm sm:text-base">{feat.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outcomes & Impact */}
        <section className="outcomes-section bg-gradient-to-b from-zinc-900/50 to-zinc-950/20 border border-zinc-800 p-6 sm:p-8 rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2.5">
            <Award className="text-[#22C55E]" size={22} /> Outcomes & Business Impact
          </h2>
          <ul className="space-y-4">
            {data.outcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base">
                <div className="w-5 h-5 bg-[#22C55E]/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="text-[#22C55E]" size={12} />
                </div>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Call to Action Navigation */}
        <section className="text-center pt-8 border-t border-zinc-800/60">
          <h3 className="text-lg font-bold mb-4">Want to review my detailed CV or other operations?</h3>
          <div className="flex justify-center gap-4">
            <Link to="/" className="px-6 py-3 bg-zinc-850 hover:bg-zinc-800 text-white rounded-full font-medium text-sm transition-all border border-zinc-750">
              Return to Homepage
            </Link>
            <a 
              href="http://wa.me/+8801737940250"
              target="_blank"
              rel="noopener noreferrer" 
              className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full font-medium text-sm transition-all"
            >
              Contact me on WhatsApp
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
