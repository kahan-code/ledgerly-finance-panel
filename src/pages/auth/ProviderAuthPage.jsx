import { useEffect } from 'react';

export default function ProviderAuthPage({ title, description, targetId, mount }) {
  useEffect(() => {
    mount?.(`#${targetId}`);
  }, [targetId, mount]);

  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[28rem]">
        {(title || description) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-lg font-semibold tracking-tight">{title}</h1>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div id={targetId} className="min-h-[300px]" />
      </div>
    </div>
  );
}
