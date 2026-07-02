'use client';
import { useEffect } from 'react';

export default function Template({ children }) {
  useEffect(() => {
    // Lift the curtain when the new page mounts
    const curtain = document.getElementById('page-transition-curtain');
    if (curtain) {
      import('gsap').then(({ gsap }) => {
        gsap.to(curtain, {
          y: '100%',
          duration: 0.6,
          ease: 'power4.inOut',
          onComplete: () => {
            // Reset for the next transition
            gsap.set(curtain, { y: '-100%' });
          }
        });
      });
    }
  }, []);

  return <>{children}</>;
}
