/**
 * pdfNest — PDF-only tool types.
 * Single source of truth for tool shape across routing, home grid, sitemap, search, SEO, favorites.
 */

export type ToolCategory =
  | "manipulate"
  | "security"
  | "forms-metadata"
  | "pdf-to-other"
  | "other-to-pdf";

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  icon: string; // Lucide icon name
  features: string[];
  maxFileSize: number; // bytes — from FILE_LIMITS
  acceptedTypes: string[]; // MIME types
  isNew?: boolean;
  comingSoon?: boolean; // drives disabled "soon" cards
  featured?: boolean;
}

/**
 * Processing state machine — discriminated union.
 * UI maps: idle=dropzone, loading=file info+settings, processing=progress,
 * complete=output+download, error=error+retry.
 */
export type ProcessingState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "processing"; progress: number } // 0-100
  | { status: "complete"; result: ProcessingResult }
  | { status: "error"; message: string };

export interface ProcessingResult {
  blob: Blob;
  fileName: string;
  originalSize?: number;
  outputSize?: number;
  pageCount?: number;
  /** Optional array for multi-file outputs (split, extract-images, pdf-to-jpg/png) */
  files?: { name: string; blob: Blob }[];
}
