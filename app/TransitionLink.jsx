'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function TransitionLink({ href, children, className, style, onClick, ...props }) {
  const pathname = usePathname();

  const handleClick = useCallback((e) => {
    if (onClick) onClick(e);
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    // Dispatch a custom event — template.jsx listens for this to play the curtain
    // We do NOT prevent default so Next.js Link handles routing natively
    window.dispatchEvent(new CustomEvent('nb-navigate'));
  }, [href, pathname, onClick]);

  return (
    <Link
      href={href}
      prefetch={true}
      className={className}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
