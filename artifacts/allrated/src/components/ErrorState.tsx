import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  message = 'Failed to load content',
  onRetry,
  compact,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[#ffffff4d] text-sm py-4" role="alert">
        <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[#4752c4] hover:underline ml-2 transition-bingr"
            aria-label="Retry loading content"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div
        className="w-16 h-16 rounded-full bg-[#ffffff0d] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <AlertCircle className="w-8 h-8 text-[#ffffff4d]" />
      </div>
      <h3 className="text-lg font-semibold text-[#ffffffe6] mb-2">Something went wrong</h3>
      <p className="text-[#ffffff4d] text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4752c4] text-black font-semibold hover:bg-[#3d47b0] transition-bingr"
          aria-label="Try loading the content again"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </button>
      )}
    </div>
  );
}
