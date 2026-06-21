export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as ArrayBuffer);
    reader.onerror = (): void => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg", "jfif", "pjpeg", "pjp"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "image/bmp": ["bmp"],
  "image/svg+xml": ["svg"],
  "image/tiff": ["tif", "tiff"],
  "application/pdf": ["pdf"],
  "text/plain": ["txt"],
  "text/html": ["html", "htm"],
  "text/markdown": ["md", "markdown"],
};

export function validateFileType(file: File, acceptedTypes: readonly string[]): boolean {
  if (file.type && acceptedTypes.includes(file.type)) return true;
  const ext = getFileExtension(file.name);
  if (!ext) return false;
  return acceptedTypes.some((type) => (MIME_EXTENSIONS[type] ?? []).includes(ext));
}
