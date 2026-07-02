'use client';
import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    let lenis;
    (async () => {
      const { default: Lenis }         = await import('@studio-freight/lenis');
      const { gsap }                   = await import('gsap');
      const { ScrollTrigger }          = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // Store on window for use in page components
      window.__lenis = lenis;
      window.__gsap  = gsap;
      window.__ST    = ScrollTrigger;
    })();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
