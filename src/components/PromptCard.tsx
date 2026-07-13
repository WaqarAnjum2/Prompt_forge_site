import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, TrendingUp, Eye, Tag, Image } from 'lucide-react';
import type { Prompt } from '../types';
import ImageViewerModal from './ImageViewerModal';

interface PromptWithMedia extends Prompt {
  media?: { file_name: string; download_url: string | null; mime_type: string }[];
}

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-success/15 text-success',
  Intermediate: 'bg-warning/15 text-warning',
  Advanced: 'bg-danger/15 text-danger',
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
        className="group glass rounded-3xl p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/category/${categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="chip bg-brand/10 text-brand-dark hover:bg-brand/20 mb-3"
            >
              {categoryName}
            </Link>
            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-brand-dark transition-colors">
              {p.title}
            </h3>
          </div>
          {p.trending && (
            <span className="chip bg-danger/10 text-danger shrink-0">
              <TrendingUp className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>

        <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
          {p.description}
        </p>

        {hasOutput && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewerUrl(firstImage?.download_url ?? p.media![0].download_url); }}
            className="flex items-center gap-2 text-xs text-brand-dark font-medium"
          >
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 hover:bg-brand/20 transition-colors">
              <Image className="w-3 h-3" />
              View Output
            </span>
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {p.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="chip bg-bg-surface/80 text-ink-soft">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand/10">
          <div className="flex items-center gap-3 text-caption text-ink-soft">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {p.popularity.toLocaleString()}
            </span>
            <span className={`chip ${difficultyColors[p.difficulty] ?? 'bg-bg-surface text-ink-soft'}`}>
              {p.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-brand-dark font-medium group-hover:gap-2 transition-all">
            <Copy className="w-4 h-4" />
            Use
          </div>
        </div>
      </Link>
      {viewerUrl && (
        <ImageViewerModal url={viewerUrl} title={p.title} onClose={() => setViewerUrl(null)} />
      )}
    </>
  );
}
