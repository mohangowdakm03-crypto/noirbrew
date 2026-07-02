'use client';
import { usePathname } from 'next/navigation';
import TransitionLink from './TransitionLink';
import { useAppContext } from './AppContext';
import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '/',        label: 'Home'    },
  { href: '/story',   label: 'Story'   },
  { href: '/menu',    label: 'Menu'    },
  { href: '/find',    label: 'Find Us' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const nav      = useRef(null);
  const pathname = usePathname();
  const { cartItems, isCartOpen, setIsCartOpen, user } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let prev = 0;
    const onScroll = () => {
      const cur = window.scrollY;
      if (!nav.current) return;
      nav.current.classList.toggle('scrolled', cur > 80);
      prev = cur;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    <nav className="nav-bar" ref={nav} aria-label="Main navigation">
      <TransitionLink href="/" className="nav-logo">Noir Brew</TransitionLink>
      <ul className="nav-links desktop-links">
        {links.map(l => (
          <li key={l.href}>
            <TransitionLink href={l.href} className={`nav-link-roll ${pathname === l.href ? 'active' : ''}`}>
              <span className="roll-text">
                {l.label.split('').map((char, i) => (
                  <span key={i} style={{ '--i': i }} className="char" data-char={char === ' ' ? '\u00A0' : char}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </TransitionLink>
          </li>
        ))}
      </ul>
      <div style={{ 
        display: 'flex', gap: '2vw', marginLeft: 'auto', alignItems: 'center',
        opacity: isCartOpen ? 0 : 1, pointerEvents: isCartOpen ? 'none' : 'auto', transition: 'opacity 0.3s'
      }}>
        <TransitionLink href="/account" className="magnetic" style={{
          color: 'var(--muted)', fontSize: 'max(10px, .65vw)', textTransform: 'uppercase', letterSpacing: '.18em', textDecoration: 'none'
        }}>
          {user ? 'PROFILE' : 'ACCOUNT'}
        </TransitionLink>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="audio-toggle magnetic"
          style={{
            background: 'transparent', border: 'none', color: 'var(--muted)',
            fontSize: 'max(10px, .65vw)', textTransform: 'uppercase', letterSpacing: '.18em', cursor: 'pointer',
          }}
        >
          CART [{cartItems.reduce((acc, i) => acc + i.qty, 0)}]
        </button>
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? '✕' : '≡'}
        </button>
      </div>
    </nav>
    
    {/* Mobile Menu Overlay */}
    <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
      <button 
        className="mobile-menu-toggle"
        style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '22px' }}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="Close navigation"
      >
        ✕
      </button>
      <ul className="mobile-menu-links">
        {links.map(l => (
          <li key={l.href}>
            <TransitionLink 
              href={l.href} 
              onClick={() => setMobileMenuOpen(false)}
            >
              {l.label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
