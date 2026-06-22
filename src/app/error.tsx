"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    // Log non-user errors to console in dev; in production a monitoring service would go here
    if (process.env.NODE_ENV === "development") {
      console.error("Unhandled error:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        An unexpected error occurred. Your files are safe — pdfNest never uploads anything.
        {process.env.NODE_ENV === "development" && error.message && (
          <span className="block mt-2 text-xs font-mono text-destructive">{error.message}</span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white pdf-badge rounded-xl hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted/50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
