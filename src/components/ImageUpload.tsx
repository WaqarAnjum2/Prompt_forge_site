import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, AlertCircle, Check } from 'lucide-react';
import { uploadFile, deleteFile } from '../lib/github';
import { createPromptMedia, deletePromptMedia } from '../lib/services';
import type { PromptMedia } from '../types';

interface ImageUploadProps {
  promptId: string;
  media: PromptMedia[];
  onMediaChange: (media: PromptMedia[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ promptId, media, onMediaChange, maxFiles = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setError(null);
    setUploading(true);

    const remaining = maxFiles - media.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length < files.length) {
      setError(`Max ${maxFiles} files. Skipped ${files.length - toUpload.length}.`);
    }

    const results: PromptMedia[] = [];

    for (const file of toUpload) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} is too large (max 5MB)`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image`);
          continue;
        }

        const gh = await uploadFile(file, 'assets/prompts');
        const db = await createPromptMedia({
          prompt_id: promptId,
          file_name: file.name,
          file_path: gh.path,
          file_size: file.size,
          mime_type: file.type,
          github_sha: gh.sha,
          download_url: gh.url,
        });
        results.push(db);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }

    onMediaChange([...media, ...results]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (item: PromptMedia) => {
    try {
      await deleteFile(item.file_path, item.github_sha);
      await deletePromptMedia(item.id);
      onMediaChange(media.filter((m) => m.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {media.map((item) => (
          <div key={item.id} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-white/40 bg-white/30">
            <img
              src={item.download_url || ''}
              alt={item.file_name}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-1">
              <p className="text-[10px] text-white truncate">{item.file_name}</p>
            </div>
          </div>
        ))}

        {media.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-brand/20 hover:border-brand/50 bg-white/20 hover:bg-white/40 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-brand-dark" />
                <span className="text-[10px] text-ink-soft">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <p className="text-caption text-ink-soft mt-1">{media.length}/{maxFiles} images — 5MB max each</p>
    </div>
  );
}
