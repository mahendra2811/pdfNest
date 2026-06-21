"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function SwUpdateBanner(): React.ReactElement | null {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // A new SW took control — prompt the user
    });
    const checkWaiting = async (): Promise<void> => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) setWaiting(true);
    };
    void checkWaiting();
  }, []);

  if (!waiting) return null;

  const handleRefresh = (): void => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    });
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 md:bottom-4">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
        <RefreshCw className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm">A new version is available.</p>
        <button
          onClick={handleRefresh}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
