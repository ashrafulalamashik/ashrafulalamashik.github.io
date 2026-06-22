import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  Save, 
  GitBranch, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Settings,
  User,
  Cpu,
  Layers,
  Briefcase,
  Code,
  Globe,
  Award,
  Shield,
  BookOpen,
  GraduationCap,
  Upload,
  Chrome,
  Sliders,
  FileText
} from 'lucide-react';
import { blogConfig as initialBlogConfig } from '../config/blogConfig';
import type { BlogPost } from '../types/blog';

type TabType = 
  | 'general' 
  | 'siteIdentity'
  | 'hero' 
  | 'about' 
  | 'education'
  | 'experience' 
  | 'projects' 
  | 'services' 
  | 'caseStudies' 
  | 'certifications' 
  | 'skills' 
  | 'why' 
  | 'seo'
  | 'options'
  | 'blog';

export default function Admin() {
  // If production environment, strictly block and redirect to home page
  if (import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [expandedCaseStudy, setExpandedCaseStudy] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [publishResult, setPublishResult] = useState<{ commitHash?: string; pushOutput?: string; pushSucceeded?: boolean } | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string>('seo-proposal');

  // Blog management states
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogConfig);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // Blog editor form states
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postLang, setPostLang] = useState<'en' | 'bn'>('en');
  const [postDate, setPostDate] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postFeatured, setPostFeatured] = useState(false);
  const [postPublished, setPostPublished] = useState(false);

  // Clear messages after a timeout
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 7000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setCsrfToken(data.csrfToken);
      setIsAuthenticated(true);
      setSuccessMessage('Logged in successfully!');
      fetchConfig(data.csrfToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfig = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'GET',
        headers: {
          'X-CSRF-Token': token,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch site config');
      }

      const data = await res.json();
      if (!data.projects) data.projects = [];
      if (!data.education) data.education = [];
      if (!data.skillCategories) {
        data.skillCategories = [
          {
            title: "SEO",
            icon: "Target",
            items: ["Technical SEO", "On-page SEO", "Off-page SEO", "Keyword Research", "Schema Markup"]
          },
          {
            title: "WordPress & Web",
            icon: "Globe",
            items: ["WordPress", "PHP Customization", "HTML/CSS", "JavaScript", "Landing Page Design"]
          },
          {
            title: "Web & Software Dev",
            icon: "Code",
            items: [
              "Laravel (PHP), Next.js, React",
              "PostgreSQL, MySQL",
              "RESTful API Design",
              "Secure Auth & RBAC",
              "Git & GitHub Control",
              "n8n Workflow Automation",
              "AI Integration (VAPI.ai)"
            ]
          },
          {
            title: "Analytics",
            icon: "BarChart3",
            items: ["Google Analytics", "Google Search Console", "Ahrefs", "SEMrush", "Screaming Frog"]
          },
          {
            title: "Operations",
            icon: "Layers",
            items: ["n8n Automation", "Team Leadership", "Project Management", "Process Optimization"]
          }
        ];
      }
      if (!data.personal.socials) {
        data.personal.socials = [
          {
            platform: "WhatsApp",
            url: data.personal.whatsapp || "",
            icon: "MessageCircle"
          },
          {
            platform: "LinkedIn",
            url: data.personal.linkedin || "",
            icon: "Linkedin"
          }
        ];
      }
      if (!data.seoProposal) {
        data.seoProposal = { title: "SEO Proposal", subtitle: "Choose the plan that fits your business goals", plans: [], paymentTerms: [] };
      }
      if (!data.seoProposal.plans) data.seoProposal.plans = [];
      if (!data.seoProposal.paymentTerms) data.seoProposal.paymentTerms = [];
      if (!data.proposals) {
        data.proposals = [
          {
            id: 'seo-proposal',
            serviceTitle: 'SEO & WordPress Customization',
            title: data.seoProposal.title || 'SEO Proposal',
            subtitle: data.seoProposal.subtitle || 'Choose the plan that fits your business goals',
            plans: data.seoProposal.plans || [],
            paymentTerms: data.seoProposal.paymentTerms || []
          }
        ];
      }
      data.proposals = data.proposals.map((p: any) => ({
        ...p,
        plans: p.plans || [],
        paymentTerms: p.paymentTerms || []
      }));
      // Ensure personal.title is initialized with personal.role if missing
      if (data.personal && !data.personal.title && data.personal.role) {
        data.personal.title = data.personal.role;
      }
      setConfig(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !csrfToken) return;

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/admin/upload-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            filename: file.name,
            base64Data,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload file');
        }

        // Update config state with the uploaded file path
        if (fieldKey.startsWith('siteIdentity.')) {
          const subKey = fieldKey.split('.')[1];
          updateSiteIdentity(subKey, data.filePath);
        } else if (fieldKey.startsWith('about.')) {
          const subKey = fieldKey.split('.')[1];
          setConfig((prev: any) => ({
            ...prev,
            about: {
              ...prev.about,
              [subKey]: data.filePath
            }
          }));
        } else if (fieldKey.startsWith('caseStudies.')) {
          const parts = fieldKey.split('.');
          const idx = parseInt(parts[1], 10);
          const subKey = parts[2];
          const next = [...config.caseStudies];
          next[idx][subKey] = data.filePath;
          setConfig((p: any) => ({ ...p, caseStudies: next }));
        } else if (fieldKey.startsWith('certifications.')) {
          const parts = fieldKey.split('.');
          const idx = parseInt(parts[1], 10);
          const subKey = parts[2];
          const next = [...config.certifications];
          next[idx][subKey] = data.filePath;
          setConfig((p: any) => ({ ...p, certifications: next }));
        } else {
          updatePersonal(fieldKey, data.filePath);
        }
        setSuccessMessage(`File "${file.name}" uploaded successfully!`);
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsUploading(false);
        // Clear input value so same file can be selected again
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read file');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveDraft = async () => {
    if (!csrfToken || !config) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setPublishResult(null);

    try {
      // Sync title to role for backward compatibility with siteConfig
      if (config.personal) {
        config.personal.role = config.personal.title || '';
      }

      // Basic frontend checks before sending
      if (!config.personal?.name?.trim() || !config.personal?.title?.trim()) {
        throw new Error('Name and Title in General Info are required.');
      }

      const res = await fetch('/api/admin/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMessage('Draft saved successfully to siteConfig.ts!');
      setHasSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!csrfToken || !hasSaved) return;
    setIsPublishing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setPublishResult(null);

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Git commit & push operations failed');
      }

      if (data.pushSucceeded === false) {
        setErrorMessage(data.error || 'Commit succeeded locally, but push to GitHub failed. Please check/fix your git credentials and try again.');
        setPublishResult({
          commitHash: data.commitHash,
          pushOutput: data.error,
          pushSucceeded: false,
        });
      } else {
        setSuccessMessage(data.message || 'Successfully committed & pushed changes to GitHub!');
        setPublishResult({
          commitHash: data.commitHash,
          pushOutput: data.pushOutput,
          pushSucceeded: true,
        });
      }
      setHasSaved(false); // Reset save state after publish
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleChangePasscode = async () => {
    if (!newPasscode.trim() || newPasscode.length < 4) {
      setErrorMessage('Passcode must be at least 4 characters long.');
      return;
    }
    setIsChangingPasscode(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ newPasscode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change passcode');
      }
      setSuccessMessage(data.message || 'Passcode changed successfully!');
      setNewPasscode('');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsChangingPasscode(false);
    }
  };

  // Blog Handler Functions
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleTitleBlur = () => {
    if (!postSlug.trim() && postTitle.trim()) {
      setPostSlug(postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const handleOpenAddNewPost = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostSlug('');
    setPostLang('en');
    setPostDate(getTodayDateString());
    setPostTags('');
    setPostExcerpt('');
    setPostContent('');
    setPostFeatured(false);
    setPostPublished(false);
    setIsEditingPost(true);
  };

  const handleOpenEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostLang(post.lang);
    setPostDate(post.date);
    setPostTags(post.tags ? post.tags.join(', ') : '');
    setPostExcerpt(post.excerpt || '');
    setPostContent(post.content || '');
    setPostFeatured(post.featured || false);
    setPostPublished(post.published || false);
    setIsEditingPost(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      setErrorMessage('Post Title is required.');
      return;
    }

    let finalSlug = postSlug.trim();
    if (!finalSlug) {
      finalSlug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setErrorMessage('Slug must be lowercase letters, numbers, and hyphens only.');
      return;
    }

    const tagsArray = postTags.split(',').map(t => t.trim()).filter(Boolean);

    const newPost: BlogPost = {
      id: editingPostId || `post-${Date.now()}`,
      slug: finalSlug,
      title: postTitle.trim(),
      excerpt: postExcerpt.trim(),
      content: postContent,
      date: postDate || getTodayDateString(),
      lang: postLang,
      tags: tagsArray,
      featured: postFeatured,
      published: postPublished
    };

    let updatedPosts: BlogPost[];
    if (editingPostId) {
      if (posts.some(p => p.slug === finalSlug && p.id !== editingPostId)) {
        setErrorMessage('Another post already uses this slug.');
        return;
      }
      updatedPosts = posts.map(p => p.id === editingPostId ? newPost : p);
    } else {
      if (posts.some(p => p.slug === finalSlug)) {
        setErrorMessage('Another post already uses this slug.');
        return;
      }
      updatedPosts = [newPost, ...posts];
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/save-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ posts: updatedPosts })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save blog post.');
      }

      setPosts(updatedPosts);
      setIsEditingPost(false);
      setEditingPostId(null);
      setSuccessMessage('Blog draft saved successfully!');
      setHasSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    const updatedPosts = posts.filter(p => p.id !== id);

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/save-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ posts: updatedPosts })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete blog post.');
      }

      setPosts(updatedPosts);
      setSuccessMessage('Blog post deleted successfully!');
      setHasSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const updatedPosts = posts.map(p => p.id === post.id ? { ...p, published: !p.published } : p);

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/save-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ posts: updatedPosts })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update post status.');
      }

      setPosts(updatedPosts);
      setSuccessMessage(`Post "${post.title}" ${!post.published ? 'published' : 'unpublished'} successfully!`);
      setHasSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for state manipulation
  const updatePersonal = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const updateSiteIdentity = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      siteIdentity: {
        ...prev.siteIdentity,
        [field]: value
      }
    }));
  };

  const updateHeroList = (index: number, value: string) => {
    setConfig((prev: any) => {
      const nextTexts = [...prev.hero.typewriterTexts];
      nextTexts[index] = value;
      return {
        ...prev,
        hero: { ...prev.hero, typewriterTexts: nextTexts }
      };
    });
  };

  const addHeroText = () => {
    setConfig((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        typewriterTexts: [...prev.hero.typewriterTexts, '']
      }
    }));
  };

  const removeHeroText = (index: number) => {
    setConfig((prev: any) => {
      if (prev.hero.typewriterTexts.length <= 1) return prev;
      return {
        ...prev,
        hero: {
          ...prev.hero,
          typewriterTexts: prev.hero.typewriterTexts.filter((_: any, i: number) => i !== index)
        }
      };
    });
  };

  const updateHeroStat = (index: number, field: string, value: string) => {
    setConfig((prev: any) => {
      const nextStats = [...prev.hero.stats];
      nextStats[index] = { ...nextStats[index], [field]: value };
      return {
        ...prev,
        hero: { ...prev.hero, stats: nextStats }
      };
    });
  };

  const updateHeroMetadata = (index: number, value: string) => {
    setConfig((prev: any) => {
      const nextMeta = [...(prev.hero.metadata || [])];
      nextMeta[index] = value;
      return {
        ...prev,
        hero: { ...prev.hero, metadata: nextMeta }
      };
    });
  };

  const addHeroMetadata = () => {
    setConfig((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        metadata: [...(prev.hero.metadata || []), '']
      }
    }));
  };

  const removeHeroMetadata = (index: number) => {
    setConfig((prev: any) => {
      const nextMeta = [...(prev.hero.metadata || [])];
      const filtered = nextMeta.filter((_, i) => i !== index);
      return {
        ...prev,
        hero: {
          ...prev.hero,
          metadata: filtered
        }
      };
    });
  };

  const updateAboutParagraph = (index: number, value: string) => {
    setConfig((prev: any) => {
      const nextParas = [...prev.about.paragraphs];
      nextParas[index] = value;
      return {
        ...prev,
        about: { ...prev.about, paragraphs: nextParas }
      };
    });
  };

  const addAboutParagraph = () => {
    setConfig((prev: any) => ({
      ...prev,
      about: {
        ...prev.about,
        paragraphs: [...prev.about.paragraphs, '']
      }
    }));
  };

  const removeAboutParagraph = (index: number) => {
    setConfig((prev: any) => {
      if (prev.about.paragraphs.length <= 1) return prev;
      return {
        ...prev,
        about: {
          ...prev.about,
          paragraphs: prev.about.paragraphs.filter((_: any, i: number) => i !== index)
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[550px] h-[550px] rounded-full bg-gradient-to-r from-[#22C55E]/10 to-transparent blur-[120px] -top-24 -left-24" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-l from-[#22C55E]/5 to-transparent blur-[100px] bottom-0 right-1/4" />
      </div>

      {/* LOGIN SCREEN */}
      {!isAuthenticated ? (
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative z-10 shadow-2xl">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#22C55E] shadow-lg shadow-[#22C55E]/5">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Passcode</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              Please enter the secure DevSecOps admin passcode to unlock full CMS modes.
            </p>

            <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-4">
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-4 py-3.5 text-center tracking-widest text-lg outline-none transition-all placeholder:tracking-normal font-mono"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-[#22C55E]/10 hover:shadow-[#22C55E]/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Verifying passcode...
                  </>
                ) : (
                  <>
                    <Unlock size={18} /> Unlock Dashboard
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* MAIN CMS PANEL */
        <div className="w-full max-w-6xl bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md relative z-10 shadow-2xl flex flex-col md:flex-row gap-6 min-h-[80vh]">
          
          {/* LEFT SIDEBAR PANEL */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 pb-4 md:pb-0 md:pr-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 text-[#22C55E]">
                <Settings size={22} className="animate-spin-slow" style={{ animationDuration: '10s' }} />
                <div>
                  <h1 className="text-sm font-bold uppercase tracking-wider">DevSecOps CMS</h1>
                  <p className="text-[10px] text-zinc-500 font-mono">MD ASHRAFUL ALAM ASHIK</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0 font-medium text-xs sm:text-sm">
                <button 
                  onClick={() => setActiveTab('general')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'general' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <User size={16} /> General Info
                </button>
                <button 
                  onClick={() => setActiveTab('siteIdentity')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'siteIdentity' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Chrome size={16} /> Site Identity
                </button>
                <button 
                  onClick={() => setActiveTab('hero')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'hero' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Cpu size={16} /> Hero & Stats
                </button>
                <button 
                  onClick={() => setActiveTab('about')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'about' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Layers size={16} /> About Me
                </button>
                <button 
                  onClick={() => setActiveTab('experience')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'experience' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Briefcase size={16} /> Experience
                </button>
                <button 
                  onClick={() => setActiveTab('projects')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'projects' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Code size={16} /> Selected Projects
                </button>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'services' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Globe size={16} /> Services
                </button>
                <button 
                  onClick={() => setActiveTab('caseStudies')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'caseStudies' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Award size={16} /> Case Studies
                </button>
                <button 
                  onClick={() => setActiveTab('education')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'education' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <GraduationCap size={16} /> Education
                </button>
                <button 
                  onClick={() => setActiveTab('certifications')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'certifications' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Award size={16} /> Certifications
                </button>
                <button 
                  onClick={() => setActiveTab('skills')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'skills' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Cpu size={16} /> Skills & Tools
                </button>
                <button 
                  onClick={() => setActiveTab('why')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'why' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Shield size={16} /> Why Choose Me
                </button>
                <button 
                  onClick={() => setActiveTab('seo')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'seo' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <BookOpen size={16} /> Proposal & Nav
                </button>
                <button 
                  onClick={() => setActiveTab('options')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'options' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <Sliders size={16} /> Options / Settings
                </button>
                <button 
                  onClick={() => setActiveTab('blog')} 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all w-full text-left whitespace-nowrap ${activeTab === 'blog' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'}`}
                >
                  <FileText size={16} /> Blog Posts
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-zinc-800/80 hidden md:block">
              <Link to="/" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 text-xs transition-colors">
                <ArrowLeft size={14} /> Back to Website
              </Link>
            </div>
          </div>

          {/* RIGHT EDITING CONTENT PANEL */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[80vh] pr-1">
            <div className="space-y-6">
              
              {/* Header Alerts */}
              {successMessage && (
                <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl text-[#22C55E] flex items-start gap-2.5 text-xs sm:text-sm animate-fade-in">
                  <CheckCircle className="flex-shrink-0 mt-0.5" size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-2.5 text-xs sm:text-sm animate-fade-in">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!config && !errorMessage ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                  <Loader2 className="animate-spin text-[#22C55E]" size={36} />
                  <span className="text-sm font-medium">Loading portfolio config values...</span>
                </div>
              ) : !config && errorMessage ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-550 gap-3">
                  <AlertCircle className="text-red-500 animate-pulse" size={40} />
                  <span className="text-sm font-medium text-red-400">Failed to load configuration.</span>
                  <p className="text-xs text-zinc-500 text-center max-w-xs">{errorMessage}</p>
                  <button 
                    type="button"
                    onClick={() => csrfToken && fetchConfig(csrfToken)} 
                    className="mt-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all active:scale-95"
                  >
                    Retry Load Configuration
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* TAB CONTENT: GENERAL INFO */}
                  {activeTab === 'general' && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">General Profile Info</h2>
                        <p className="text-xs text-zinc-400">Core personal metadata fields used throughout headers and footers.</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Full Name</label>
                          <input 
                            type="text" 
                            value={config.personal.name} 
                            onChange={(e) => updatePersonal('name', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Short Name</label>
                          <input 
                            type="text" 
                            value={config.personal.shortName} 
                            onChange={(e) => updatePersonal('shortName', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Initials</label>
                          <input 
                            type="text" 
                            value={config.personal.initials} 
                            onChange={(e) => updatePersonal('initials', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Professional Title</label>
                          <input 
                            type="text" 
                            value={config.personal.title} 
                            onChange={(e) => updatePersonal('title', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Tagline</label>
                          <input 
                            type="text" 
                            value={config.personal.tagline} 
                            onChange={(e) => updatePersonal('tagline', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Location</label>
                          <input 
                            type="text" 
                            value={config.personal.location} 
                            onChange={(e) => updatePersonal('location', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Phone</label>
                          <input 
                            type="text" 
                            value={config.personal.phone} 
                            onChange={(e) => updatePersonal('phone', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Email</label>
                          <input 
                            type="text" 
                            value={config.personal.email} 
                            onChange={(e) => updatePersonal('email', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">WhatsApp Link</label>
                          <input 
                            type="text" 
                            value={config.personal.whatsapp} 
                            onChange={(e) => updatePersonal('whatsapp', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">LinkedIn URL</label>
                          <input 
                            type="text" 
                            value={config.personal.linkedin} 
                            onChange={(e) => updatePersonal('linkedin', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Experience (Years)</label>
                          <input 
                            type="text" 
                            value={config.personal.experience} 
                            onChange={(e) => updatePersonal('experience', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">CV Path</label>
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              value={config.personal.cvPath} 
                              onChange={(e) => updatePersonal('cvPath', e.target.value)} 
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                            />
                            <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
                              {isUploading ? "Uploading..." : "Upload CV File"}
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(e, 'cvPath')} 
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Profile Image Path</label>
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              value={config.personal.profileImgPath || ''} 
                              onChange={(e) => updatePersonal('profileImgPath', e.target.value)} 
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                            />
                            <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
                              {isUploading ? "Uploading..." : "Upload Avatar"}
                              <input 
                                type="file" 
                                accept=".png,.jpg,.jpeg,.svg,.webp"
                                onChange={(e) => handleFileUpload(e, 'profileImgPath')} 
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Social Links Editor */}
                      <div className="mt-6 border-t border-zinc-800 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Footer Social Links</h3>
                            <p className="text-xs text-zinc-400">Add, remove, or customize links displayed in the website footer.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newSocial = { platform: '', url: '', icon: 'Globe' };
                              setConfig((p: any) => ({
                                ...p,
                                personal: {
                                  ...p.personal,
                                  socials: [...(p.personal.socials || []), newSocial]
                                }
                              }));
                            }}
                            className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                          >
                            <Plus size={14} /> Add Social Link
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(config.personal.socials || []).map((soc: any, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">Platform Name</label>
                                  <input 
                                    type="text" 
                                    value={soc.platform} 
                                    placeholder="e.g. GitHub"
                                    onChange={(e) => {
                                      const next = [...config.personal.socials];
                                      next[idx].platform = e.target.value;
                                      setConfig((p: any) => ({
                                        ...p,
                                        personal: { ...p.personal, socials: next }
                                      }));
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">URL</label>
                                  <input 
                                    type="text" 
                                    value={soc.url} 
                                    placeholder="https://..."
                                    onChange={(e) => {
                                      const next = [...config.personal.socials];
                                      next[idx].url = e.target.value;
                                      setConfig((p: any) => ({
                                        ...p,
                                        personal: { ...p.personal, socials: next }
                                      }));
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">Icon</label>
                                  <select 
                                    value={soc.icon || 'Globe'} 
                                    onChange={(e) => {
                                      const next = [...config.personal.socials];
                                      next[idx].icon = e.target.value;
                                      setConfig((p: any) => ({
                                        ...p,
                                        personal: { ...p.personal, socials: next }
                                      }));
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-[#22C55E] transition-colors"
                                  >
                                    <option value="MessageCircle">💬 WhatsApp</option>
                                    <option value="Linkedin">🔗 LinkedIn</option>
                                    <option value="Github">🐙 GitHub</option>
                                    <option value="Facebook">📘 Facebook</option>
                                    <option value="Twitter">🐦 Twitter / X</option>
                                    <option value="Send">✈️ Telegram</option>
                                    <option value="Youtube">🎬 YouTube</option>
                                    <option value="Instagram">📷 Instagram</option>
                                    <option value="Globe">🌐 Website / Other</option>
                                  </select>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    personal: {
                                      ...p.personal,
                                      socials: p.personal.socials.filter((_: any, i: number) => i !== idx)
                                    }
                                  }));
                                }}
                                className="text-red-500 hover:text-red-400 mt-2 sm:mt-0 p-1 cursor-pointer self-end sm:self-center"
                                title="Remove link"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: SITE IDENTITY */}
                  {activeTab === 'siteIdentity' && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <h2 className="text-lg font-bold text-white">Site Identity & Branding</h2>
                        <p className="text-xs text-zinc-400">Configure search engine meta tags, site favicon, and choose between custom image or text logo.</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Site Title (Browser Tab Title)</label>
                          <input 
                            type="text" 
                            value={config.siteIdentity?.title || ''} 
                            onChange={(e) => updateSiteIdentity('title', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Site Meta Description</label>
                          <textarea 
                            rows={3}
                            value={config.siteIdentity?.description || ''} 
                            onChange={(e) => updateSiteIdentity('description', e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white resize-y font-normal"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase font-bold tracking-wider">Logo Display Type</label>
                          <div className="flex gap-6 mt-1">
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                              <input 
                                type="radio" 
                                name="logoType" 
                                value="text" 
                                checked={(config.siteIdentity?.logoType || 'text') === 'text'} 
                                onChange={() => updateSiteIdentity('logoType', 'text')} 
                                className="accent-[#22C55E] h-4 w-4"
                              />
                              Text Logo (Initials)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                              <input 
                                type="radio" 
                                name="logoType" 
                                value="image" 
                                checked={config.siteIdentity?.logoType === 'image'} 
                                onChange={() => updateSiteIdentity('logoType', 'image')} 
                                className="accent-[#22C55E] h-4 w-4"
                              />
                              Image Logo (Custom Upload)
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Site Favicon Path</label>
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              value={config.siteIdentity?.faviconPath || ''} 
                              onChange={(e) => updateSiteIdentity('faviconPath', e.target.value)} 
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                            />
                            <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
                              {isUploading ? "Uploading..." : "Upload Favicon"}
                              <input 
                                type="file" 
                                accept=".ico,.png,.svg,.webp"
                                onChange={(e) => handleFileUpload(e, 'siteIdentity.faviconPath')} 
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          {config.siteIdentity?.faviconPath && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500 uppercase">Favicon Preview:</span>
                              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={config.siteIdentity.faviconPath.startsWith('http') || config.siteIdentity.faviconPath.startsWith('data:')
                                    ? config.siteIdentity.faviconPath
                                    : `${config.siteIdentity.faviconPath.startsWith('/') ? '' : '/'}${config.siteIdentity.faviconPath}?v=${Date.now()}`
                                  } 
                                  alt="Favicon Preview" 
                                  className="w-full h-full object-cover rounded-full" 
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">Logo Image Path</label>
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              value={config.siteIdentity?.logoImgPath || ''} 
                              onChange={(e) => updateSiteIdentity('logoImgPath', e.target.value)} 
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                            />
                            <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
                              {isUploading ? "Uploading..." : "Upload Logo"}
                              <input 
                                type="file" 
                                accept=".png,.jpg,.jpeg,.svg,.webp"
                                onChange={(e) => handleFileUpload(e, 'siteIdentity.logoImgPath')} 
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          {config.siteIdentity?.logoImgPath && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500 uppercase">Logo Preview:</span>
                              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={config.siteIdentity.logoImgPath.startsWith('http') || config.siteIdentity.logoImgPath.startsWith('data:')
                                    ? config.siteIdentity.logoImgPath
                                    : `${config.siteIdentity.logoImgPath.startsWith('/') ? '' : '/'}${config.siteIdentity.logoImgPath}?v=${Date.now()}`
                                  } 
                                  alt="Logo Preview" 
                                  className="w-full h-full object-cover rounded-full" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: HERO & STATS */}
                  {activeTab === 'hero' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold">Typewriter Sentences</h2>
                            <p className="text-xs text-zinc-400">Rotating typewriter texts shown in the hero badge.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={addHeroText} 
                            className="text-[#22C55E] hover:text-[#16A34A] flex items-center gap-1 text-xs font-semibold"
                          >
                            <Plus size={14} /> Add Line
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {config.hero.typewriterTexts.map((txt: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <span className="text-xs font-mono text-zinc-650 w-5">{idx + 1}.</span>
                              <input 
                                type="text" 
                                value={txt} 
                                onChange={(e) => updateHeroList(idx, e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeHeroText(idx)} 
                                className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-800 hover:border-red-500/20 rounded-xl"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                        <div>
                          <h2 className="text-lg font-bold">Hero Stats Cards</h2>
                          <p className="text-xs text-zinc-400">Four numeric stats displayed in the hero grid.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {config.hero.stats.map((stat: any, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
                              <span className="text-xs font-mono text-zinc-600">Card #{idx + 1}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  value={stat.value} 
                                  placeholder="Value (e.g. 50+)"
                                  onChange={(e) => updateHeroStat(idx, 'value', e.target.value)}
                                  className="bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-xs outline-none text-white"
                                />
                                <input 
                                  type="text" 
                                  value={stat.label} 
                                  placeholder="Label (e.g. Projects)"
                                  onChange={(e) => updateHeroStat(idx, 'label', e.target.value)}
                                  className="bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-xs outline-none text-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold">Hero Info Metadata Badges</h2>
                            <p className="text-xs text-zinc-400">Metadata badges displayed below CTA buttons in the hero section (e.g. location, experience).</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={addHeroMetadata} 
                            className="text-[#22C55E] hover:text-[#16A34A] flex items-center gap-1 text-xs font-semibold"
                          >
                            <Plus size={14} /> Add Badge
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {(config.hero.metadata || []).map((meta: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <span className="text-xs font-mono text-zinc-650 w-5">{idx + 1}.</span>
                              <input 
                                type="text" 
                                value={meta} 
                                onChange={(e) => updateHeroMetadata(idx, e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeHeroMetadata(idx)} 
                                className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-800 hover:border-red-500/20 rounded-xl"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: ABOUT ME */}
                  {activeTab === 'about' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold">About Paragraphs</h2>
                            <p className="text-xs text-zinc-400">Add or rewrite summary paragraphs in the About section.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={addAboutParagraph} 
                            className="text-[#22C55E] hover:text-[#16A34A] flex items-center gap-1 text-xs font-semibold"
                          >
                            <Plus size={14} /> Add Paragraph
                          </button>
                        </div>

                        <div className="space-y-3">
                          {config.about.paragraphs.map((para: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <span className="text-xs font-mono text-zinc-650 w-5 mt-2">{idx + 1}.</span>
                              <textarea 
                                value={para} 
                                rows={3}
                                onChange={(e) => updateAboutParagraph(idx, e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all resize-y"
                              />
                              <button 
                                type="button" 
                                onClick={() => removeAboutParagraph(idx)} 
                                className="p-2 mt-1 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-800 hover:border-red-500/20 rounded-xl"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                        <div>
                          <h2 className="text-lg font-bold">About Section Image</h2>
                          <p className="text-xs text-zinc-400">Customize the photo shown alongside your bio in the About Me section. If left blank, it falls back to your main avatar.</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400 font-semibold uppercase">About Image Path</label>
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              value={config.about.aboutImgPath || ''} 
                              onChange={(e) => {
                                setConfig((p: any) => ({ ...p, about: { ...p.about, aboutImgPath: e.target.value } }));
                              }} 
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                            />
                            <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
                              {isUploading ? "Uploading..." : "Upload Image"}
                              <input 
                                type="file" 
                                accept=".png,.jpg,.jpeg,.svg,.webp"
                                onChange={(e) => handleFileUpload(e, 'about.aboutImgPath')} 
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                        <div>
                          <h2 className="text-lg font-bold">About Quick Stats</h2>
                          <p className="text-xs text-zinc-400">Secondary quick-stats cards displayed in the About section.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {config.about.quickStats.map((stat: any, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
                              <span className="text-xs font-mono text-zinc-650">Card #{idx + 1}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  value={stat.value} 
                                  placeholder="Value (e.g. 200+)"
                                  onChange={(e) => {
                                    const nextStats = [...config.about.quickStats];
                                    nextStats[idx].value = e.target.value;
                                    setConfig((p: any) => ({ ...p, about: { ...p.about, quickStats: nextStats } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-xs outline-none text-white"
                                />
                                <input 
                                  type="text" 
                                  value={stat.label} 
                                  placeholder="Label (e.g. Managed)"
                                  onChange={(e) => {
                                    const nextStats = [...config.about.quickStats];
                                    nextStats[idx].label = e.target.value;
                                    setConfig((p: any) => ({ ...p, about: { ...p.about, quickStats: nextStats } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-xs outline-none text-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: EXPERIENCE */}
                  {activeTab === 'experience' && (
                    <div className="space-y-6">
                      
                      {/* Current Role */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-bold">Current Active Position</h2>
                          <p className="text-xs text-zinc-400">Edit details and description bullets for your primary current role.</p>
                        </div>

                        <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-500 font-semibold">Job Title</label>
                              <input 
                                type="text" 
                                value={config.experience.current.title} 
                                onChange={(e) => {
                                  const title = e.target.value;
                                  setConfig((p: any) => ({ ...p, experience: { ...p.experience, current: { ...p.experience.current, title } } }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-500 font-semibold">Company Name</label>
                              <input 
                                type="text" 
                                value={config.experience.current.company} 
                                onChange={(e) => {
                                  const company = e.target.value;
                                  setConfig((p: any) => ({ ...p, experience: { ...p.experience, current: { ...p.experience.current, company } } }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-500 font-semibold">Work Period</label>
                              <input 
                                type="text" 
                                value={config.experience.current.period} 
                                onChange={(e) => {
                                  const period = e.target.value;
                                  setConfig((p: any) => ({ ...p, experience: { ...p.experience, current: { ...p.experience.current, period } } }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-500 font-semibold">Location</label>
                              <input 
                                type="text" 
                                value={config.experience.current.location} 
                                onChange={(e) => {
                                  const location = e.target.value;
                                  setConfig((p: any) => ({ ...p, experience: { ...p.experience, current: { ...p.experience.current, location } } }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-zinc-500 font-semibold">Description Bullets</label>
                              <button 
                                type="button"
                                onClick={() => {
                                  setConfig((p: any) => {
                                    const nextDesc = [...p.experience.current.description, ''];
                                    return { ...p, experience: { ...p.experience, current: { ...p.experience.current, description: nextDesc } } };
                                  });
                                }}
                                className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                              >
                                <Plus size={12} /> Add Bullet
                              </button>
                            </div>
                            <div className="space-y-2">
                              {config.experience.current.description.map((desc: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <span className="text-[10px] font-mono text-zinc-650">{idx + 1}.</span>
                                  <input 
                                    type="text" 
                                    value={desc} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setConfig((p: any) => {
                                        const nextDesc = [...p.experience.current.description];
                                        nextDesc[idx] = val;
                                        return { ...p, experience: { ...p.experience, current: { ...p.experience.current, description: nextDesc } } };
                                      });
                                    }}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-xs outline-none text-white"
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setConfig((p: any) => {
                                        const nextDesc = p.experience.current.description.filter((_: any, i: number) => i !== idx);
                                        return { ...p, experience: { ...p.experience, current: { ...p.experience.current, description: nextDesc } } };
                                      });
                                    }}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 rounded"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Previous Jobs Timeline */}
                      <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold">Previous Careers Timeline</h2>
                            <p className="text-xs text-zinc-400">Manage, rearrange, or add previous jobs shown in your timeline.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const newItem = { title: '', company: '', period: '', location: '', description: [''] };
                              setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: [newItem, ...p.experience.previous] } }));
                            }}
                            className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                          >
                            <Plus size={14} /> Add Career Node
                          </button>
                        </div>

                        <div className="space-y-4">
                          {config.experience.previous.map((job: any, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                <span className="text-xs font-mono text-[#22C55E]">Career Node #{idx + 1}</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => ({
                                      ...p,
                                      experience: { ...p.experience, previous: p.experience.previous.filter((_: any, i: number) => i !== idx) }
                                    }));
                                  }}
                                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Remove Node
                                </button>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5">
                                <input 
                                  type="text" 
                                  value={job.title} 
                                  placeholder="Role Title"
                                  onChange={(e) => {
                                    const next = [...config.experience.previous];
                                    next[idx].title = e.target.value;
                                    setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: next } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                                />
                                <input 
                                  type="text" 
                                  value={job.company} 
                                  placeholder="Company"
                                  onChange={(e) => {
                                    const next = [...config.experience.previous];
                                    next[idx].company = e.target.value;
                                    setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: next } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                                />
                                <input 
                                  type="text" 
                                  value={job.period} 
                                  placeholder="Period"
                                  onChange={(e) => {
                                    const next = [...config.experience.previous];
                                    next[idx].period = e.target.value;
                                    setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: next } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                                />
                                <input 
                                  type="text" 
                                  value={job.location} 
                                  placeholder="Location"
                                  onChange={(e) => {
                                    const next = [...config.experience.previous];
                                    next[idx].location = e.target.value;
                                    setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: next } }));
                                  }}
                                  className="bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Bullet Points</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setConfig((p: any) => {
                                        const next = [...p.experience.previous];
                                        next[idx].description.push('');
                                        return { ...p, experience: { ...p.experience, previous: next } };
                                      });
                                    }}
                                    className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                  >
                                    <Plus size={10} /> Add Bullet
                                  </button>
                                </div>
                                <div className="space-y-1.5">
                                  {job.description.map((desc: string, bulletIdx: number) => (
                                    <div key={bulletIdx} className="flex gap-2 items-center">
                                      <input 
                                        type="text" 
                                        value={desc} 
                                        placeholder="Describe your achievement..."
                                        onChange={(e) => {
                                          const next = [...config.experience.previous];
                                          next[idx].description[bulletIdx] = e.target.value;
                                          setConfig((p: any) => ({ ...p, experience: { ...p.experience, previous: next } }));
                                        }}
                                        className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-[11px] text-zinc-300"
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setConfig((p: any) => {
                                            const next = [...p.experience.previous];
                                            next[idx].description = next[idx].description.filter((_: any, i: number) => i !== bulletIdx);
                                            return { ...p, experience: { ...p.experience, previous: next } };
                                          });
                                        }}
                                        className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-850 rounded"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: SELECTED PROJECTS */}
                  {activeTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Selected Projects</h2>
                          <p className="text-xs text-zinc-400">Add, remove, or modify items in your main Web & Software project list.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { title: '', description: '', tags: [] };
                            setConfig((p: any) => ({ ...p, projects: [newItem, ...(p.projects || [])] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Project Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(config.projects || []).map((proj: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Project Card #{idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    projects: p.projects.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove Project
                              </button>
                            </div>

                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={proj.title} 
                                placeholder="Project Title"
                                onChange={(e) => {
                                  const next = [...config.projects];
                                  next[idx].title = e.target.value;
                                  setConfig((p: any) => ({ ...p, projects: next }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <textarea 
                                value={proj.description} 
                                placeholder="Description"
                                rows={2}
                                onChange={(e) => {
                                  const next = [...config.projects];
                                  next[idx].description = e.target.value;
                                  setConfig((p: any) => ({ ...p, projects: next }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Tags / Stack</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => {
                                      const next = [...p.projects];
                                      next[idx].tags.push('');
                                      return { ...p, projects: next };
                                    });
                                  }}
                                  className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                >
                                  <Plus size={10} /> Add Tag
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {proj.tags.map((tag: string, tagIdx: number) => (
                                  <div key={tagIdx} className="flex gap-1 items-center bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                                    <input 
                                      type="text" 
                                      value={tag} 
                                      placeholder="Tag"
                                      onChange={(e) => {
                                        const next = [...config.projects];
                                        next[idx].tags[tagIdx] = e.target.value;
                                        setConfig((p: any) => ({ ...p, projects: next }));
                                      }}
                                      className="bg-transparent text-[10px] outline-none text-zinc-300 w-16"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.projects];
                                          next[idx].tags = next[idx].tags.filter((_: any, i: number) => i !== tagIdx);
                                          return { ...p, projects: next };
                                        });
                                      }}
                                      className="text-zinc-500 hover:text-red-400 text-[10px]"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: SERVICES */}
                  {activeTab === 'services' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Services</h2>
                          <p className="text-xs text-zinc-400">Offerings shown on the homepage with custom lucide icons.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { title: '', description: '', icon: 'Globe', tags: [], price: '', pricingDetails: '', showPricing: false };
                            setConfig((p: any) => ({ ...p, services: [newItem, ...p.services] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Service Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {config.services.map((serv: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Service Card #{idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    services: p.services.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove Card
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-2.5">
                              <div className="sm:col-span-2 space-y-1">
                                <input 
                                  type="text" 
                                  value={serv.title} 
                                  placeholder="Service Title"
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].title = e.target.value;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <input 
                                  type="text" 
                                  value={serv.icon} 
                                  placeholder="Icon (e.g. Globe, Zap, Settings)"
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].icon = e.target.value;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <textarea 
                                  value={serv.description} 
                                  placeholder="Description details..."
                                  rows={2}
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].description = e.target.value;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <input 
                                  type="text" 
                                  value={serv.price || ''} 
                                  placeholder="Price (e.g. $120 / Month)"
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].price = e.target.value;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <textarea 
                                  value={serv.pricingDetails || ''} 
                                  placeholder="Detailed deliverables/pricing packages (one per line)..."
                                  rows={2}
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].pricingDetails = e.target.value;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                                />
                              </div>
                              <div className="sm:col-span-3 flex items-center gap-2 mt-1">
                                <input 
                                  type="checkbox" 
                                  id={`showPricing-${idx}`}
                                  checked={!!serv.showPricing} 
                                  onChange={(e) => {
                                    const next = [...config.services];
                                    next[idx].showPricing = e.target.checked;
                                    setConfig((p: any) => ({ ...p, services: next }));
                                  }}
                                  className="accent-[#22C55E] h-4 w-4 rounded"
                                />
                                <label htmlFor={`showPricing-${idx}`} className="text-xs text-zinc-300 select-none cursor-pointer">
                                  Enable "View Pricing & Details" modal popup for this service
                                </label>
                              </div>
                              {serv.showPricing && (
                                <div className="sm:col-span-3 space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">Linked Proposal Template</label>
                                  {(config.proposals || []).length === 0 ? (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                      <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                                      <span className="text-xs text-amber-300">No proposals created yet. Go to the <strong>Proposal &amp; Nav</strong> tab to create one first.</span>
                                    </div>
                                  ) : (
                                    <select
                                      value={serv.proposalId || ''}
                                      onChange={(e) => {
                                        const next = [...config.services];
                                        next[idx].proposalId = e.target.value;
                                        setConfig((p: any) => ({ ...p, services: next }));
                                      }}
                                      className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white cursor-pointer outline-none focus:border-[#22C55E] transition-colors"
                                    >
                                      <option value="">Auto-select by Service Title / Fallback</option>
                                      <option value="none">🚫 None — No pricing popup</option>
                                      {(config.proposals || []).map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Tags</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => {
                                      const next = [...p.services];
                                      next[idx].tags.push('');
                                      return { ...p, services: next };
                                    });
                                  }}
                                  className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                >
                                  <Plus size={10} /> Add Tag
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {serv.tags.map((tag: string, tagIdx: number) => (
                                  <div key={tagIdx} className="flex gap-1 items-center bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                                    <input 
                                      type="text" 
                                      value={tag} 
                                      placeholder="Tag"
                                      onChange={(e) => {
                                        const next = [...config.services];
                                        next[idx].tags[tagIdx] = e.target.value;
                                        setConfig((p: any) => ({ ...p, services: next }));
                                      }}
                                      className="bg-transparent text-[10px] outline-none text-zinc-300 w-16"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.services];
                                          next[idx].tags = next[idx].tags.filter((_: any, i: number) => i !== tagIdx);
                                          return { ...p, services: next };
                                        });
                                      }}
                                      className="text-zinc-500 hover:text-red-400 text-[10px]"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: CASE STUDIES */}
                  {activeTab === 'caseStudies' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Case Studies</h2>
                          <p className="text-xs text-zinc-400">High-fidelity case studies showing problem, solution, and results.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { slug: '', category: '', title: '', problem: '', solution: '', results: [], featured: false };
                            setConfig((p: any) => ({ ...p, caseStudies: [...p.caseStudies, newItem] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Case Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {config.caseStudies.map((study: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Case Study #{idx + 1}</span>
                              <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={study.featured || false} 
                                    onChange={(e) => {
                                      const next = [...config.caseStudies];
                                      next[idx].featured = e.target.checked;
                                      setConfig((p: any) => ({ ...p, caseStudies: next }));
                                    }}
                                    className="rounded border-zinc-805 bg-zinc-900 accent-[#22C55E]"
                                  /> Featured Layout
                                </label>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => ({
                                      ...p,
                                      caseStudies: p.caseStudies.filter((_: any, i: number) => i !== idx)
                                    }));
                                  }}
                                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-2.5">
                              <input 
                                type="text" 
                                value={study.title} 
                                placeholder="Study Title"
                                onChange={(e) => {
                                  const next = [...config.caseStudies];
                                  next[idx].title = e.target.value;
                                  setConfig((p: any) => ({ ...p, caseStudies: next }));
                                }}
                                className="sm:col-span-2 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={study.slug} 
                                placeholder="Slug (e.g. future-shop)"
                                onChange={(e) => {
                                  const next = [...config.caseStudies];
                                  next[idx].slug = e.target.value;
                                  setConfig((p: any) => ({ ...p, caseStudies: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={study.category} 
                                placeholder="Category (e.g. E-COMMERCE)"
                                onChange={(e) => {
                                  const next = [...config.caseStudies];
                                  next[idx].category = e.target.value;
                                  setConfig((p: any) => ({ ...p, caseStudies: next }));
                                }}
                                className="sm:col-span-3 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <div className="sm:col-span-3 flex gap-2.5 items-center">
                                <input 
                                  type="text" 
                                  value={study.image || ''} 
                                  placeholder="Project Image Path (e.g. /future-shop.png)"
                                  onChange={(e) => {
                                    const next = [...config.caseStudies];
                                    next[idx].image = e.target.value;
                                    setConfig((p: any) => ({ ...p, caseStudies: next }));
                                  }}
                                  className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                />
                                <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded px-3 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                                  <Upload size={12} className={isUploading ? "animate-bounce" : ""} />
                                  {isUploading ? "..." : "Upload Project Image"}
                                  <input 
                                    type="file" 
                                    accept=".png,.jpg,.jpeg,.svg,.webp"
                                    onChange={(e) => handleFileUpload(e, `caseStudies.${idx}.image`)} 
                                    className="hidden"
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                              <textarea 
                                value={study.problem} 
                                placeholder="Problem statement..."
                                rows={2}
                                onChange={(e) => {
                                  const next = [...config.caseStudies];
                                  next[idx].problem = e.target.value;
                                  setConfig((p: any) => ({ ...p, caseStudies: next }));
                                }}
                                className="sm:col-span-3 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                              />
                              <textarea 
                                value={study.solution} 
                                placeholder="Solution implemented..."
                                rows={2}
                                onChange={(e) => {
                                  const next = [...config.caseStudies];
                                  next[idx].solution = e.target.value;
                                  setConfig((p: any) => ({ ...p, caseStudies: next }));
                                }}
                                className="sm:col-span-3 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Results Bullets</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => {
                                      const next = [...p.caseStudies];
                                      next[idx].results.push('');
                                      return { ...p, caseStudies: next };
                                    });
                                  }}
                                  className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                >
                                  <Plus size={10} /> Add Result
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {study.results.map((res: string, resIdx: number) => (
                                  <div key={resIdx} className="flex gap-2 items-center">
                                    <input 
                                      type="text" 
                                      value={res} 
                                      placeholder="Metric outcome achieved"
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        next[idx].results[resIdx] = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-[11px] text-zinc-300"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.caseStudies];
                                          next[idx].results = next[idx].results.filter((_: any, i: number) => i !== resIdx);
                                          return { ...p, caseStudies: next };
                                        });
                                      }}
                                      className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-850 rounded"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Toggle Collapsible Details Editor */}
                            <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setExpandedCaseStudy(expandedCaseStudy === idx ? null : idx)}
                                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-[#22C55E]/40 hover:text-[#22C55E] text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                              >
                                {expandedCaseStudy === idx ? "Hide Detailed Page Content" : "Edit Detailed Page Content"}
                              </button>
                              <span className="text-[10px] text-zinc-500 italic font-mono">
                                Detailed pages require: Subtitle, Stack, Summary, Challenge, Objectives, Features, Architecture & Outcomes
                              </span>
                            </div>

                            {expandedCaseStudy === idx && (
                              <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl mt-4 space-y-4 animate-fade-in text-left">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E] border-b border-zinc-900 pb-2">Detailed Page Headers & Meta</h4>
                                <div className="grid sm:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Subtitle</label>
                                    <input 
                                      type="text" 
                                      value={study.subtitle || ''} 
                                      placeholder="A high-performance marketplace..."
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        next[idx].subtitle = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Role</label>
                                    <input 
                                      type="text" 
                                      value={study.role || ''} 
                                      placeholder="Lead Full-Stack Developer"
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        next[idx].role = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Status</label>
                                    <input 
                                      type="text" 
                                      value={study.status || ''} 
                                      placeholder="Completed / In Progress"
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        next[idx].status = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Backend Progress %</label>
                                    <input 
                                      type="number" 
                                      value={study.completionProgress?.backend ?? 100} 
                                      min={0} max={100}
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        if (!next[idx].completionProgress) next[idx].completionProgress = { backend: 100, frontend: 100 };
                                        next[idx].completionProgress.backend = parseInt(e.target.value) || 0;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Frontend Progress %</label>
                                    <input 
                                      type="number" 
                                      value={study.completionProgress?.frontend ?? 100} 
                                      min={0} max={100}
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        if (!next[idx].completionProgress) next[idx].completionProgress = { backend: 100, frontend: 100 };
                                        next[idx].completionProgress.frontend = parseInt(e.target.value) || 0;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-zinc-900 mt-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Project Summary & Context</h4>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Detailed Project Summary (Markdown allowed)</label>
                                    <textarea 
                                      value={study.summary || ''} 
                                      placeholder="A full description detailing the scale and purpose of the project..."
                                      rows={3}
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        next[idx].summary = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Challenge Description</label>
                                    <textarea 
                                      value={study.challenge?.description || ''} 
                                      placeholder="What architectural issues or requirements made this project challenging?"
                                      rows={2}
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        if (!next[idx].challenge) next[idx].challenge = { description: '', objectives: [] };
                                        next[idx].challenge.description = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-900 mt-2">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Engineering Objectives</h4>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.caseStudies];
                                          if (!next[idx].challenge) next[idx].challenge = { description: '', objectives: [] };
                                          if (!next[idx].challenge.objectives) next[idx].challenge.objectives = [];
                                          next[idx].challenge.objectives.push('');
                                          return { ...p, caseStudies: next };
                                        });
                                      }}
                                      className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                    >
                                      <Plus size={10} /> Add Objective
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(study.challenge?.objectives || []).map((obj: string, objIdx: number) => (
                                      <div key={objIdx} className="flex gap-2 items-center">
                                        <input 
                                          type="text" 
                                          value={obj} 
                                          placeholder="e.g. Build a secure RESTful API layer"
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].challenge.objectives[objIdx] = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-300"
                                        />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            setConfig((p: any) => {
                                              const next = [...p.caseStudies];
                                              next[idx].challenge.objectives = next[idx].challenge.objectives.filter((_: any, i: number) => i !== objIdx);
                                              return { ...p, caseStudies: next };
                                            });
                                          }}
                                          className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-850 rounded"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-zinc-900 mt-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Technology Stack</h4>
                                  
                                  {/* Frontend Stack */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-zinc-400 font-semibold uppercase">Frontend Stack Tags</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setConfig((p: any) => {
                                            const next = [...p.caseStudies];
                                            if (!next[idx].techStack) next[idx].techStack = { frontend: [], backend: [], infrastructure: [] };
                                            if (!next[idx].techStack.frontend) next[idx].techStack.frontend = [];
                                            next[idx].techStack.frontend.push('');
                                            return { ...p, caseStudies: next };
                                          });
                                        }}
                                        className="text-[9px] text-[#22C55E] flex items-center gap-0.5"
                                      >
                                        <Plus size={8} /> Add Tag
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(study.techStack?.frontend || []).map((tag: string, tagIdx: number) => (
                                        <div key={tagIdx} className="flex gap-1 items-center bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                                          <input 
                                            type="text" 
                                            value={tag} 
                                            placeholder="Next.js"
                                            onChange={(e) => {
                                              const next = [...config.caseStudies];
                                              next[idx].techStack.frontend[tagIdx] = e.target.value;
                                              setConfig((p: any) => ({ ...p, caseStudies: next }));
                                            }}
                                            className="bg-transparent text-[10px] outline-none text-zinc-300 w-16"
                                          />
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setConfig((p: any) => {
                                                const next = [...p.caseStudies];
                                                next[idx].techStack.frontend = next[idx].techStack.frontend.filter((_: any, i: number) => i !== tagIdx);
                                                return { ...p, caseStudies: next };
                                              });
                                            }}
                                            className="text-zinc-500 hover:text-red-400 text-[10px]"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Backend Stack */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-zinc-400 font-semibold uppercase">Backend & DB Tags</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setConfig((p: any) => {
                                            const next = [...p.caseStudies];
                                            if (!next[idx].techStack) next[idx].techStack = { frontend: [], backend: [], infrastructure: [] };
                                            if (!next[idx].techStack.backend) next[idx].techStack.backend = [];
                                            next[idx].techStack.backend.push('');
                                            return { ...p, caseStudies: next };
                                          });
                                        }}
                                        className="text-[9px] text-[#22C55E] flex items-center gap-0.5"
                                      >
                                        <Plus size={8} /> Add Tag
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(study.techStack?.backend || []).map((tag: string, tagIdx: number) => (
                                        <div key={tagIdx} className="flex gap-1 items-center bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                                          <input 
                                            type="text" 
                                            value={tag} 
                                            placeholder="Laravel"
                                            onChange={(e) => {
                                              const next = [...config.caseStudies];
                                              next[idx].techStack.backend[tagIdx] = e.target.value;
                                              setConfig((p: any) => ({ ...p, caseStudies: next }));
                                            }}
                                            className="bg-transparent text-[10px] outline-none text-zinc-300 w-16"
                                          />
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setConfig((p: any) => {
                                                const next = [...p.caseStudies];
                                                next[idx].techStack.backend = next[idx].techStack.backend.filter((_: any, i: number) => i !== tagIdx);
                                                return { ...p, caseStudies: next };
                                              });
                                            }}
                                            className="text-zinc-500 hover:text-red-400 text-[10px]"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Infrastructure Stack */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-zinc-400 font-semibold uppercase">Infrastructure Tags</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setConfig((p: any) => {
                                            const next = [...p.caseStudies];
                                            if (!next[idx].techStack) next[idx].techStack = { frontend: [], backend: [], infrastructure: [] };
                                            if (!next[idx].techStack.infrastructure) next[idx].techStack.infrastructure = [];
                                            next[idx].techStack.infrastructure.push('');
                                            return { ...p, caseStudies: next };
                                          });
                                        }}
                                        className="text-[9px] text-[#22C55E] flex items-center gap-0.5"
                                      >
                                        <Plus size={8} /> Add Tag
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(study.techStack?.infrastructure || []).map((tag: string, tagIdx: number) => (
                                        <div key={tagIdx} className="flex gap-1 items-center bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                                          <input 
                                            type="text" 
                                            value={tag} 
                                            placeholder="Cloudflare R2"
                                            onChange={(e) => {
                                              const next = [...config.caseStudies];
                                              next[idx].techStack.infrastructure[tagIdx] = e.target.value;
                                              setConfig((p: any) => ({ ...p, caseStudies: next }));
                                            }}
                                            className="bg-transparent text-[10px] outline-none text-zinc-300 w-16"
                                          />
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setConfig((p: any) => {
                                                const next = [...p.caseStudies];
                                                next[idx].techStack.infrastructure = next[idx].techStack.infrastructure.filter((_: any, i: number) => i !== tagIdx);
                                                return { ...p, caseStudies: next };
                                              });
                                            }}
                                            className="text-zinc-500 hover:text-red-400 text-[10px]"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-900 mt-2">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Key System Features</h4>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.caseStudies];
                                          if (!next[idx].keyFeatures) next[idx].keyFeatures = [];
                                          next[idx].keyFeatures.push({ title: '', description: '' });
                                          return { ...p, caseStudies: next };
                                        });
                                      }}
                                      className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                    >
                                      <Plus size={10} /> Add Feature Card
                                    </button>
                                  </div>
                                  <div className="space-y-2.5">
                                    {(study.keyFeatures || []).map((feat: any, featIdx: number) => (
                                      <div key={featIdx} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[9px] text-zinc-500 font-mono">Feature Card #{featIdx + 1}</span>
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setConfig((p: any) => {
                                                const next = [...p.caseStudies];
                                                next[idx].keyFeatures = next[idx].keyFeatures.filter((_: any, i: number) => i !== featIdx);
                                                return { ...p, caseStudies: next };
                                              });
                                            }}
                                            className="text-[9px] text-red-500 hover:text-red-455"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                        <input 
                                          type="text" 
                                          value={feat.title || ''} 
                                          placeholder="Feature Title"
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].keyFeatures[featIdx].title = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                        <textarea 
                                          value={feat.description || ''} 
                                          placeholder="Feature details description..."
                                          rows={2}
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].keyFeatures[featIdx].description = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-855 rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none resize-y"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-900 mt-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Architecture Section Title</label>
                                    <input 
                                      type="text" 
                                      value={study.architectureAndSecurity?.title || ''} 
                                      placeholder="DevSecOps & Zero-Trust Security Implementation"
                                      onChange={(e) => {
                                        const next = [...config.caseStudies];
                                        if (!next[idx].architectureAndSecurity) next[idx].architectureAndSecurity = { title: '', points: [] };
                                        next[idx].architectureAndSecurity.title = e.target.value;
                                        setConfig((p: any) => ({ ...p, caseStudies: next }));
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                  </div>
                                  <div className="flex justify-between items-center pt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Architecture Points</h4>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.caseStudies];
                                          if (!next[idx].architectureAndSecurity) next[idx].architectureAndSecurity = { title: 'Security Implementation', points: [] };
                                          if (!next[idx].architectureAndSecurity.points) next[idx].architectureAndSecurity.points = [];
                                          next[idx].architectureAndSecurity.points.push({ title: '', description: '', codeSnippet: '' });
                                          return { ...p, caseStudies: next };
                                        });
                                      }}
                                      className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                    >
                                      <Plus size={10} /> Add Point
                                    </button>
                                  </div>
                                  <div className="space-y-2.5">
                                    {(study.architectureAndSecurity?.points || []).map((pt: any, ptIdx: number) => (
                                      <div key={ptIdx} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[9px] text-zinc-500 font-mono">Architecture Point #{ptIdx + 1}</span>
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              setConfig((p: any) => {
                                                const next = [...p.caseStudies];
                                                next[idx].architectureAndSecurity.points = next[idx].architectureAndSecurity.points.filter((_: any, i: number) => i !== ptIdx);
                                                return { ...p, caseStudies: next };
                                              });
                                            }}
                                            className="text-[9px] text-red-500 hover:text-red-450"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                        <input 
                                          type="text" 
                                          value={pt.title || ''} 
                                          placeholder="Point Title"
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].architectureAndSecurity.points[ptIdx].title = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                        <textarea 
                                          value={pt.description || ''} 
                                          placeholder="Point description details..."
                                          rows={2}
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].architectureAndSecurity.points[ptIdx].description = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-855 rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none resize-y"
                                        />
                                        <textarea 
                                          value={pt.codeSnippet || ''} 
                                          placeholder="Optional Code Snippet"
                                          rows={2}
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].architectureAndSecurity.points[ptIdx].codeSnippet = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-855 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 outline-none resize-y"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-zinc-900 mt-2">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Outcomes & Impact Bullets</h4>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.caseStudies];
                                          if (!next[idx].outcomes) next[idx].outcomes = [];
                                          next[idx].outcomes.push('');
                                          return { ...p, caseStudies: next };
                                        });
                                      }}
                                      className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                    >
                                      <Plus size={10} /> Add Outcome
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(study.outcomes || []).map((outcome: string, outIdx: number) => (
                                      <div key={outIdx} className="flex gap-2 items-center">
                                        <input 
                                          type="text" 
                                          value={outcome} 
                                          placeholder="Metric outcome achieved (e.g. 180% growth)"
                                          onChange={(e) => {
                                            const next = [...config.caseStudies];
                                            next[idx].outcomes[outIdx] = e.target.value;
                                            setConfig((p: any) => ({ ...p, caseStudies: next }));
                                          }}
                                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-300"
                                        />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            setConfig((p: any) => {
                                              const next = [...p.caseStudies];
                                              next[idx].outcomes = next[idx].outcomes.filter((_: any, i: number) => i !== outIdx);
                                              return { ...p, caseStudies: next };
                                            });
                                          }}
                                          className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-850 rounded"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: EDUCATION */}
                  {activeTab === 'education' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Education</h2>
                          <p className="text-xs text-zinc-400">Academic credentials and degrees list.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { degree: '', school: '', year: '' };
                            setConfig((p: any) => ({ ...p, education: [newItem, ...(p.education || [])] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Education Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(config.education || []).map((edu: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Edu Card #{idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    education: p.education.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove Card
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-2.5">
                              <input 
                                type="text" 
                                value={edu.degree} 
                                placeholder="Degree (e.g. BBA in Management)"
                                onChange={(e) => {
                                  const next = [...config.education];
                                  next[idx].degree = e.target.value;
                                  setConfig((p: any) => ({ ...p, education: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={edu.school} 
                                placeholder="School / University"
                                onChange={(e) => {
                                  const next = [...config.education];
                                  next[idx].school = e.target.value;
                                  setConfig((p: any) => ({ ...p, education: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={edu.year} 
                                placeholder="Year (e.g. Expected 2026)"
                                onChange={(e) => {
                                  const next = [...config.education];
                                  next[idx].year = e.target.value;
                                  setConfig((p: any) => ({ ...p, education: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white sm:col-span-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: CERTIFICATIONS */}
                  {activeTab === 'certifications' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Certifications</h2>
                          <p className="text-xs text-zinc-400">Professional credentials and trainings list.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { title: '', issuer: '', year: '', icon: 'seo' };
                            setConfig((p: any) => ({ ...p, certifications: [newItem, ...p.certifications] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Cert Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {config.certifications.map((cert: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Cert Card #{idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    certifications: p.certifications.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove Cert
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-2.5">
                              <input 
                                type="text" 
                                value={cert.title} 
                                placeholder="Certificate Title"
                                onChange={(e) => {
                                  const next = [...config.certifications];
                                  next[idx].title = e.target.value;
                                  setConfig((p: any) => ({ ...p, certifications: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={cert.issuer} 
                                placeholder="Issuer Organization"
                                onChange={(e) => {
                                  const next = [...config.certifications];
                                  next[idx].issuer = e.target.value;
                                  setConfig((p: any) => ({ ...p, certifications: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={cert.year} 
                                placeholder="Year Achieved"
                                onChange={(e) => {
                                  const next = [...config.certifications];
                                  next[idx].year = e.target.value;
                                  setConfig((p: any) => ({ ...p, certifications: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <input 
                                type="text" 
                                value={cert.icon} 
                                placeholder="Icon slug (e.g. seo, web, office)"
                                onChange={(e) => {
                                  const next = [...config.certifications];
                                  next[idx].icon = e.target.value;
                                  setConfig((p: any) => ({ ...p, certifications: next }));
                                }}
                                className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <div className="sm:col-span-2 flex gap-2.5 items-center">
                                <input 
                                  type="text" 
                                  value={cert.image || ''} 
                                  placeholder="Certificate Image Path (e.g. /certification-seo.png)"
                                  onChange={(e) => {
                                    const next = [...config.certifications];
                                    next[idx].image = e.target.value;
                                    setConfig((p: any) => ({ ...p, certifications: next }));
                                  }}
                                  className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                />
                                <label className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-[#22C55E]/40 text-white rounded px-3 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap">
                                  <Upload size={12} className={isUploading ? "animate-bounce" : ""} />
                                  {isUploading ? "..." : "Upload Certificate"}
                                  <input 
                                    type="file" 
                                    accept=".png,.jpg,.jpeg,.svg,.webp"
                                    onChange={(e) => handleFileUpload(e, `certifications.${idx}.image`)} 
                                    className="hidden"
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: SKILLS & TOOLS */}
                  {activeTab === 'skills' && (
                    <div className="space-y-6">
                      {/* Skill Categories Section */}
                      <div className="space-y-4 border-b border-zinc-800 pb-6 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-white">Skill Categories</h2>
                            <p className="text-xs text-zinc-400">The 5 structured boxes showing categories and list items.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newCat = { title: '', icon: 'Cpu', items: [''] };
                              setConfig((p: any) => ({ 
                                ...p, 
                                skillCategories: [...(p.skillCategories || []), newCat] 
                              }));
                            }}
                            className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                          >
                            <Plus size={14} /> Add Category
                          </button>
                        </div>

                        <div className="space-y-4">
                          {(config.skillCategories || []).map((cat: any, idx: number) => (
                            <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                <span className="text-xs font-mono text-[#22C55E]">Category #{idx + 1}</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => ({
                                      ...p,
                                      skillCategories: p.skillCategories.filter((_: any, i: number) => i !== idx)
                                    }));
                                  }}
                                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Remove Category
                                </button>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">Category Title</label>
                                  <input 
                                    type="text" 
                                    value={cat.title} 
                                    placeholder="e.g. SEO"
                                    onChange={(e) => {
                                      const next = [...config.skillCategories];
                                      next[idx].title = e.target.value;
                                      setConfig((p: any) => ({ ...p, skillCategories: next }));
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-semibold uppercase">Icon (e.g. Target, Globe, Code, Cpu)</label>
                                  <input 
                                    type="text" 
                                    value={cat.icon} 
                                    placeholder="e.g. Cpu"
                                    onChange={(e) => {
                                      const next = [...config.skillCategories];
                                      next[idx].icon = e.target.value;
                                      setConfig((p: any) => ({ ...p, skillCategories: next }));
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                              </div>

                              {/* Items under Category */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Skill Items (One per box)</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const next = [...config.skillCategories];
                                      next[idx].items.push('');
                                      setConfig((p: any) => ({ ...p, skillCategories: next }));
                                    }}
                                    className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                  >
                                    <Plus size={10} /> Add Item
                                  </button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-2">
                                  {cat.items.map((item: string, itemIdx: number) => (
                                    <div key={itemIdx} className="flex gap-2 items-center bg-zinc-900 border border-zinc-850 p-1.5 rounded">
                                      <input 
                                        type="text" 
                                        value={item} 
                                        placeholder="Skill item name"
                                        onChange={(e) => {
                                          const next = [...config.skillCategories];
                                          next[idx].items[itemIdx] = e.target.value;
                                          setConfig((p: any) => ({ ...p, skillCategories: next }));
                                        }}
                                        className="flex-1 bg-transparent text-xs outline-none text-zinc-300"
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const next = [...config.skillCategories];
                                          next[idx].items = next[idx].items.filter((_: any, i: number) => i !== itemIdx);
                                          setConfig((p: any) => ({ ...p, skillCategories: next }));
                                        }}
                                        className="text-zinc-500 hover:text-red-400 text-xs"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Tags Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-white">Skills Tags (Tools)</h2>
                            <p className="text-xs text-zinc-400">Pills displayed at the bottom of your Skills section.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setConfig((p: any) => ({ ...p, skills: [...p.skills, ''] }));
                            }}
                            className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                          >
                            <Plus size={14} /> Add Skill Tag
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {config.skills.map((skill: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center bg-zinc-950/40 border border-zinc-800 p-2 rounded-xl">
                              <span className="text-[10px] font-mono text-zinc-650 w-5">{idx + 1}.</span>
                              <input 
                                type="text" 
                                value={skill} 
                                onChange={(e) => {
                                  const next = [...config.skills];
                                  next[idx] = e.target.value;
                                  setConfig((p: any) => ({ ...p, skills: next }));
                                }}
                                className="flex-1 bg-transparent text-xs outline-none text-white"
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({ ...p, skills: p.skills.filter((_: any, i: number) => i !== idx) }));
                                }}
                                className="text-zinc-550 hover:text-red-400"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: WHY CHOOSE ME */}
                  {activeTab === 'why' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Why Choose Me / Core Competencies</h2>
                          <p className="text-xs text-zinc-400">Cards explaining your key value propositions and software architectures.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItem = { title: '', description: '' };
                            setConfig((p: any) => ({ ...p, whyWorkWithMe: [...p.whyWorkWithMe, newItem] }));
                          }}
                          className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                        >
                          <Plus size={14} /> Add Card
                        </button>
                      </div>

                      <div className="space-y-4">
                        {config.whyWorkWithMe.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-xs font-mono text-[#22C55E]">Card #{idx + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setConfig((p: any) => ({
                                    ...p,
                                    whyWorkWithMe: p.whyWorkWithMe.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove Card
                              </button>
                            </div>

                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={item.title} 
                                placeholder="Card Title (e.g. Web Development & Automation)"
                                onChange={(e) => {
                                  const next = [...config.whyWorkWithMe];
                                  next[idx].title = e.target.value;
                                  setConfig((p: any) => ({ ...p, whyWorkWithMe: next }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                              />
                              <textarea 
                                value={item.description} 
                                placeholder="Provide supporting details..."
                                rows={2}
                                onChange={(e) => {
                                  const next = [...config.whyWorkWithMe];
                                  next[idx].description = e.target.value;
                                  setConfig((p: any) => ({ ...p, whyWorkWithMe: next }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white outline-none resize-y"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: PROPOSAL & NAV */}
                  {activeTab === 'seo' && (() => {
                    const proposals = config.proposals || [];
                    const currentProposalIdx = proposals.findIndex((p: any) => p.id === selectedProposalId);
                    const currentProposal = currentProposalIdx !== -1 ? proposals[currentProposalIdx] : null;

                    return (
                      <div className="space-y-6">
                        
                        {/* Selector & Actions */}
                        <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Select Proposal / Pricing Page</label>
                              <select
                                value={selectedProposalId}
                                onChange={(e) => setSelectedProposalId(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-2 text-sm outline-none text-white cursor-pointer"
                              >
                                {proposals.map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2 self-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const name = prompt("Enter new proposal name (e.g. Web Development Proposal):");
                                  if (!name) return;
                                  const cleanId = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').trim();
                                  if (!cleanId) return;
                                  if (proposals.some((p: any) => p.id === cleanId)) {
                                    alert("A proposal with this ID already exists.");
                                    return;
                                  }
                                  const newProp = {
                                    id: cleanId,
                                    serviceTitle: '',
                                    title: name,
                                    subtitle: 'Choose the plan that fits your business goals',
                                    plans: [],
                                    paymentTerms: []
                                  };
                                  setConfig((p: any) => ({
                                    ...p,
                                    proposals: [...(p.proposals || []), newProp]
                                  }));
                                  setSelectedProposalId(cleanId);
                                }}
                                className="bg-zinc-850 hover:bg-zinc-800 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-zinc-800 hover:border-[#22C55E]"
                              >
                                <Plus size={14} /> New Proposal
                              </button>
                              {selectedProposalId !== 'seo-proposal' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!confirm("Are you sure you want to delete this proposal?")) return;
                                    setConfig((p: any) => ({
                                      ...p,
                                      proposals: (p.proposals || []).filter((x: any) => x.id !== selectedProposalId)
                                    }));
                                    setSelectedProposalId('seo-proposal');
                                  }}
                                  className="bg-red-950/45 hover:bg-red-950/60 text-red-400 border border-red-900/40 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {currentProposal ? (
                          <>
                            {/* Proposal Details */}
                            <div className="space-y-4">
                              <div>
                                <h2 className="text-lg font-bold">Proposal Page Settings</h2>
                                <p className="text-xs text-zinc-400">Configure page title, subtitle and linkage to service cards.</p>
                              </div>
                              <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-3">
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 font-semibold">Page Title</label>
                                    <input 
                                      type="text" 
                                      value={currentProposal.title || ''} 
                                      onChange={(e) => {
                                        const title = e.target.value;
                                        setConfig((p: any) => {
                                          const next = [...p.proposals];
                                          next[currentProposalIdx].title = title;
                                          return { ...p, proposals: next };
                                        });
                                      }}
                                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 font-semibold">Link to Service Card</label>
                                    <select
                                      value={currentProposal.serviceTitle || ''}
                                      onChange={(e) => {
                                        const serviceTitle = e.target.value;
                                        setConfig((p: any) => {
                                          const next = [...p.proposals];
                                          next[currentProposalIdx].serviceTitle = serviceTitle;
                                          return { ...p, proposals: next };
                                        });
                                      }}
                                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white cursor-pointer"
                                    >
                                      <option value="">None (Unlinked)</option>
                                      {(config.services || []).map((s: any) => (
                                        <option key={s.title} value={s.title}>{s.title}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-zinc-500 font-semibold">Subtitle</label>
                                  <input 
                                    type="text" 
                                    value={currentProposal.subtitle || ''} 
                                    onChange={(e) => {
                                      const subtitle = e.target.value;
                                      setConfig((p: any) => {
                                        const next = [...p.proposals];
                                        next[currentProposalIdx].subtitle = subtitle;
                                        return { ...p, proposals: next };
                                      });
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#22C55E] rounded-lg px-3 py-1.5 text-xs outline-none text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Proposal Plans */}
                            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-lg font-bold text-white">Proposal Plans / Pricing Packages</h2>
                                  <p className="text-xs text-zinc-400">Manage the pricing plans shown in the proposal details.</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newPlan = {
                                      name: '',
                                      price: '',
                                      period: 'month',
                                      description: '',
                                      features: [''],
                                      highlighted: false
                                    };
                                    setConfig((p: any) => {
                                      const next = [...p.proposals];
                                      next[currentProposalIdx].plans = [...(next[currentProposalIdx].plans || []), newPlan];
                                      return { ...p, proposals: next };
                                    });
                                  }}
                                  className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                                >
                                  <Plus size={14} /> Add Plan Package
                                </button>
                              </div>

                              <div className="space-y-4">
                                {(currentProposal.plans || []).map((plan: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                      <span className="text-xs font-mono text-[#22C55E]">Plan Package #{idx + 1}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setConfig((p: any) => {
                                            const next = [...p.proposals];
                                            next[currentProposalIdx].plans = next[currentProposalIdx].plans.filter((_: any, i: number) => i !== idx);
                                            return { ...p, proposals: next };
                                          });
                                        }}
                                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                                      >
                                        <Trash2 size={12} /> Remove Plan
                                      </button>
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Plan Name</label>
                                        <input 
                                          type="text" 
                                          value={plan.name} 
                                          placeholder="e.g. Growth SEO Plan"
                                          onChange={(e) => {
                                            const name = e.target.value;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].name = name;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Price</label>
                                        <input 
                                          type="text" 
                                          value={plan.price} 
                                          placeholder="e.g. $350"
                                          onChange={(e) => {
                                            const price = e.target.value;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].price = price;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Period</label>
                                        <input 
                                          type="text" 
                                          value={plan.period} 
                                          placeholder="e.g. month"
                                          onChange={(e) => {
                                            const period = e.target.value;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].period = period;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                      </div>
                                      <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Short Description</label>
                                        <input 
                                          type="text" 
                                          value={plan.description} 
                                          placeholder="e.g. Ideal for growing businesses..."
                                          onChange={(e) => {
                                            const description = e.target.value;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].description = description;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Popular Badge (optional)</label>
                                        <input 
                                          type="text" 
                                          value={plan.badge || ''} 
                                          placeholder="e.g. Most Popular"
                                          onChange={(e) => {
                                            const badge = e.target.value;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].badge = badge;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                      </div>
                                      <div className="sm:col-span-3 flex items-center gap-2 mt-1">
                                        <input 
                                          type="checkbox" 
                                          id={`planHighlighted-${idx}`}
                                          checked={!!plan.highlighted} 
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].highlighted = checked;
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="accent-[#22C55E] h-4 w-4 rounded"
                                        />
                                        <label htmlFor={`planHighlighted-${idx}`} className="text-xs text-zinc-300 select-none cursor-pointer">
                                          Highlight this plan (recommended choice)
                                        </label>
                                      </div>
                                    </div>

                                    {/* Features under Plan */}
                                    <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">Included Plan Features</span>
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            setConfig((p: any) => {
                                              const next = [...p.proposals];
                                              next[currentProposalIdx].plans[idx].features.push('');
                                              return { ...p, proposals: next };
                                            });
                                          }}
                                          className="text-[10px] text-[#22C55E] flex items-center gap-0.5"
                                        >
                                          <Plus size={10} /> Add Feature
                                        </button>
                                      </div>

                                      <div className="grid sm:grid-cols-2 gap-2">
                                        {plan.features.map((feat: string, featIdx: number) => (
                                          <div key={featIdx} className="flex gap-2 items-center bg-zinc-900 border border-zinc-850 p-1.5 rounded">
                                            <input 
                                              type="text" 
                                              value={feat} 
                                              placeholder="Deliverable/Feature detail"
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setConfig((p: any) => {
                                                  const next = [...p.proposals];
                                                  next[currentProposalIdx].plans[idx].features[featIdx] = val;
                                                  return { ...p, proposals: next };
                                                });
                                              }}
                                              className="flex-1 bg-transparent text-xs outline-none text-zinc-300"
                                            />
                                            <button 
                                              type="button" 
                                              onClick={() => {
                                                setConfig((p: any) => {
                                                  const next = [...p.proposals];
                                                  next[currentProposalIdx].plans[idx].features = next[currentProposalIdx].plans[idx].features.filter((_: any, i: number) => i !== featIdx);
                                                  return { ...p, proposals: next };
                                                });
                                              }}
                                              className="text-zinc-550 hover:text-red-400 text-xs"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Payment Terms */}
                            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-lg font-bold">Payment Terms</h2>
                                  <p className="text-xs text-zinc-400">List of terms displayed in proposal footer.</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setConfig((p: any) => {
                                      const next = [...p.proposals];
                                      next[currentProposalIdx].paymentTerms.push('');
                                      return { ...p, proposals: next };
                                    });
                                  }}
                                  className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                                >
                                  <Plus size={12} /> Add Term
                                </button>
                              </div>
                              <div className="space-y-2">
                                {currentProposal.paymentTerms.map((term: string, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <span className="text-[10px] font-mono text-zinc-650">{idx + 1}.</span>
                                    <input 
                                      type="text" 
                                      value={term} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setConfig((p: any) => {
                                          const next = [...p.proposals];
                                          next[currentProposalIdx].paymentTerms[idx] = val;
                                          return { ...p, proposals: next };
                                        });
                                      }}
                                      className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setConfig((p: any) => {
                                          const next = [...p.proposals];
                                          next[currentProposalIdx].paymentTerms = next[currentProposalIdx].paymentTerms.filter((_: any, i: number) => i !== idx);
                                          return { ...p, proposals: next };
                                        });
                                      }}
                                      className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-850 rounded"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-zinc-500 text-xs py-4 text-center">No proposal selected. Create one to begin.</div>
                        )}

                        {/* Navigation Link Labels */}
                        <div className="border-t border-zinc-800/80 pt-6 space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-lg font-bold">Navigation Menu</h2>
                              <p className="text-xs text-zinc-400">Header nav list item links (corresponds to hash selectors).</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => {
                                const newItem = { label: '', href: '' };
                                setConfig((p: any) => ({ ...p, navigation: [...p.navigation, newItem] }));
                              }}
                              className="text-[#22C55E] hover:text-[#16A34A] text-xs flex items-center gap-1 font-semibold"
                            >
                              <Plus size={14} /> Add Menu Link
                            </button>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {config.navigation.map((nav: any, idx: number) => (
                              <div key={idx} className="p-3 bg-zinc-950/60 border border-zinc-805 rounded-xl space-y-2">
                                <div className="flex justify-between items-center pb-1 border-b border-zinc-900/50">
                                  <span className="text-[10px] font-mono text-zinc-650">Link #{idx + 1}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setConfig((p: any) => ({
                                        ...p,
                                        navigation: p.navigation.filter((_: any, i: number) => i !== idx)
                                      }));
                                    }}
                                    className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-0.5"
                                  >
                                    <Trash2 size={10} /> Remove Link
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text" 
                                    value={nav.label} 
                                    placeholder="Label (e.g. Services)"
                                    onChange={(e) => {
                                      const next = [...config.navigation];
                                      next[idx].label = e.target.value;
                                      setConfig((p: any) => ({ ...p, navigation: next }));
                                    }}
                                    className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                  <input 
                                    type="text" 
                                    value={nav.href} 
                                    placeholder="Href (e.g. #services)"
                                    onChange={(e) => {
                                      const next = [...config.navigation];
                                      next[idx].href = e.target.value;
                                      setConfig((p: any) => ({ ...p, navigation: next }));
                                    }}
                                    className="bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* TAB CONTENT: OPTIONS / SETTINGS */}
                  {activeTab === 'options' && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h2 className="text-lg font-bold text-white">Options & Settings</h2>
                        <p className="text-xs text-zinc-400">Configure security settings and system configurations.</p>
                      </div>

                      <div className="p-5 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-1">Change Login Passcode</h3>
                          <p className="text-xs text-zinc-500">Update the passcode used to log into the DevSecOps CMS panel.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-semibold uppercase">New Passcode</label>
                            <input 
                              type="password" 
                              value={newPasscode} 
                              placeholder="Enter at least 4 characters..."
                              onChange={(e) => setNewPasscode(e.target.value)} 
                              className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={handleChangePasscode}
                            disabled={isChangingPasscode || !newPasscode.trim()}
                            className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isChangingPasscode ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                Changing Passcode...
                              </>
                            ) : (
                              <>
                                <Lock size={14} />
                                Change Passcode
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: BLOG POSTS */}
                  {activeTab === 'blog' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-bold text-white">Blog Posts Manager</h2>
                          <p className="text-xs text-zinc-400 font-medium">Create, edit, and publish posts to your site blog.</p>
                        </div>
                        {!isEditingPost && (
                          <button
                            type="button"
                            onClick={handleOpenAddNewPost}
                            className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <Plus size={14} /> Add New Post
                          </button>
                        )}
                      </div>

                      {isEditingPost ? (
                        <form onSubmit={handleSavePost} className="p-6 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl space-y-5">
                          <div className="border-b border-zinc-800 pb-3 mb-4">
                            <h3 className="text-sm font-semibold text-white">
                              {editingPostId ? 'Edit Blog Post' : 'Add New Blog Post'}
                            </h3>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Title */}
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Post Title <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                maxLength={200}
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                placeholder="Enter article title..."
                                className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                                required
                              />
                            </div>

                            {/* Slug */}
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Slug (URL Path)</label>
                              <input
                                type="text"
                                maxLength={100}
                                value={postSlug}
                                onChange={(e) => setPostSlug(e.target.value)}
                                placeholder="auto-generated-from-title-on-blur"
                                className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white font-mono"
                              />
                            </div>

                            {/* Date */}
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Publish Date</label>
                              <input
                                type="date"
                                value={postDate}
                                onChange={(e) => setPostDate(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                              />
                            </div>

                            {/* Language */}
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Language</label>
                              <div className="flex bg-zinc-900 border border-zinc-850 rounded-xl p-1 w-full max-w-[200px]">
                                <button
                                  type="button"
                                  onClick={() => setPostLang('en')}
                                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    postLang === 'en' ? 'bg-[#22C55E] text-black' : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  🇬🇧 EN
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPostLang('bn')}
                                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    postLang === 'bn' ? 'bg-[#22C55E] text-black' : 'text-zinc-400 hover:text-white'
                                  }`}
                                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                                >
                                  🇧🇩 বাংলা
                                </button>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-1">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Tags (comma-separated)</label>
                              <input
                                type="text"
                                value={postTags}
                                onChange={(e) => setPostTags(e.target.value)}
                                placeholder="e.g. SEO, Technical, Next.js"
                                className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white"
                              />
                            </div>
                          </div>

                          {/* Excerpt */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-xs text-zinc-400 font-semibold uppercase">Excerpt (Short Description)</label>
                              <span className="text-[10px] text-zinc-500">{postExcerpt.length}/500 chars</span>
                            </div>
                            <textarea
                              maxLength={500}
                              value={postExcerpt}
                              onChange={(e) => setPostExcerpt(e.target.value)}
                              placeholder="Describe what the post is about (displayed in listings)..."
                              rows={3}
                              className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white resize-y"
                            />
                          </div>

                          {/* Content */}
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-400 font-semibold uppercase block">Post Content (Markdown Supported)</label>
                            <span className="text-[10px] text-zinc-500 block mb-1">
                              Markdown supported: **bold**, *italic*, ## headings, `code`, lists, links.
                            </span>
                            {/* SECURITY NOTE: Rendered client-side by react-markdown with remarkGfm only (no rehype-raw). Safely escapes script tags. */}
                            <textarea
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              placeholder="Write your article in Markdown..."
                              rows={12}
                              style={{ minHeight: '300px' }}
                              className="w-full bg-zinc-900 border border-zinc-850 focus:border-[#22C55E] rounded-xl px-3 py-2 text-sm outline-none transition-all text-white font-mono resize-y"
                              required
                            />
                          </div>

                          {/* Toggles */}
                          <div className="flex flex-wrap gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={postFeatured}
                                onChange={(e) => setPostFeatured(e.target.checked)}
                                className="w-4 h-4 accent-[#22C55E] rounded border-zinc-800"
                              />
                              <span className="text-xs text-zinc-300 font-semibold uppercase">Featured Post</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={postPublished}
                                onChange={(e) => setPostPublished(e.target.checked)}
                                className="w-4 h-4 accent-[#22C55E] rounded border-zinc-800"
                              />
                              <span className="text-xs text-zinc-300 font-semibold uppercase">Publish Immediately</span>
                            </label>
                          </div>

                          {/* Form Actions */}
                          <div className="flex gap-3 pt-4 border-t border-zinc-800">
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                              Save Draft
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingPost(false);
                                setEditingPostId(null);
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
                          {posts.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-zinc-805 bg-zinc-900/30 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-5 py-4">Title</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Language</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-850 text-sm">
                                  {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-zinc-900/10 transition-colors">
                                      <td className="px-5 py-4 font-semibold text-white">
                                        <div className="max-w-[250px] truncate" title={post.title}>
                                          {post.title}
                                        </div>
                                      </td>
                                      <td className="px-5 py-4 text-zinc-400 font-mono text-xs">
                                        {post.date}
                                      </td>
                                      <td className="px-5 py-4">
                                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full">
                                          {post.lang === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 EN'}
                                        </span>
                                      </td>
                                      <td className="px-5 py-4">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={post.published}
                                            onChange={() => handleTogglePublish(post)}
                                            className="w-4 h-4 accent-[#22C55E] rounded border-zinc-800"
                                          />
                                          <span className={`text-xs ${post.published ? 'text-[#22C55E]' : 'text-zinc-500'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                          </span>
                                        </label>
                                      </td>
                                      <td className="px-5 py-4 text-right space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditPost(post)}
                                          className="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded-lg text-xs transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePost(post.id)}
                                          className="text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 px-3 py-1 rounded-lg text-xs transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-zinc-500 text-sm">No posts yet. Click "Add New Post" to get started.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Action Buttons (Footer component inside right-panel context) */}
            {config && (
              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-805 mt-8 relative z-20">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isLoading || isPublishing}
                  className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-medium py-3 rounded-xl border border-zinc-700/80 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!hasSaved || isLoading || isPublishing}
                  className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    hasSaved 
                      ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-[#22C55E]/10' 
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
                  }`}
                >
                  {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <GitBranch size={18} />}
                  Commit & Push to GitHub
                </button>
              </div>
            )}

            {/* Git Publish Result Box */}
            {publishResult && (
              <div className="mt-6 p-5 bg-zinc-950 border border-zinc-800/80 rounded-xl font-mono text-xs text-zinc-400 space-y-2 max-h-48 overflow-y-auto">
                <div className={`flex items-center gap-1.5 font-bold mb-1 ${publishResult.pushSucceeded === false ? 'text-red-400' : 'text-emerald-500'}`}>
                  {publishResult.pushSucceeded === false ? (
                    <>
                      <AlertCircle size={14} /> PUSH FAILED (COMMIT SAVED LOCALLY)
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> PUBLISH SUCCESS
                    </>
                  )}
                </div>
                <div>
                  <span className="text-zinc-650">Commit:</span> {publishResult.commitHash}
                </div>
                {publishResult.pushOutput && (
                  <div>
                    <span className="text-zinc-650">Git/Error Output:</span>
                    <pre className="mt-1 bg-zinc-900/50 p-2.5 rounded border border-zinc-850 overflow-x-auto text-[10px]">{publishResult.pushOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
