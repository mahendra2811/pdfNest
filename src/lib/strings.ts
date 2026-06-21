/**
 * Centralized UI copy — i18n-ready.
 * All user-facing strings live here; never hardcode in components.
 */
export const STRINGS = {
  // App
  appName: "pdfNest",
  tagline: "Your PDFs never leave your device.",
  privacyBadge: "100% Client-Side — Files never leave your device",
  privacyBadgeShort: "Processed locally — files never leave your device",

  // Navigation
  navAllTools: "All PDF Tools",
  navFavorites: "Favorites",
  navHistory: "History",
  navHome: "Home",

  // Dropzone
  dropzoneTitle: "Drop your PDF here, or browse",
  dropzoneDragDrop: "Drag & Drop",
  dropzonePaste: "Paste (Ctrl+V)",
  dropzoneTooLarge: "File too large. Maximum size:",
  dropzoneInvalidType: "Invalid file type. Accepted:",
  dropzoneDropToUpload: "Drop to upload",
  dropzonePasting: "Pasting...",

  // Processing states
  stateIdle: "Ready",
  stateLoading: "Loading file...",
  stateProcessing: "Processing...",
  stateComplete: "Done!",
  stateError: "Something went wrong",

  // Actions
  actionDownload: "Download",
  actionDownloadAll: "Download All",
  actionDownloadZip: "Download ZIP",
  actionReset: "Process Another File",
  actionTryAgain: "Try Again",
  actionCopy: "Copy",
  actionCopied: "Copied!",

  // Footer
  footerCopyright: `© ${new Date().getFullYear()} pdfNest. All rights reserved.`,
  footerTagline: "Free, private, browser-based PDF tools.",

  // Error messages
  errorGeneric: "An unexpected error occurred. Please try again.",
  errorFileTooLarge: "The file is too large for this tool.",
  errorInvalidFile: "The file appears to be invalid or corrupted.",
  errorBrowserSupport: "Your browser does not support this feature.",

  // Categories
  categoryManipulate: "Manipulate",
  categorySecurity: "Security",
  categoryFormsMetadata: "Forms & Metadata",
  categoryPdfToOther: "PDF to Other",
  categoryOtherToPdf: "Other to PDF",

  // Coming soon
  comingSoon: "Coming Soon",
  comingSoonDescription: "This tool is under development and will be available soon.",
} as const;
