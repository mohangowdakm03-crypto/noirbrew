'use client';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import styles from './menu.module.css';
import Image from 'next/image';

const coffees = [
  { id: 1, name: 'Ethiopian Highlands', region: 'East Africa', roast: 'Light', notes: 'Jasmine, Bergamot, Honey', desc: 'A delicate, floral cup that opens the palate with bright citrus acidity.', price: '$24' },
  { id: 2, name: 'Brazilian Cerrado', region: 'South America', roast: 'Medium', notes: 'Hazelnut, Cocoa, Caramel', desc: 'Smooth and nutty with a heavy body and lingering sweet finish.', price: '$22' },
  { id: 3, name: 'Colombian Andes', region: 'South America', roast: 'Medium', notes: 'Red Apple, Panela, Milk Chocolate', desc: 'Classic profile with perfect balance of sweetness and acidity.', price: '$24' },
  { id: 4, name: 'Vietnamese Dalat', region: 'Southeast Asia', roast: 'Dark', notes: 'Dark Chocolate, Tobacco, Spice', desc: 'Intense and earthy, providing the deep, brooding backbone of our signature blend.', price: '$26' },
  { id: 5, name: 'Kenyan Nyeri', region: 'East Africa', roast: 'Medium', notes: 'Blackcurrant, Tomato, Wine', desc: 'Complex savory-sweet profile with a syrupy mouthfeel.', price: '$28' },
  { id: 6, name: 'Sumatra Mandheling', region: 'Southeast Asia', roast: 'Dark', notes: 'Cedar, Earth, Dark Cocoa', desc: 'Heavy, syrupy body with intense earthy and herbaceous notes.', price: '$25' },
  { id: 7, name: 'Guatemala Antigua', region: 'Central America', roast: 'Medium', notes: 'Baking Chocolate, Apple, Smoke', desc: 'Rich and velvety with a distinct smoky finish from volcanic soil.', price: '$24' },
  { id: 8, name: 'Costa Rica Tarrazu', region: 'Central America', roast: 'Light', notes: 'Citrus, Honey, Milk Chocolate', desc: 'Exceptionally clean and bright with crisp acidity.', price: '$26' },
  { id: 9, name: 'Noir Signature Blend', region: 'Global', roast: 'Dark', notes: 'Dark Chocolate, Charred Oak, Velvet', desc: 'Our century-old recipe. The perfect balance of depth and smoothness.', price: '$32' },
  { id: 10, name: 'Yemen Mocha', region: 'Middle East', roast: 'Light', notes: 'Dried Fruit, Cardamom, Wine', desc: 'Wild, complex, and intensely fruity with exotic spice notes.', price: '$35' },
  { id: 11, name: 'Kona Extra Fancy', region: 'Hawaii', roast: 'Medium', notes: 'Macadamia, Butter, Brown Sugar', desc: 'Incredibly smooth, sweet, and nutty with zero bitterness.', price: '$45' },
];

