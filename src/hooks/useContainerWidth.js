import { useState, useEffect, useRef } from "react";

/**
 * Track the width of a DOM element via ResizeObserver. Returns a ref to
 * attach and the current width. The width is clamped to a sensible minimum.
 *
 * @param {number} [minWidth=380] - lower bound for the returned width
 * @param {number} [initialWidth=900] - width to use before measurement
 */
export function useContainerWidth(minWidth = 380, initialWidth = 900) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initialWidth);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(minWidth, entry.contentRect.width));
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [minWidth]);

  return [ref, width];
}

/**
 * Track the viewport (window) width. Used to decide mobile vs desktop
 * layout — at the App level there's no DOM element to measure yet, so we
 * fall back to window.innerWidth.
 */
export function useViewportWidth() {
  const [w, setW] = useState(() =>
    typeof window === "undefined" ? 1200 : window.innerWidth
  );

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return w;
}