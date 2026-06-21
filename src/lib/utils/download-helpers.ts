import { saveAs } from "file-saver";
import JSZip from "jszip";

const BRAND_PREFIX = "pdfNest";

export function brandedFileName(fileName: string): string {
  if (fileName.startsWith(`${BRAND_PREFIX}-`)) return fileName;
  return `${BRAND_PREFIX}-${fileName}`;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function canShareFiles(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([""], "test.txt", { type: "text/plain" })] });
  } catch {
    return false;
  }
}

export async function shareBlob(blob: Blob, filename: string): Promise<boolean> {
  if (!canShareFiles()) return false;
  const file = new File([blob], brandedFileName(filename), { type: blob.type });
  try {
    await navigator.share({ files: [file], title: "pdfNest", text: "Processed with pdfNest" });
    return true;
  } catch (err) {
    if ((err as Error).name === "AbortError") return true;
    return false;
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  saveAs(blob, brandedFileName(fileName));
}

export async function downloadOrShare(
  blob: Blob,
  filename: string
): Promise<{ action: "downloaded" | "shared" }> {
  if (isStandalone() && canShareFiles()) {
    const shared = await shareBlob(blob, filename);
    if (shared) return { action: "shared" };
  }
  saveAs(blob, brandedFileName(filename));
  return { action: "downloaded" };
}

export async function downloadZip(files: { name: string; blob: Blob }[]): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, brandedFileName("files.zip"));
}
