import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pdfNest — Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff1f2 100%)",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Background accent blobs */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "96px",
          height: "96px",
          borderRadius: "22px",
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(239,68,68,0.3)",
        }}
      >
        {/* PDF icon */}
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "#ef4444",
            lineHeight: 1,
          }}
        >
          pdf
        </span>
        <span
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "#111827",
            lineHeight: 1,
          }}
        >
          Nest
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: "24px",
          color: "#6b7280",
          marginBottom: "28px",
          textAlign: "center",
          maxWidth: "700px",
        }}
      >
        Free online PDF tools — 100% browser-based, no upload
      </p>

      {/* Trust chips */}
      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        {["26 free tools", "No upload", "No sign-up", "100% private"].map((chip) => (
          <div
            key={chip}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderRadius: "999px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontSize: "16px",
              color: "#dc2626",
              fontWeight: "600",
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
