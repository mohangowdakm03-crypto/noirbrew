'use client';
import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ring = useRef(null);
  const dot  = useRef(null);

  useEffect(() => {
    let mx = -200, my = -200, cx = -200, cy = -200;
    let raf;

    const onMove = e => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) {
        dot.current.style.left = mx + 'px';
        dot.current.style.top  = my + 'px';
      }
    };

    const animate = () => {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      if (ring.current) {
        ring.current.style.left = cx + 'px';
        ring.current.style.top  = cy + 'px';
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(animate);

    const grow   = () => { if (ring.current) { ring.current.style.width = '56px'; ring.current.style.height = '56px'; }};
    const shrink = () => { if (ring.current) { ring.current.style.width = '36px'; ring.current.style.height = '36px'; }};

    const targets = document.querySelectorAll('a, button, .feat-card, .btn-outline, .btn-filled, .magnetic, .origin-card, .menu-card');
    targets.forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      targets.forEach(el => { el.removeEventListener('mouseenter', grow); el.removeEventListener('mouseleave', shrink); });
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
