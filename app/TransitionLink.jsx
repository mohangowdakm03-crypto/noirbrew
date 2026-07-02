'use client';
import Link from 'next/link';

// Simplest possible TransitionLink — just Next.js Link with prefetch
// No custom JS navigation, no curtains, no event dispatching
// This ensures routing ALWAYS works
export default function TransitionLink({ href, children, className, style, onClick, ...props }) {
  return (
    <Link href={href} prefetch={true} className={className} style={style} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
