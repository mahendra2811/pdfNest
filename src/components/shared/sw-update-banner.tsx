"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function SwUpdateBanner(): React.ReactElement | null {
  const [waiting, setWaiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkWaiting = async (): Promise<void> => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) setWaiting(true);
    };
    void checkWaiting();

    // Listen for a new SW installing after the page loads
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // The controller changed — a previously waiting SW just became active.
      // This typically happens when the user clicks Refresh in the banner.
    });

    // Poll for a new SW installing while the page is open
    const id = setInterval(() => {
      void checkWaiting();
    }, 30_000);

    return () => clearInterval(id);
  }, []);

  if (!waiting || dismissed) return null;

  const handleRefresh = (): void => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        // Tell the waiting SW to skip waiting and take control immediately
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      // Reload after a short delay to let the new SW activate
      setTimeout(() => window.location.reload(), 200);
    });
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 md:bottom-4"
    >
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-card shadow-lg px-4 py-3 max-w-sm w-full">
        <RefreshCw className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-muted-foreground">A new version of pdfNest is ready.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm font-semibold text-white px-3 py-1.5 pdf-badge rounded-lg hover:opacity-90 transition-opacity shrink-0"
          aria-label="Reload to apply the update"
        >
          Reload
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
