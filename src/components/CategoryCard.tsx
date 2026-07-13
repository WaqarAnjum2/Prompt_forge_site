import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import type { Category } from '../types';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const Icon = icons[name] || LucideIcons.Layers;
  return <Icon className={className} />;
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group cyber-card cyber-chamfer p-6 flex flex-col items-center text-center gap-4"
    >
      <div className="w-14 h-14 border border-cyber-accent/30 flex items-center justify-center cyber-chamfer group-hover:border-cyber-accent group-hover:shadow-[0_0_15px_#00ff88,0_0_30px_#00ff8830] transition-all duration-300">
        <DynamicIcon name={category.icon} className="w-7 h-7 text-cyber-accent group-hover:drop-shadow-[0_0_6px_#00ff88] transition-all" />
      </div>
      <div>
        <h3 className="font-cyber font-bold text-sm uppercase tracking-wider text-cyber-fg group-hover:text-cyber-accent transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-cyber-fg-soft line-clamp-2 leading-relaxed mt-1.5 font-mono">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
