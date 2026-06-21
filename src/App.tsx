import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Globe, 
  Zap, 
  RefreshCw, 
  Settings, 
  Check, 
  ArrowUpRight, 
  MessageCircle, 
  Linkedin,
  Menu,
  X,
  Star,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  Calendar,
  MapPin,
  GraduationCap,
  FileText,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  Medal
} from 'lucide-react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import siteConfig from './config/siteConfig';
import SEOProposal from './pages/SEOProposal';
import CaseStudyDetail from './pages/CaseStudyDetail';
import Admin from './pages/Admin';

gsap.registerPlugin(ScrollTrigger);

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
  const mouseRef = useRef({ x: 0, y: 0 });

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

    const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle, i) => {
          if (i % 5 === 0) {
            const dx = mouseRef.current.x - particle.x;
            const dy = mouseRef.current.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              particle.vx -= dx * 0.0001;
              particle.vy -= dy * 0.0001;
            }
          }

          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
          ctx.fill();
        });

        for (let i = 0; i < particlesRef.current.length; i += 2) {
          for (let j = i + 1; j < particlesRef.current.length; j += 2) {
            const dx = particlesRef.current[i].x - particlesRef.current[j].x;
            const dy = particlesRef.current[i].y - particlesRef.current[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
              ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
              ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - dist / 100)})`;
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
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

// Animated Gradient Orbs
function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="orb orb-1 absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#22C55E]/20 to-transparent blur-[100px] -top-48 -left-48 animate-float-slow" />
      <div className="orb orb-2 absolute w-[500px] h-[500px] rounded-full bg-gradient-to-l from-[#22C55E]/15 to-transparent blur-[80px] top-1/3 -right-32 animate-float-medium" />
      <div className="orb orb-3 absolute w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#22C55E]/10 to-transparent blur-[60px] bottom-1/4 left-1/4 animate-float-fast" />
      <div className="orb orb-4 absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#22C55E]/25 to-transparent blur-[70px] bottom-0 right-1/4 animate-pulse-slow" />
    </div>
  );
}

// Typewriter Effect Component
function TypewriterText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(text.slice(0, currentText.length + 1));
        if (currentText === text) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentText(text.slice(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts]);

  return (
    <span className="text-[#22C55E]">
      {currentText}
      <span className="animate-blink">|</span>
    </span>
  );
}

// Floating Stats Component
function FloatingStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
      {siteConfig.hero.stats.map((stat, index) => (
        <div
          key={index}
          className="stat-card bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 text-center hover:border-[#22C55E]/30 transition-all duration-300 hover:transform hover:scale-105"
        >
          {index === 0 && <TrendingUp className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />}
          {index === 1 && <Users className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />}
          {index === 2 && <Star className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />}
          {index === 3 && <Award className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />}
          <div className="text-2xl font-bold text-white">{stat.value}</div>
          <div className="text-xs text-zinc-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// CV Modal Component
function CVModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="text-[#22C55E]" size={20} />
            Professional CV - Ashraful Alam Ashik
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.personal.cvPath}
              download
              className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A] transition-colors"
            >
              <ExternalLink size={16} />
              Download CV
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <iframe
            src={siteConfig.personal.cvPath}
            className="w-full h-full rounded-lg"
            title="CV Preview"
          />
        </div>
      </div>
    </div>
  );
}

// Main Home Component
function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const caseStudiesRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline();
      heroTl
        .fromTo('.hero-image-container',
          { opacity: 0, scale: 0.8, rotateY: -30 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 1, ease: 'back.out(1.7)' }
        )
        .fromTo('.hero-heading',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo('.hero-subheading',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.hero-cta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo('.hero-meta',
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.2'
        );

      const sections = [
        { ref: aboutRef, class: '.about-content' },
        { ref: experienceRef, class: '.experience-content' },
        { ref: servicesRef, class: '.services-content' },
        { ref: caseStudiesRef, class: '.case-studies-content' },
        { ref: certificationsRef, class: '.certifications-content' },
        { ref: skillsRef, class: '.skills-content' },
        { ref: whyRef, class: '.why-content' },
        { ref: ctaRef, class: '.cta-content' },
      ];

      sections.forEach(({ ref, class: className }) => {
        if (ref.current) {
          gsap.fromTo(className,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });

      gsap.fromTo('.service-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.case-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: caseStudiesRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.cert-card',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: certificationsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.skill-pill',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: skillsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.why-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: whyRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo('.timeline-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: experienceRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const { personal, about, experience, certifications, services, caseStudies, skills, whyWorkWithMe } = siteConfig;

  return (
    <div ref={mainRef} className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden relative">
      <ParticleBackground />
      <GradientOrbs />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm">
                {personal.initials}
              </div>
              <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:block">
                {personal.shortName}
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-5 text-sm">
              <button onClick={() => scrollToSection(aboutRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">About</button>
              <button onClick={() => scrollToSection(experienceRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">Experience</button>
              <button onClick={() => scrollToSection(servicesRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">Services</button>
              <button onClick={() => scrollToSection(caseStudiesRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">Case Studies</button>
              <button onClick={() => scrollToSection(certificationsRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">Certifications</button>
              <button onClick={() => scrollToSection(skillsRef)} className="text-zinc-400 hover:text-white transition-colors link-hover">Skills</button>
              <Link to="/seo-proposal" className="text-zinc-400 hover:text-[#22C55E] transition-colors link-hover">SEO Proposal</Link>
              <a 
                href={personal.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#22C55E] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16A34A] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#22C55E]/20"
              >
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300 ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 py-4 space-y-2">
            <button onClick={() => scrollToSection(aboutRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">About</button>
            <button onClick={() => scrollToSection(experienceRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">Experience</button>
            <button onClick={() => scrollToSection(servicesRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">Services</button>
            <button onClick={() => scrollToSection(caseStudiesRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">Case Studies</button>
            <button onClick={() => scrollToSection(certificationsRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">Certifications</button>
            <button onClick={() => scrollToSection(skillsRef)} className="block w-full text-left text-zinc-400 hover:text-white py-2 hover:pl-2 transition-all">Skills</button>
            <Link to="/seo-proposal" className="block w-full text-left text-zinc-400 hover:text-[#22C55E] py-2 hover:pl-2 transition-all">SEO Proposal</Link>
            <a 
              href={personal.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#22C55E] text-white px-4 py-3 rounded-lg text-center font-medium hover:bg-[#16A34A] transition-colors mt-2"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8 pt-20">
        <span className="watermark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">01</span>
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="mb-4">
                <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium">
                  <TypewriterText texts={siteConfig.hero.typewriterTexts} />
                </span>
              </div>
              <h1 className="hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                {personal.name.split(' ').slice(0, 2).join(' ')}<br />
                <span className="text-[#22C55E]">{personal.name.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="hero-subheading text-lg sm:text-xl md:text-2xl text-zinc-400 mb-6 sm:mb-8">
                {personal.tagline}
              </p>
              <div className="hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a 
                  href={personal.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn bg-[#22C55E] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium flex items-center gap-2 text-sm sm:text-base shadow-lg shadow-[#22C55E]/20"
                >
                  <MessageCircle size={18} />
                  Contact on WhatsApp
                </a>
                <button 
                  onClick={() => setCvModalOpen(true)}
                  className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-3 sm:py-4 rounded-full font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <FileText size={18} />
                  Review My CV
                </button>
              </div>
              <div className="hero-meta mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
                  {personal.location.split(',').slice(-2).join(', ')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
                  {personal.experience} Years Experience
                </span>
              </div>
            </div>

            {/* Right Content - Profile Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="hero-image-container relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/30 to-[#22C55E]/10 rounded-full blur-3xl scale-110 animate-pulse-slow"></div>
                
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                      <img 
                        src="/profile.png" 
                        alt={personal.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 sm:px-4 sm:py-2 shadow-xl animate-float">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-medium">Available for Work</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 border-2 border-dashed border-[#22C55E]/30 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section mt-16 sm:mt-24">
            <FloatingStats />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 right-0 -translate-y-1/2 translate-x-1/3">02</span>
        <div className="about-content max-w-6xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
                Who I Am
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                About Me
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full mb-6"></div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#22C55E]/10 to-transparent rounded-2xl blur-xl"></div>
                <img 
                  src="/profile.png" 
                  alt={personal.name}
                  className="relative w-full max-w-sm rounded-2xl border border-zinc-800 shadow-2xl"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {about.paragraphs.map((paragraph, index) => (
                <p key={index} className={`text-base sm:text-lg leading-relaxed ${index === 0 ? 'text-zinc-300' : 'text-zinc-400'}`}>
                  {paragraph}
                </p>
              ))}
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-[#22C55E]/30 transition-colors">
                  <div className="text-[#22C55E] text-2xl font-bold">{about.quickStats[0].value}</div>
                  <div className="text-zinc-400 text-sm">{about.quickStats[0].label}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-[#22C55E]/30 transition-colors">
                  <div className="text-[#22C55E] text-2xl font-bold">{about.quickStats[1].value}</div>
                  <div className="text-zinc-400 text-sm">{about.quickStats[1].label}</div>
                </div>
              </div>

              <button
                onClick={() => setCvModalOpen(true)}
                className="flex items-center gap-2 text-[#22C55E] hover:text-white transition-colors font-medium"
              >
                <FileText size={18} />
                Review My CV
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section ref={experienceRef} id="experience" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 left-0 -translate-y-1/2 -translate-x-1/4">03</span>
        <div className="experience-content max-w-5xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              Career Journey
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Professional Experience
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              My career progression in digital operations and SEO
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#22C55E] via-[#22C55E]/50 to-transparent"></div>
            
            {/* Current Position */}
            <div className="timeline-item relative pl-12 sm:pl-20 pb-12">
              <div className="absolute left-0 sm:left-4 w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center border-4 border-[#0A0A0A]">
                <Briefcase size={14} className="text-white" />
              </div>
              <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-[#22C55E]/30 transition-all">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs font-medium rounded-full">Current</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1">{experience.current.title}</h3>
                <p className="text-[#22C55E] font-medium mb-3">{experience.current.company}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {experience.current.period}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {experience.current.location}
                  </span>
                </div>
                <ul className="space-y-2">
                  {experience.current.description.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-zinc-300 text-sm">
                      <Check size={14} className="text-[#22C55E] mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Previous Positions */}
            {experience.previous.map((job, index) => (
              <div key={index} className="timeline-item relative pl-12 sm:pl-20 pb-12">
                <div className="absolute left-0 sm:left-4 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-[#0A0A0A]">
                  <Briefcase size={14} className="text-zinc-400" />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-zinc-700 transition-all">
                  <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                  <p className="text-zinc-400 font-medium mb-3">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {job.period}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {job.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm">
                        <Check size={14} className="text-zinc-500 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} id="services" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 right-0 -translate-y-1/2 translate-x-1/3">04</span>
        <div className="services-content max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              What I Offer
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Services
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Comprehensive digital solutions tailored to your business needs
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <div key={index} className="service-card group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 hover:border-[#22C55E]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#22C55E]/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/5 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    {service.icon === 'Globe' && <Globe className="text-[#22C55E]" size={28} />}
                    {service.icon === 'Zap' && <Zap className="text-[#22C55E]" size={28} />}
                    {service.icon === 'RefreshCw' && <RefreshCw className="text-[#22C55E]" size={28} />}
                    {service.icon === 'Settings' && <Settings className="text-[#22C55E]" size={28} />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-[#22C55E] transition-colors">{service.title}</h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, tIndex) => (
                      <span key={tIndex} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section ref={caseStudiesRef} id="case-studies" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 left-0 -translate-y-1/2 -translate-x-1/4">05</span>
        <div className="case-studies-content max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Case Studies
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Real results from real projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {caseStudies.map((study, index) => (
              <Link 
                key={index} 
                to={`/case-study/${(study as any).slug}`}
                className={`case-card block text-left group relative overflow-hidden rounded-2xl cursor-pointer ${study.featured ? 'md:row-span-2' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[#22C55E]/5 group-hover:bg-[#22C55E]/10 transition-colors z-[5]"></div>
                
                <div className="absolute inset-0 rounded-2xl border border-zinc-700 group-hover:border-[#22C55E]/50 transition-colors"></div>
                
                <div className={`relative z-20 h-full flex flex-col justify-end ${study.featured ? 'min-h-[280px] sm:min-h-[400px]' : ''} p-6 sm:p-8`}>
                  <span className="inline-block w-fit px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs font-medium rounded-full mb-3">
                    {study.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-[#22C55E] transition-colors">
                    {study.title}
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Problem</p>
                    <p className="text-zinc-300 text-sm">{study.problem}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Solution</p>
                    <p className="text-zinc-300 text-sm">{study.solution}</p>
                  </div>
                  
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Results</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {study.results.map((result, rIndex) => (
                        <span key={rIndex} className="flex items-center gap-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-full text-xs text-zinc-300">
                          <Check size={12} className="text-[#22C55E]" />
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section ref={certificationsRef} id="certifications" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 right-0 -translate-y-1/2 translate-x-1/4">06</span>
        <div className="certifications-content max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              Credentials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Certifications
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Professional certifications and training
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="cert-card group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-[#22C55E]/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Medal className="text-[#22C55E]" size={28} />
                  </div>
                  <h3 className="text-base font-semibold mb-2 group-hover:text-[#22C55E] transition-colors">{cert.title}</h3>
                  <p className="text-zinc-400 text-sm mb-1">{cert.issuer}</p>
                  <p className="text-[#22C55E] text-sm font-medium">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">Education</h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-[#22C55E]/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-[#22C55E]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">BBA in Management</h4>
                    <p className="text-zinc-400 text-sm">Government Sherpur College, Bogura</p>
                  </div>
                </div>
                <p className="text-[#22C55E] text-sm">Expected 2026</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-[#22C55E]/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-[#22C55E]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">HSC, Business Studies</h4>
                    <p className="text-zinc-400 text-sm">Bogra Government College</p>
                  </div>
                </div>
                <p className="text-[#22C55E] text-sm">2020 | GPA: 4.50</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section ref={skillsRef} id="skills" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 left-0 -translate-y-1/2 -translate-x-1/4">07</span>
        <div className="skills-content max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Skills & Tools
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Technologies and methodologies I work with
            </p>
          </div>

          {/* Skill Categories */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-[#22C55E]" size={20} />
                <h3 className="font-semibold">SEO</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Technical SEO</li>
                <li>On-page SEO</li>
                <li>Off-page SEO</li>
                <li>Keyword Research</li>
                <li>Schema Markup</li>
              </ul>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="text-[#22C55E]" size={20} />
                <h3 className="font-semibold">Web Development</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>WordPress</li>
                <li>PHP Customization</li>
                <li>HTML/CSS</li>
                <li>JavaScript</li>
                <li>Landing Page Design</li>
              </ul>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-[#22C55E]" size={20} />
                <h3 className="font-semibold">Analytics</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Google Analytics</li>
                <li>Google Search Console</li>
                <li>Ahrefs</li>
                <li>SEMrush</li>
                <li>Screaming Frog</li>
              </ul>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-[#22C55E]" size={20} />
                <h3 className="font-semibold">Operations</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>n8n Automation</li>
                <li>Team Leadership</li>
                <li>Project Management</li>
                <li>Process Optimization</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="skill-pill group bg-zinc-900/50 border border-zinc-700 text-zinc-200 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium cursor-default hover:border-[#22C55E]/50 hover:bg-[#22C55E]/10 hover:text-[#22C55E] transition-all duration-300 hover:scale-105"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Work With Me Section */}
      <section ref={whyRef} id="why" className="min-h-screen flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <span className="watermark top-1/2 right-0 -translate-y-1/2 translate-x-1/4">08</span>
        <div className="why-content max-w-4xl mx-auto w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-4">
              Why Choose Me
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Why Work With Me
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              What sets me apart from other consultants
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {whyWorkWithMe.map((item, index) => (
              <div key={index} className="why-item group flex gap-4 sm:gap-6 items-start bg-gradient-to-r from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-[#22C55E]/30 hover:from-zinc-900 hover:to-zinc-900/60 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="text-[#22C55E]" size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-[#22C55E] transition-colors">{item.title}</h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="min-h-[70vh] flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#22C55E]/5 to-transparent"></div>
        <div className="cta-content max-w-4xl mx-auto w-full text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-sm font-medium mb-6">
            Let's Work Together
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Ready to Optimize Your<br className="hidden sm:block" />
            <span className="text-[#22C55E]">Digital Operations?</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
            Let's discuss how I can help your business grow. Free initial consultation—no obligations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={personal.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 text-base shadow-lg shadow-[#22C55E]/30 hover:shadow-xl hover:shadow-[#22C55E]/40 transition-all"
            >
              <MessageCircle size={20} />
              Contact on WhatsApp
            </a>
            <button
              onClick={() => setCvModalOpen(true)}
              className="group bg-zinc-800 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 text-base hover:bg-zinc-700 transition-all border border-zinc-700 hover:border-zinc-600"
            >
              <FileText size={20} />
              Review My CV
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold">
                  {personal.initials}
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-semibold">{personal.name}</div>
                  <div className="text-zinc-500 text-sm">{personal.tagline}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a 
                href={personal.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#22C55E] hover:bg-zinc-700 transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
              <a 
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center text-zinc-600 text-xs sm:text-sm">
            © {new Date().getFullYear()} {personal.name}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* CV Modal */}
      <CVModal isOpen={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/seo-proposal" element={<SEOProposal />} />
        <Route path="/case-study/:slug" element={<CaseStudyDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
