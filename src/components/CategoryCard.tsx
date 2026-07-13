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
      className="group glass rounded-3xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <DynamicIcon name={category.icon} className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-display font-semibold group-hover:text-brand-dark transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      )}
    </Link>
  );
}
