import { useState, useEffect } from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';
import { createPortal } from 'react-dom';

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

interface ProjectPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ProjectPreviewModal({ isOpen, onClose, url, title }: ProjectPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const getIframeClasses = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] h-[667px] mx-auto rounded-3xl border-[12px] border-zinc-900 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[1024px] mx-auto rounded-3xl border-[16px] border-zinc-900 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-xl border border-zinc-800 shadow-2xl';
    }
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 bg-zinc-950/80 border-b border-zinc-800/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <span className="text-xs px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full border border-[#22C55E]/20">
            Live Preview
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Device Toggles */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-1 mr-4 border border-zinc-800">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-zinc-400 hover:text-white'}`}
              title="Mobile (375x667)"
            >
              <Smartphone size={18} />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'tablet' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-zinc-400 hover:text-white'}`}
              title="Tablet (768x1024)"
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-zinc-400 hover:text-white'}`}
              title="Desktop (Full Width)"
            >
              <Monitor size={18} />
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative">
        {isOpen && (
          <div className={`transition-all duration-500 ease-in-out relative ${getIframeClasses()}`}>
            {/* Loading Indicator (shows behind iframe until it loads) */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-8 h-8 border-4 border-[#22C55E]/30 border-t-[#22C55E] rounded-full animate-spin"></div>
            </div>
            <iframe
              src={url}
              title={`Preview of ${title}`}
              className="w-full h-full bg-white rounded-[inherit] outline-none border-none"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
