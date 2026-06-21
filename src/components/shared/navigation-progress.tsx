"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress(): React.ReactElement | null {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  // Use a ref so the effect dependency is stable across renders
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Kick off progress via microtask to avoid synchronous setState-in-effect
    const start = () => {
      setVisible(true);
      setProgress(20);
      timers.push(setTimeout(() => setProgress(60), 100));
      timers.push(setTimeout(() => setProgress(80), 200));
      timers.push(
        setTimeout(() => {
          setProgress(100);
          timers.push(setTimeout(() => setVisible(false), 300));
        }, 400)
      );
    };

    const raf = requestAnimationFrame(start);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-0.5 bg-primary transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
