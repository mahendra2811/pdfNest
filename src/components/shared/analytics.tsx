/**
 * Analytics component — env-gated.
 *
 * Renders Google Analytics and/or Google Tag Manager only when their env vars
 * are set. If variables are absent, renders null — no scripts, no errors.
 *
 * Uses @next/third-parties/google which defers scripts until after hydration.
 * This is a Server Component (no "use client" needed).
 */
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export function Analytics(): React.ReactElement | null {
  if (!GA_ID && !GTM_ID) return null;
  return (
    <>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
    </>
  );
}
