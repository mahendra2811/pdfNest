/**
 * File size limits for pdfNest tools.
 * Always reference these constants — never hardcode limits in tool code.
 */
export const FILE_LIMITS = {
  /** Standard PDF tools: merge, split, rotate, etc. */
  pdf: {
    maxSize: 50 * 1024 * 1024, // 50 MB
    maxSizeLabel: "50 MB",
    acceptedTypes: ["application/pdf"] as const,
    acceptString: ".pdf",
  },
  /** Extended limit for tools that reduce PDF size (compress) */
  pdfMax: {
    maxSize: 1000 * 1024 * 1024, // 1 GB
    maxSizeLabel: "1000 MB",
    acceptedTypes: ["application/pdf"] as const,
    acceptString: ".pdf",
  },
  /** Image inputs for image-to-pdf */
  image: {
    maxSize: 40 * 1024 * 1024, // 40 MB
    maxSizeLabel: "40 MB",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"] as const,
    acceptString: ".jpg,.jpeg,.png,.webp,.gif,.bmp",
  },
  /** HTML / text inputs */
  text: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: "10 MB",
    acceptedTypes: ["text/plain", "text/html", "text/markdown"] as const,
    acceptString: ".txt,.html,.htm,.md",
  },
} as const;

export type FileLimitKey = keyof typeof FILE_LIMITS;
