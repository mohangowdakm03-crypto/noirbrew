'use client';
import { useEffect } from 'react';
import styles from './story.module.css';

export default function StoryPage() {
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
      // Intro animation
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

      // Parallax bg
      gsap.to('.ph-bg', {
        y: '20vh',
        scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // Timeline reveal
      const tlObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          gsap.fromTo(entry.target, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      observers.push(tlObs);
      document.querySelectorAll(`.${styles.tlItem}`).forEach(el => tlObs.observe(el));

      // Map reveal
      const mapObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          gsap.fromTo(entry.target, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power4.inOut' });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      observers.push(mapObs);
      const map = document.querySelector(`.${styles.mapWrap}`);
      if (map) mapObs.observe(map);

      // Text reveal
      if (typeof SplitType !== 'undefined') {
        const textObs = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el._splitDone) return; el._splitDone = true;
            const sp = new SplitType(el, { types: 'lines' });
            splitInstances.push(sp);
            gsap.fromTo(sp.lines, { y: 30, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', transformOrigin: '0% 50% -10px' });
            obs.unobserve(el);
          });
        }, { threshold: 0.1 });
        observers.push(textObs);
        document.querySelectorAll('h1, h2, h3').forEach(el => {
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
      splitInstances.forEach(sp => sp.revert());
      observers.forEach(obs => obs.disconnect());
      clearTimeout(rsT);
    };
  }, []);

  return (
    <>
      <div id="page-intro" aria-hidden="true">
        <div className="pi-logo" id="pi-logo">Noir Brew</div>
        <div className="pi-line" id="pi-line" />
      </div>

      <section className="page-hero">
        <div className="ph-bg" style={{ backgroundImage: 'url(/story-founders.jpg)' }} aria-hidden="true" />
        <div className="ph-content">
          <div className="ph-tag">Our Heritage</div>
          <h1 dangerouslySetInnerHTML={{ __html: 'A Century<br />of <em style="color: var(--accent)">Obsession.</em>' }} />
        </div>
      </section>

      <section className={styles.introSec}>
        <div className={styles.quoteBlock}>
          <h3 dangerouslySetInnerHTML={{ __html: '"Coffee is not merely a drink. It is a vessel for time, place, and the relentless pursuit of perfection."' }} />
          <p className={styles.quoteAuthor}>— Arthur Vance, Founder, 1924</p>
        </div>
      </section>

      <section className={styles.timelineSec}>
        <div className={styles.tlLine} aria-hidden="true" />
        {[
          { year: '1924', title: 'The First Roast', desc: 'Arthur Vance opens a small roasting facility in a converted warehouse, determined to create a dark roast without the bitter burn.' },
          { year: '1960', title: 'The Triple Filter', desc: 'The second generation pioneers our signature triple-filtration process, unlocking unprecedented smoothness in dark extraction.' },
          { year: '1990', title: 'Global Sourcing', desc: 'We expand our direct-trade relationships to five continents, selecting only the top 1% of high-altitude beans.' },
          { year: '2024', title: 'A Century Later', desc: '100 years of unbroken tradition. The same facility, the same process, the same unrelenting standard.' }
        ].map((item, i) => (
          <div key={item.year} className={`${styles.tlItem} ${i % 2 === 0 ? styles.tlLeft : styles.tlRight}`}>
            <div className={styles.tlDot} aria-hidden="true" />
            <div className={styles.tlYear}>{item.year}</div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </section>

      <section className={styles.mapSec}>
        <div className={styles.mapHeader}>
          <h2 dangerouslySetInnerHTML={{ __html: 'The Sourcing<br /><em style="color: var(--accent)">Journey</em>' }} />
          <p>We scour the globe for regions where altitude, soil, and climate converge to produce beans capable of withstanding our intense roasting process.</p>
        </div>
        <div className={styles.mapWrap}>
           {/* Abstract world map placeholder */}
          <svg viewBox="0 0 1000 500" className={styles.worldMap}>
            <path d="M100,200 Q150,150 200,200 T300,250 T400,200 T500,250 T600,150 T700,200 T800,100 T900,150" fill="none" stroke="rgba(200,169,110,.2)" strokeWidth="2" strokeDasharray="5,5"/>
             {/* Origin Points */}
             {[
               { cx: 200, cy: 200, label: 'Colombia' },
               { cx: 300, cy: 350, label: 'Brazil' },
               { cx: 550, cy: 250, label: 'Ethiopia' },
               { cx: 600, cy: 300, label: 'Kenya' },
               { cx: 800, cy: 220, label: 'Vietnam' }
             ].map((pt, i) => (
               <g key={i}>
                 <circle cx={pt.cx} cy={pt.cy} r="6" fill="var(--accent)" />
                 <circle cx={pt.cx} cy={pt.cy} r="16" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5">
                   <animate attributeName="r" values="6;24" dur="2s" repeatCount="indefinite"/>
                   <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
                 </circle>
                 <text x={pt.cx + 15} y={pt.cy + 4} fill="var(--white)" fontSize="12" fontFamily="Inter, sans-serif" letterSpacing="0.1em">{pt.label}</text>
               </g>
             ))}
          </svg>
        </div>
      </section>
    </>
  );
}
