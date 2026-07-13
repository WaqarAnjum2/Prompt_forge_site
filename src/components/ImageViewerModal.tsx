import { useState, useEffect, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut, Loader2, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerModalProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

export default function ImageViewerModal({ url, title, onClose }: ImageViewerModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  // Cache image blob in memory
  useEffect(() => {
    if (!url) return;
    setLoaded(false);
    setError(false);
    setZoom(1);

    const cacheKey = `img_${url}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setCachedUrl(cached);
      setLoaded(true);
      return;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        sessionStorage.setItem(cacheKey, objectUrl);
        setCachedUrl(objectUrl);
        setLoaded(true);
      })
      .catch(() => setError(true));
  }, [url]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
    if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-[90vw] max-h-[90vh] glass-strong rounded-3xl p-4 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm truncate max-w-[60vw]">{title}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="p-1.5 rounded-lg hover:bg-bg-surface/50 text-ink-soft"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-ink-soft w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                className="p-1.5 rounded-lg hover:bg-bg-surface/50 text-ink-soft"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {url && (
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-bg-surface/50 text-ink-soft"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-danger/10 text-danger ml-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="overflow-auto rounded-2xl max-w-[85vw] max-h-[75vh] flex items-center justify-center bg-bg-surface/30">
            {!loaded && !error && (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center p-12 text-ink-soft">
                <ImageOff className="w-12 h-12 mb-3" />
                <p className="text-sm">Failed to load image</p>
              </div>
            )}
            {loaded && cachedUrl && (
              <img
                src={cachedUrl}
                alt={title}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="transition-transform duration-200 max-w-full max-h-full"
              />
            )}
          </div>

          {/* Footer */}
          <p className="text-caption text-ink-soft text-center mt-2">
            Scroll to view · +/- to zoom · ESC to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
