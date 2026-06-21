import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist. Maybe the URL is wrong?
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 text-sm font-medium text-white pdf-badge rounded-xl hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
        <Link
          href="/tools"
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted/50 transition-colors"
        >
          Browse Tools
        </Link>
      </div>
    </div>
  );
}
