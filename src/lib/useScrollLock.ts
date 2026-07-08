import { useEffect } from 'react';

/**
 * Prevents background page scrolling while a modal/sheet/overlay is open.
 *
 * Strategy (cross-browser + iOS Safari):
 *  1. Save current scroll offset
 *  2. Freeze body with position:fixed + top offset  → stops iOS rubber-band scroll
 *  3. Also lock html overflow                        → desktop browsers
 *  4. On cleanup: restore everything and re-scroll to saved position
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    // Snapshot existing inline styles so we can restore them exactly
    const prevBodyPosition = body.style.position;
    const prevBodyTop      = body.style.top;
    const prevBodyWidth    = body.style.width;
    const prevBodyLeft     = body.style.left;
    const prevBodyRight    = body.style.right;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    // Apply lock
    html.style.overflow  = 'hidden';
    body.style.overflow  = 'hidden';
    body.style.position  = 'fixed';
    body.style.top       = `-${scrollY}px`;
    body.style.width     = '100%';
    body.style.left      = '0';
    body.style.right     = '0';

    return () => {
      // Restore
      html.style.overflow  = prevHtmlOverflow;
      body.style.overflow  = prevBodyOverflow;
      body.style.position  = prevBodyPosition;
      body.style.top       = prevBodyTop;
      body.style.width     = prevBodyWidth;
      body.style.left      = prevBodyLeft;
      body.style.right     = prevBodyRight;

      // Jump back to saved scroll position
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
    };
  }, [active]);
}
