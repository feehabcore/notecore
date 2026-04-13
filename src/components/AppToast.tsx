import * as React from 'react';

type ToastTone = 'success' | 'error';

export default function AppToast({
  message,
  tone,
}: {
  message: string;
  tone: ToastTone;
}) {
  return (
    <div className="fixed left-1/2 bottom-24 z-[120] -translate-x-1/2 px-4 w-[calc(100%-2rem)] max-w-md">
      <div
        className={`rounded-xl px-4 py-3 text-sm font-bold shadow-lg border ${
          tone === 'success'
            ? 'bg-tertiary-container text-tertiary-fixed border-tertiary-fixed/20'
            : 'bg-error-container text-error border-error/20'
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export function useToastMessage(timeoutMs = 2200) {
  const [toast, setToast] = React.useState<{ message: string; tone: ToastTone } | null>(null);

  const showToast = React.useCallback((message: string, tone: ToastTone) => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), timeoutMs);
  }, [timeoutMs]);

  return { toast, showToast };
}

