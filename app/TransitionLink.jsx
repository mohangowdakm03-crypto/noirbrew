'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function TransitionLink({ href, children, className, style, ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTransition = useCallback(async (e) => {
    e.preventDefault();
    if (pathname === href) return;

    // Play exit animation (dark curtain sweeps down)
    const { gsap } = await import('gsap');
    
    // Create curtain if it doesn't exist
    let curtain = document.getElementById('page-transition-curtain');
    if (!curtain) {
      curtain = document.createElement('div');
      curtain.id = 'page-transition-curtain';
      Object.assign(curtain.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050505',
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'translateY(-100%)'
      });
      document.body.appendChild(curtain);
    }

    gsap.to(curtain, {
      y: '0%',
      duration: 0.6,
      ease: 'power4.inOut',
      onComplete: () => {
        // Push the route once the curtain covers the screen
        router.push(href);
      }
    });

  }, [href, pathname, router]);

  return (
    <a href={href} onClick={handleTransition} className={className} style={style} {...props}>
      {children}
    </a>
  );
}
