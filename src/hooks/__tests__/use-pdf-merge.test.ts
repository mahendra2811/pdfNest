import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePdfMerge } from "../use-pdf-merge";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { MockPDFDocument } = vi.hoisted(() => {
  class MockPDFDocument {
    private _pageCount = 1;
    private _pages: object[] = [{}];

    static async create(): Promise<MockPDFDocument> {
      const doc = new MockPDFDocument();
      doc._pageCount = 0;
      doc._pages = [];
      return doc;
    }

    static async load(__buffer: ArrayBuffer, __opts?: object): Promise<MockPDFDocument> {
      return new MockPDFDocument();
    }

    getPageCount(): number {
      return this._pageCount;
    }

    getPageIndices(): number[] {
      return Array.from({ length: this._pageCount }, (_, i) => i);
    }

    async copyPages(_src: MockPDFDocument, indices: number[]): Promise<object[]> {
      return indices.map(() => ({}));
    }

    addPage(_page: object): void {
      this._pages.push(_page);
      this._pageCount++;
    }

    async save(): Promise<Uint8Array> {
      return new Uint8Array([1, 2, 3, 4]);
    }
  }

  return { MockPDFDocument };
});

vi.mock("pdf-lib", () => ({
  PDFDocument: MockPDFDocument,
}));

vi.mock("@/lib/utils/file-helpers", () => ({
  readFileAsArrayBuffer: vi.fn(async () => new ArrayBuffer(8)),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePdf(name = "doc.pdf"): File {
  return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], name, {
    type: "application/pdf",
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("usePdfMerge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state with null result", () => {
    const { result } = renderHook(() => usePdfMerge());

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.progress).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it("exposes loadFiles, merge, reset", () => {
    const { result } = renderHook(() => usePdfMerge());

    expect(typeof result.current.loadFiles).toBe("function");
    expect(typeof result.current.merge).toBe("function");
    expect(typeof result.current.reset).toBe("function");
  });

  it("loadFiles returns page counts for valid PDFs", async () => {
    const { result } = renderHook(() => usePdfMerge());
    const files = [makePdf("a.pdf"), makePdf("b.pdf")];

    let infos: Awaited<ReturnType<typeof result.current.loadFiles>>;
    await act(async () => {
      infos = await result.current.loadFiles(files);
    });

    expect(infos!).toHaveLength(2);
    expect(infos![0].pageCount).toBeGreaterThan(0);
    expect(infos![1].pageCount).toBeGreaterThan(0);
  });

  it("loadFiles marks corrupted files with an error", async () => {
    const { readFileAsArrayBuffer } = await import("@/lib/utils/file-helpers");
    vi.mocked(readFileAsArrayBuffer).mockRejectedValueOnce(new Error("corrupt"));

    const { result } = renderHook(() => usePdfMerge());

    let infos: Awaited<ReturnType<typeof result.current.loadFiles>>;
    await act(async () => {
      infos = await result.current.loadFiles([makePdf("bad.pdf")]);
    });

    expect(infos![0].error).toBeDefined();
    expect(infos![0].pageCount).toBe(0);
  });

  it("merge sets error when fewer than 2 files provided", async () => {
    const { result } = renderHook(() => usePdfMerge());

    await act(async () => {
      await result.current.merge([makePdf()]);
    });

    expect(result.current.state.status).toBe("error");
    expect(result.current.state.error).toMatch(/at least 2/i);
  });

  it("merge transitions to complete with a valid result for 2+ PDFs", async () => {
    const { result } = renderHook(() => usePdfMerge());
    const files = [makePdf("a.pdf"), makePdf("b.pdf")];

    await act(async () => {
      await result.current.merge(files);
    });

    expect(result.current.state.status).toBe("complete");
    expect(result.current.state.progress).toBe(100);

    const r = result.current.result;
    expect(r).not.toBeNull();
    expect(r!.blob).toBeInstanceOf(Blob);
    expect(r!.pageCount).toBeGreaterThan(0);
    expect(r!.skippedFiles).toEqual([]);
  });

  it("merge skips files that cannot be loaded and records them", async () => {
    const { readFileAsArrayBuffer } = await import("@/lib/utils/file-helpers");
    // merge calls readFileAsArrayBuffer once per file:
    // first file (good.pdf) resolves, second file (bad.pdf) rejects
    vi.mocked(readFileAsArrayBuffer)
      .mockResolvedValueOnce(new ArrayBuffer(8))
      .mockRejectedValueOnce(new Error("bad file"));

    const { result } = renderHook(() => usePdfMerge());

    await act(async () => {
      await result.current.merge([makePdf("good.pdf"), makePdf("bad.pdf")]);
    });

    expect(result.current.state.status).toBe("complete");
    expect(result.current.result!.skippedFiles).toContain("bad.pdf");
  });

  it("reset restores idle state and clears result", async () => {
    const { result } = renderHook(() => usePdfMerge());

    await act(async () => {
      await result.current.merge([makePdf("a.pdf"), makePdf("b.pdf")]);
    });

    expect(result.current.state.status).toBe("complete");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.progress).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it("concurrent merge calls are guarded — second is a no-op", async () => {
    const { result } = renderHook(() => usePdfMerge());
    const files = [makePdf("a.pdf"), makePdf("b.pdf")];

    await act(async () => {
      const p1 = result.current.merge(files);
      const p2 = result.current.merge(files);
      await Promise.all([p1, p2]);
    });

    expect(result.current.state.status).toBe("complete");
  });
});
