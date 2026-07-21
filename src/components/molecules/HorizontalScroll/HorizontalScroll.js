"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Horizontal overflow wrapper with edge fades + hint when content can scroll.
 */
export default function HorizontalScroll({ children, className = "" }) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    function update() {
      const node = scrollerRef.current;
      if (!node) return;
      const { scrollLeft, scrollWidth, clientWidth } = node;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const canScroll = canScrollLeft || canScrollRight;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="overflow-x-auto"
          tabIndex={canScroll ? 0 : undefined}
          role={canScroll ? "region" : undefined}
          aria-label={canScroll ? "Scrollable table" : undefined}
        >
          {children}
        </div>
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-surface to-transparent transition-opacity ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent transition-opacity ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
      </div>
      {canScroll ? (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          {canScrollRight
            ? "Scroll sideways to see more →"
            : "← Scroll sideways for earlier columns"}
        </p>
      ) : null}
    </div>
  );
}