export default function MenuPage() {
  const [filter, setFilter] = useState('All');
  const { addToCart, isCartOpen } = useAppContext();
  
  // Customizer State
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [grind, setGrind] = useState('Whole Bean');
  const [size, setSize] = useState('250g');
  const modalRef = useRef(null);

  const openCustomizer = (coffee) => {
    setSelectedCoffee(coffee);
    setGrind('Whole Bean');
    setSize('250g');
    import('gsap').then(({ gsap }) => {
      gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3, ease: 'power2.out' });
    });
  };

  const closeCustomizer = () => {
    import('gsap').then(({ gsap }) => {
      gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, ease: 'power2.in', onComplete: () => setSelectedCoffee(null) });
    });
  };

  const handleAddToCart = () => {
    if (!selectedCoffee) return;
    
    // Parse price
    const numPrice = parseFloat(selectedCoffee.price.replace('$', ''));
    let multiplier = 1;
    if (size === '500g') multiplier = 1.8;
    if (size === '1kg') multiplier = 3.2;

    addToCart({
      id: selectedCoffee.id,
      name: selectedCoffee.name,
      image: '/product.jpg',
      grind,
      size,
      price: (numPrice * multiplier).toFixed(2),
      qty: 1
    });
    
    closeCustomizer();
  };

  const filtered = filter === 'All' ? coffees : coffees.filter(c => c.roast === filter || (filter === 'Single Origin' && c.region !== 'Global'));

  useEffect(() => {
    let ctx;
    let splitInstances = [];
    let observers = [];
    let rsT;
    let isMounted = true;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const SplitType = (await import('split-type')).default;
      if (!isMounted) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
      // Page intro
      const overlay = document.getElementById('page-intro');
      const logo = document.getElementById('pi-logo');
      const line = document.getElementById('pi-line');
      if (overlay && logo && line) {
        const isClientNav = sessionStorage.getItem('nb_client_nav');
        if (isClientNav) {
          sessionStorage.removeItem('nb_client_nav');
          overlay.style.display = 'none';
          ScrollTrigger.refresh();
        } else {
          document.body.style.overflow = 'hidden';
          const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; overlay.style.display = 'none'; ScrollTrigger.refresh(); } });
          tl.to(line, { width: '100%', duration: 0.7, ease: 'power3.inOut' }, 0.3)
            .to(logo, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5)
            .to(logo, { letterSpacing: '0.8em', duration: 0.8, ease: 'power2.inOut' }, 0.8)
            .to(overlay, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 1.8)
            .from('.page-hero', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 2.2);
        }
      }

      // Parallax
      try {
        gsap.to('.ph-bg', {
          y: '20vh',
          scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      } catch(e) {}

      // Text reveal
      if (typeof SplitType !== 'undefined') {
        const textObs = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el._splitDone) return; el._splitDone = true;
            try {
              const sp = new SplitType(el, { types: 'lines' });
              splitInstances.push(sp);
              if (sp.lines && sp.lines.length > 0) {
                gsap.fromTo(sp.lines, { y: 30, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', transformOrigin: '0% 50% -10px' });
              }
            } catch(e) {}
            obs.unobserve(el);
          });
        }, { threshold: 0.1 });
        observers.push(textObs);
        document.querySelectorAll('h1').forEach(el => {
          if (el.closest('#page-intro')) return;
          el.style.perspective = '600px'; el.style.overflow = 'hidden';
          textObs.observe(el);
        });
      }

      let rsFn = () => { clearTimeout(rsT); rsT = setTimeout(() => ScrollTrigger.refresh(), 300); };
      window.addEventListener('resize', rsFn);
      
      return () => {
        window.removeEventListener('resize', rsFn);
      };
      }); // end ctx
    })();

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
      observers.forEach(obs => obs.disconnect());
      clearTimeout(rsT);
    };
  }, []);

  // Re-animate grid when filter changes
  useEffect(() => {
    (async () => {
      const { gsap } = await import('gsap');
      gsap.fromTo(`.${styles.menuCard}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
    })();
  }, [filter]);

  return (
    <>
      <div id="page-intro" aria-hidden="true">
        <div className="pi-logo" id="pi-logo">Noir Brew</div>
        <div className="pi-line" id="pi-line" />
      </div>

      <section className="page-hero" style={{ height: '50vh' }}>
        <div className="ph-bg" style={{ backgroundImage: 'url(/menu-products.jpg)' }} aria-hidden="true" />
        <div className="ph-content">
          <div className="ph-tag">The Collection</div>
          <h1 dangerouslySetInnerHTML={{ __html: 'Crafted<br /><em style="color: var(--accent)">Varieties.</em>' }} />
        </div>
      </section>

      <section className={styles.menuSec}>
        <div className={styles.filterBar}>
          {['All', 'Light', 'Medium', 'Dark', 'Single Origin'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`${styles.filterBtn} ${filter === f ? styles.active : ''} magnetic`}>
              {f}
            </button>
          ))}
        </div>

        <div className={styles.menuGrid}>
          {filtered.map(c => (
            <div key={c.id} className={`${styles.menuCard} menu-card`}>
              <div className={styles.cardInner}>
                {/* Front */}
                <div className={styles.cardFront}>
                  <div className={styles.cardImgWrap}>
                    <Image src="/product.jpg" alt={c.name} fill style={{ objectFit: 'contain' }} />
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cRegion}>{c.region}</div>
                    <div className={styles.cName}>{c.name}</div>
                    <div className={styles.cPrice}>{c.price}</div>
                  </div>
                </div>
                {/* Back */}
                <div className={styles.cardBack}>
                  <div className={styles.bNotesLabel}>Tasting Notes</div>
                  <div className={styles.bNotes}>{c.notes}</div>
                  <p className={styles.bDesc}>{c.desc}</p>
                  <div className={styles.bMeta}>
                    <span>Roast: {c.roast}</span>
                    <span>{c.price}</span>
                  </div>
                  <button onClick={() => openCustomizer(c)} className={`btn-outline ${styles.addBtn}`}>Configure & Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customizer Modal */}
      <div 
        ref={modalRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          opacity: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          width: 'min(90vw, 500px)',
          padding: '3vw',
          position: 'relative'
        }}>
          <button onClick={closeCustomizer} style={{ position: 'absolute', top: '1.5vw', right: '1.5vw', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
          
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '0.5rem', marginTop: 0 }}>
            {selectedCoffee?.name}
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: '2vw' }}>{selectedCoffee?.desc}</p>

          <div style={{ marginBottom: '1.5vw' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.5vw' }}>Grind</div>
            <div style={{ display: 'flex', gap: '0.5vw' }}>
              {['Whole Bean', 'Espresso', 'Filter', 'French Press'].map(g => (
                <button 
                  key={g} 
                  onClick={() => setGrind(g)}
                  style={{
                    flex: 1, padding: '0.8vw', background: grind === g ? 'rgba(200,169,110,0.1)' : 'transparent',
                    border: `1px solid ${grind === g ? 'var(--accent)' : 'var(--border)'}`, color: grind === g ? 'var(--accent)' : 'var(--white)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >{g}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5vw' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.5vw' }}>Size</div>
            <div style={{ display: 'flex', gap: '0.5vw' }}>
              {['250g', '500g', '1kg'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setSize(s)}
                  style={{
                    flex: 1, padding: '0.8vw', background: size === s ? 'rgba(200,169,110,0.1)' : 'transparent',
                    border: `1px solid ${size === s ? 'var(--accent)' : 'var(--border)'}`, color: size === s ? 'var(--accent)' : 'var(--white)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          <button onClick={handleAddToCart} className="btn-filled magnetic" style={{ width: '100%', justifyContent: 'center' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}
