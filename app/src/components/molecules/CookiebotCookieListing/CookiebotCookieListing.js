"use client";

import { useEffect, useRef } from "react";
import { COOKIEBOT_DECLARATION_SRC } from "@/lib/cookiebot";

export default function CookiebotCookieListing({ enabled = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.src = COOKIEBOT_DECLARATION_SRC;
    script.type = "text/javascript";
    script.async = true;
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <p className="text-muted">
        The Cookiebot cookie listing is shown on the live production site.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
