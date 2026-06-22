/**
 * pdfNest analytics helper.
 *
 * When NEXT_PUBLIC_GA_MEASUREMENT_ID is set, this sends events to GA4 via gtag().
 * When the env var is absent the function is a no-op — no scripts, no errors.
 *
 * Usage:
 *   import { track } from "@/lib/analytics/track";
 *   track("tool_use", { slug: "pdf-merge" });
 */
export type TrackEvent =
  | "tool_use"
  | "tool_complete"
  | "tool_error"
  | "download"
  | "favourite_toggle"
  | "search";

export type TrackPayload = Record<string, string | number | boolean>;

export function track(event: TrackEvent, payload?: TrackPayload): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;

  // gtag is injected by @next/third-parties/google GoogleAnalytics component
  type Gtag = (cmd: "event", action: string, params?: TrackPayload) => void;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g !== "function") return;

  g("event", event, payload);
}
