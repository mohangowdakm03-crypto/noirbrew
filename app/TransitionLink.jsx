'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

// All navigable routes — prefetched on mount so their JS chunks are ready before user clicks
const ALL_ROUTES = ['/', '/story', '/menu', '/find', '/contact', '/account'];

export default function TransitionLink({ href, children, className, style, onClick, ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  // Eagerly prefetch every route on mount so no network delay on click
  useEffect(() => {
    ALL_ROUTES.forEach(route => router.prefetch(route));
  }, [router]);

  const handleTransition = useCallback(async (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    if (pathname === href) return;

    // Play exit curtain animation
    const { gsap } = await import('gsap');

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

    // Navigate immediately — page is already prefetched so it's instant.
    // The curtain plays in parallel and template.jsx lifts it once the new page mounts.
    // Flag so the destination page skips its own intro animation (the curtain already handles it)
    sessionStorage.setItem('nb_client_nav', '1');
    router.push(href);

    gsap.to(curtain, {
      y: '0%',
      duration: 0.45,
      ease: 'power4.inOut',
    });

  }, [href, pathname, router, onClick]);

  return (
    <a href={href} onClick={handleTransition} className={className} style={style} {...props}>
      {children}
    </a>
  );
}
