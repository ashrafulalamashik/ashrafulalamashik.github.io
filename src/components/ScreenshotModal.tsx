import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

export default function ScreenshotModal({ isOpen, onClose, images, title }: ScreenshotModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      setCurrentIndex(0); // Reset index on open
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageContainerClasses = () => {
    return 'w-full h-full rounded-xl border border-zinc-800 shadow-2xl relative overflow-y-auto overflow-x-hidden bg-zinc-900/50 custom-scrollbar';
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      {/* Header */}
      <div 
        className="flex-none flex items-center justify-between p-4 bg-zinc-950/80 border-b border-zinc-800/80 backdrop-blur-md z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <span className="text-xs px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full border border-[#22C55E]/20">
            {images.length} {images.length === 1 ? 'Screenshot' : 'Screenshots'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
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
        <div 
          className={getImageContainerClasses()}
          onClick={(e) => e.stopPropagation()}
        >
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentIndex]} 
                alt={`${title} screenshot ${currentIndex + 1}`}
                className="w-full h-auto object-top min-h-full"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#22C55E]/80 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#22C55E]/80 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {images.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[#22C55E] w-4' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 w-full h-full">
              <span className="mb-2">No screenshots available</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
