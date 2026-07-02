'use client';
import { useEffect } from 'react';
import styles from './find.module.css';

const locations = [
  { id: 1, city: 'London', name: 'Noir Brew Soho', address: '14 Broadwick St, London W1F 8HN', hours: 'Mon-Sun: 7am - 8pm' },
  { id: 2, city: 'New York', name: 'Noir Brew Tribeca', address: '120 West Broadway, New York, NY 10013', hours: 'Mon-Sun: 6am - 7pm' },
  { id: 3, city: 'Tokyo', name: 'Noir Brew Shibuya', address: '1-23-4 Jinnan, Shibuya City, Tokyo', hours: 'Mon-Sun: 8am - 10pm' },
  { id: 4, city: 'Melbourne', name: 'Noir Brew Fitzroy', address: '280 Brunswick St, Fitzroy VIC 3065', hours: 'Mon-Sun: 6:30am - 6pm' },
  { id: 5, city: 'Paris', name: 'Noir Brew Le Marais', address: '18 Rue de Sévigné, 75004 Paris', hours: 'Mon-Sun: 7am - 7pm' },
];

export default function FindPage() {
  useEffect(() => {
    let ctx;
    let splitInstances = [];
    let isMounted = true;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const SplitType = (await import('split-type')).default;
      if (!isMounted) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
      const overlay = document.getElementById('page-intro');
      const logo = document.getElementById('pi-logo');
      const line = document.getElementById('pi-line');
      if (overlay && logo && line) {
        document.body.style.overflow = 'hidden';
        const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; overlay.style.display = 'none'; ScrollTrigger.refresh(); } });
        tl.to(line, { width: '100%', duration: 0.7, ease: 'power3.inOut' }, 0.3)
          .to(logo, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5)
          .to(logo, { letterSpacing: '0.8em', duration: 0.8, ease: 'power2.inOut' }, 0.8)
          .to(overlay, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 1.8)
          .from(`.${styles.header}`, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, 2.2);
      }

      if (typeof SplitType !== 'undefined') {
        const h1 = document.querySelector('h1');
        if (h1) {
          h1.style.perspective = '600px'; h1.style.overflow = 'hidden';
          const sp = new SplitType(h1, { types: 'lines' });
          splitInstances.push(sp);
          gsap.fromTo(sp.lines, { y: 30, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 2.2 });
        }
      }

      gsap.fromTo(`.${styles.locCard}`, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 2.4 });
      gsap.fromTo(`.${styles.mapArea}`, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.inOut', delay: 2.5 });
      }); // end ctx
    })();

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
      splitInstances.forEach(sp => sp.revert());
    };
  }, []);

  return (
    <>
      <div id="page-intro" aria-hidden="true">
        <div className="pi-logo" id="pi-logo">Noir Brew</div>
        <div className="pi-line" id="pi-line" />
      </div>

      <div className={styles.findLayout}>
        <div className={styles.listArea} data-lenis-prevent>
          <div className={styles.header}>
            <div className="p-tag" style={{ marginBottom: '2vw' }}>Global Presence</div>
            <h1 dangerouslySetInnerHTML={{ __html: 'Find your<br /><em style="color: var(--accent)">Sanctuary.</em>' }} />
          </div>
          
          <div className={styles.locList}>
            {locations.map(l => (
              <div key={l.id} className={`${styles.locCard} magnetic`}>
                <div className={styles.lCity}>{l.city}</div>
                <h3>{l.name}</h3>
                <p className={styles.lAddr}>{l.address}</p>
                <p className={styles.lHours}>{l.hours}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.mapArea}>
          {/* Abstract placeholder for map */}
          <div className={styles.mapPlaceholder}>
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity: 0.1 }}>
               <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                 <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--accent)" strokeWidth="0.5"/>
               </pattern>
               <rect width="100" height="100" fill="url(#grid)" />
             </svg>
             <div className={styles.mapOverlayText}>Interactive Map Explorer<br/>(Coming Soon)</div>
          </div>
        </div>
      </div>
    </>
  );
}
