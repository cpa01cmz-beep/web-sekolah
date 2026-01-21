import { memo } from 'react';

interface DownloadCardProps {
  title: string;
  fileFormat: string;
  fileSize: string;
  className?: string;
}

export const DownloadCard = memo(function DownloadCard({ 
  title, 
  fileFormat,
  fileSize, 
  className = '' 
}: DownloadCardProps) {
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
