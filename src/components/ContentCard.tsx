import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  gradient: string;
  category?: string;
  title: string;
  description: string;
  tags?: string[];
  badge?: string;
  badgeColor?: string;
  author?: string;
  authorAvatar?: string;
  className?: string;
}

export const ContentCard = memo(function ContentCard({
  gradient,
  category,
  title,
  description,
  tags,
  badge,
  badgeColor,
  author,
  authorAvatar,
  className
}: ContentCardProps) {
  const imageLabel = category ? `${category}: ${title}` : title;
  return (
    <div className={cn('bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <div className={`h-48 ${gradient}`} role="img" aria-label={imageLabel}></div>
      <div className="p-6">
        {category && (
          <span className="text-sm text-primary">{category}</span>
        )}
        <h3 className="text-xl font-bold mt-1">{title}</h3>
        {badge && (
          <span className={`px-2 py-1 ${badgeColor} rounded text-xs`}>
            {badge}
          </span>
        )}
        <p className="mt-3 text-muted-foreground">
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className={`px-2 py-1 ${badgeColor} rounded text-xs`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {author && (
          <div className="mt-4 flex items-center">
            {authorAvatar ? (
              <img src={authorAvatar} alt={`${author}'s avatar`} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-hidden="true">
                <span className="text-xs font-medium text-muted-foreground">{author.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="ml-2 text-sm">{author}</span>
          </div>
        )}
      </div>
    </div>
  );
});
