import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, TrendingUp, Eye, Tag, Image } from 'lucide-react';
import type { Prompt } from '../types';
import ImageViewerModal from './ImageViewerModal';

interface PromptWithMedia extends Prompt {
  media?: { file_name: string; download_url: string | null; mime_type: string }[];
}

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20',
  Intermediate: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20',
  Advanced: 'bg-[#ff3366]/15 text-[#ff3366] border border-[#ff3366]/20',
};

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const p = prompt as PromptWithMedia;
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const categoryName = p.category?.name ?? 'Uncategorized';
  const categorySlug = p.category?.slug ?? '';
  const firstImage = p.media?.find((m) => m.download_url && !m.mime_type?.startsWith('image/svg'));
  const hasOutput = p.media && p.media.length > 0;

  return (
    <>
      <Link
        to={`/prompt/${p.slug}`}
        className="group cyber-card cyber-chamfer p-6 flex flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/category/${categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="cyber-chip cyber-chamfer-sm mb-3 hover:bg-[rgba(0,255,136,0.2)] transition-all"
            >
              {categoryName}
            </Link>
            <h3 className="font-cyber font-bold text-base leading-tight text-cyber-fg group-hover:text-cyber-accent transition-colors uppercase tracking-wide">
              {p.title}
            </h3>
          </div>
          {p.trending && (
            <span className="cyber-chip cyber-chamfer-sm !bg-[rgba(255,51,102,0.1)] !text-[#ff3366] !border-[#ff336640] animate-pulse-soft">
              <TrendingUp className="w-3 h-3" />HOT
            </span>
          )}
        </div>

        <p className="text-sm text-cyber-fg-soft leading-relaxed line-clamp-2 font-mono">
          {p.description}
        </p>

        {hasOutput && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewerUrl(firstImage?.download_url ?? p.media![0].download_url); }}
            className="flex items-center gap-2"
          >
            <span className="cyber-chip cyber-chamfer-sm hover:bg-[rgba(0,255,136,0.2)] transition-all">
              <Image className="w-3 h-3" />VIEW OUTPUT
            </span>
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {p.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyber-fg-soft border border-cyber-border">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-cyber-border">
          <div className="flex items-center gap-3 text-[10px] text-cyber-fg-soft font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />{p.popularity.toLocaleString()}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase ${difficultyColors[p.difficulty] ?? 'text-cyber-fg-soft'}`}>
              {p.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyber-accent font-mono uppercase tracking-wider group-hover:gap-2.5 transition-all">
            <Copy className="w-4 h-4" />USE
          </div>
        </div>
      </Link>
      {viewerUrl && (
        <ImageViewerModal url={viewerUrl} title={p.title} onClose={() => setViewerUrl(null)} />
      )}
    </>
  );
}
