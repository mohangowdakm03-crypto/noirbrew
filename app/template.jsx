'use client';
import { useEffect } from 'react';

function getCurtain() {
  let curtain = document.getElementById('page-transition-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.id = 'page-transition-curtain';
    Object.assign(curtain.style, {
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: '#050505',
      zIndex: 9999,
      pointerEvents: 'none',
      transform: 'translateY(-100%)',
    });
    document.body.appendChild(curtain);
  }
  return curtain;
}

export default function Template({ children }) {
  useEffect(() => {
    // Listen for outgoing navigation — sweep curtain DOWN to cover screen
    const onNavigate = () => {
      import('gsap').then(({ gsap }) => {
        const curtain = getCurtain();
        gsap.killTweensOf(curtain);
        gsap.to(curtain, { y: '0%', duration: 0.45, ease: 'power4.inOut' });
        // Flag so destination pages skip their own intro animation
        sessionStorage.setItem('nb_client_nav', '1');
      });
    };
    window.addEventListener('nb-navigate', onNavigate);

    // This page just mounted — lift the curtain back UP
    import('gsap').then(({ gsap }) => {
      const curtain = document.getElementById('page-transition-curtain');
      if (!curtain) return;
      gsap.killTweensOf(curtain);
      gsap.to(curtain, {
        y: '-100%',
        duration: 0.55,
        ease: 'power4.inOut',
        delay: 0.05,
        onComplete: () => gsap.set(curtain, { y: '-100%' }),
      });
    });

    return () => {
      window.removeEventListener('nb-navigate', onNavigate);
    };
  }, []);

  return <>{children}</>;
}
