import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageToPdf } from "../use-image-to-pdf";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock jsPDF dynamic import
vi.mock("jspdf", () => {
  class MockJsPDF {
    addPage = vi.fn();
    addImage = vi.fn();
    output = vi.fn(
      () => new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: "application/pdf" })
    );
  }

  return { default: MockJsPDF };
});

// Mock image-helpers
vi.mock("@/lib/utils/image-helpers", () => ({
  loadImageFromFile: vi.fn(async (): Promise<HTMLImageElement> => {
    const img = new Image();
    Object.defineProperty(img, "width", { value: 800, configurable: true });
    Object.defineProperty(img, "height", { value: 600, configurable: true });
    return img;
  }),
}));

// Stub HTMLCanvasElement.getContext + toDataURL
const mockGetContext = vi.fn(() => ({
  drawImage: vi.fn(),
}));

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: mockGetContext,
  configurable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
  value: vi.fn(() => "data:image/jpeg;base64,/9j/test"),
  configurable: true,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeImage(name = "photo.jpg"): File {
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, {
    type: "image/jpeg",
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useImageToPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state with default settings", () => {
    const { result } = renderHook(() => useImageToPdf());

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.settings.pageSize).toBe("a4");
    expect(result.current.settings.orientation).toBe("auto");
    expect(result.current.settings.imageFit).toBe("contain");
  });

  it("exposes processFiles, reset, updateSettings", () => {
    const { result } = renderHook(() => useImageToPdf());

    expect(typeof result.current.processFiles).toBe("function");
    expect(typeof result.current.reset).toBe("function");
    expect(typeof result.current.updateSettings).toBe("function");
  });

  it("updateSettings patches settings correctly", () => {
    const { result } = renderHook(() => useImageToPdf());

    act(() => {
      result.current.updateSettings({ pageSize: "letter", margin: 20 });
    });

    expect(result.current.settings.pageSize).toBe("letter");
    expect(result.current.settings.margin).toBe(20);
    expect(result.current.settings.imageFit).toBe("contain"); // unchanged
  });

  it("processFiles transitions to complete with a blob result", async () => {
    const { result } = renderHook(() => useImageToPdf());
    const files = [makeImage("img1.jpg"), makeImage("img2.jpg")];

    await act(async () => {
      await result.current.processFiles(files);
    });

    expect(result.current.state.status).toBe("complete");
    expect(result.current.state.progress).toBe(100);

    const r = result.current.result;
    expect(r).not.toBeNull();
    expect(r!.blob).toBeInstanceOf(Blob);
    expect(r!.pageCount).toBe(2);
    expect(r!.fileName).toBe("images.pdf");
  });

  it("reset restores idle state after complete", async () => {
    const { result } = renderHook(() => useImageToPdf());

    await act(async () => {
      await result.current.processFiles([makeImage()]);
    });

    expect(result.current.state.status).toBe("complete");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.progress).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it("concurrent processFiles calls are guarded", async () => {
    const { result } = renderHook(() => useImageToPdf());
    const files = [makeImage()];

    await act(async () => {
      const p1 = result.current.processFiles(files);
      const p2 = result.current.processFiles(files);
      await Promise.all([p1, p2]);
    });

    expect(result.current.state.status).toBe("complete");
  });
});
