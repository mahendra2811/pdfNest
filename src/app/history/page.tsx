import type { Metadata } from "next";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "History — pdfNest",
  description: "Your recently used PDF tools on pdfNest.",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
        <Clock className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">History</h1>
      <p className="text-muted-foreground">
        Recently used tools will appear here. History tracking comes in Phase 2.
      </p>
    </div>
  );
}
