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
    // Set flag so destination pages skip their own intro animation
    // (the page renders immediately, no 2.6s boot sequence needed)
    sessionStorage.setItem('nb_client_nav', '1');
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
