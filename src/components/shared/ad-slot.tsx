"use client";

/**
 * AdSlot — env-gated Google AdSense placeholder.
 *
 * Renders null until both NEXT_PUBLIC_ADSENSE_CLIENT_ID and
 * NEXT_PUBLIC_ADSENSE_ENABLED="true" are set. No script is loaded otherwise.
 * Wrapping in a client component means the check runs at runtime (hydration)
 * so the build never fails with empty env.
 */
import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

export function AdSlot({
  slot,
  format = "auto",
  className,
}: AdSlotProps): React.ReactElement | null {
  const slotRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || !ADS_ENABLED) return;
    if (initialised.current) return;
    initialised.current = true;

    // Load AdSense script once
    if (!document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Push the ad
    try {
      // adsbygoogle is an array-like object with a push method
      // We cast to unknown to avoid array/tuple type conflicts
      type Ads = { push: (o: Record<string, unknown>) => void };
      const w = window as unknown as { adsbygoogle?: Ads };
      if (!w.adsbygoogle) {
        w.adsbygoogle = { push: () => undefined };
      }
      w.adsbygoogle.push({});
    } catch {
      // Silently ignore — ad block or init error
    }
  }, []);

  if (!CLIENT_ID || !ADS_ENABLED) return null;

  return (
    <div ref={slotRef} className={className} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
