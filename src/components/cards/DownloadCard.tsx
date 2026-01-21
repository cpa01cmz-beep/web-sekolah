import { memo } from 'react';

interface DownloadCardProps {
  title: string;
  fileFormat: string;
  fileSize: string;
  description?: string;
  variant?: 'horizontal' | 'vertical';
  iconColor?: 'blue' | 'green' | 'purple' | 'default';
  className?: string;
}

export const DownloadCard = memo(function DownloadCard({ 
  title, 
  fileFormat,
  fileSize,
  description,
  variant = 'horizontal',
  iconColor = 'default',
  className = '' 
}: DownloadCardProps) {
  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    default: 'bg-primary/10 text-primary',
  };

  if (variant === 'vertical') {
    return (
      <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconColorClasses[iconColor]}`}>
          <span className="font-bold">{fileFormat}</span>
        </div>
        <h3 className="font-bold mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
          Download
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-card rounded-lg shadow-sm ${className}`}>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{fileFormat}, {fileSize}</p>
      </div>
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
        Download
      </button>
    </div>
  );
});
