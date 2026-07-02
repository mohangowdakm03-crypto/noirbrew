'use client';
import { useEffect } from 'react';
import TransitionLink from './TransitionLink';
import styles from './home.module.css';

export default function HomePage() {
  useEffect(() => {
    let ctx;
    let splitInstances = [];
    let observers = [];
    let rsT;
    let intervals = [];
    let isMounted = true;

    (async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const SplitType         = (await import('split-type')).default;
      if (!isMounted) return;
      gsap.registerPlugin(ScrollTrigger);
      // Store on window so cleanup can access them synchronously
      window.__gsap = gsap;
      window.__ST   = ScrollTrigger;

      ctx = gsap.context(() => {
        /* ---- Intro overlay ---- */
        const overlay = document.getElementById('page-intro');
      const logo    = document.getElementById('pi-logo');
      const line    = document.getElementById('pi-line');
      if (overlay && logo && line) {
        document.body.style.overflow = 'hidden';
        const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; overlay.style.display = 'none'; ScrollTrigger.refresh(); } });
        tl.to(line,    { width: '100%', duration: .7, ease: 'power3.inOut' }, .3)
          .to(logo,    { opacity: 1, duration: .6, ease: 'power2.out' }, .5)
          .to(logo,    { letterSpacing: '0.8em', duration: .8, ease: 'power2.inOut' }, .8)
          .to(overlay, { yPercent: -100, duration: .8, ease: 'power4.inOut' }, 1.8)
          .from('.pinned-hero', { opacity: 0, duration: .5, ease: 'power2.out' }, 2.2);
      }

      /* ---- Hero pin ---- */
      ScrollTrigger.create({ trigger: '.pinned-hero', start: 'top top', end: '+=900', pin: true });
      ScrollTrigger.create({ trigger: '#hero-bg', start: 'top top', end: '+=900', pin: true, pinSpacing: false });

      const heroP = (el, x, y) => {
        const node = document.querySelector(el);
        if (node) {
          gsap.to(el, { x, y, ease:'none', scrollTrigger:{trigger:'.pinned-hero',start:'top top',end:'+=900',scrub:true} });
        }
      };
      heroP('#hleaf1', '-4vw', '14vh');   heroP('#hleaf2', '5vw', '-11vh');
      heroP('#hstamp', '2vw', '-5vh');    heroP('#hibox1', '-2.5vw', '7vh');
      heroP('#hibox2', '3vw', '-5vh');
      gsap.to('.hero-ring-1', { y:'6vh',    ease:'none', scrollTrigger:{trigger:'.pinned-hero',start:'top top',end:'+=900',scrub:true} });
      gsap.to('.hero-ring-2', { y:'-3.5vh', ease:'none', scrollTrigger:{trigger:'.pinned-hero',start:'top top',end:'+=900',scrub:true} });
      gsap.to('#hero-product',{ y:'-8vh', scale:1.05, ease:'none', scrollTrigger:{trigger:'.pinned-hero',start:'top top',end:'+=900',scrub:true} });

      /* ---- Horizontal scroll ---- */
      const hTrack = document.getElementById('h-track');
      let horizontalTween;
      if (hTrack) {
        horizontalTween = gsap.to(hTrack, {
          x: () => -(hTrack.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: { trigger: '.h-overflow', start:'top top', end: () => '+=' + (hTrack.scrollWidth - window.innerWidth), scrub:1, pin:true, anticipatePin:1, invalidateOnRefresh:true },
        });
      }

      /* ---- Heading char splits ---- */
      const headObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el._splitDone) return; el._splitDone = true;
          el.style.perspective = '600px'; el.style.overflow = 'hidden';
          const isLarge = el.matches('h1,h2');
          const sp = new SplitType(el, { types: isLarge ? 'chars,words' : 'lines' });
          splitInstances.push(sp);
          const targets = isLarge ? sp.chars : sp.lines;
          gsap.fromTo(targets, { y:'110%', opacity:0, rotateX:-60 }, { y:0, opacity:1, rotateX:0, duration: isLarge?.55:.7, stagger: isLarge?.025:.06, ease:'power3.out', transformOrigin:'0% 50% -30px' });
          obs.unobserve(el);
        });
      }, { threshold: 0.05 });
      observers.push(headObs);
      document.querySelectorAll('h1,h2,h3').forEach(el => headObs.observe(el));

      /* ---- Clip-path image reveals ---- */
      document.querySelectorAll('.img-reveal').forEach(el => {
        const isHorizontal = !!el.closest('#h-track');
        gsap.to(el, {
          clipPath:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration:1.1, ease:'power4.inOut',
          scrollTrigger: {
            trigger: el,
            containerAnimation: isHorizontal ? horizontalTween : null,
            start: isHorizontal ? 'left 90%' : 'top 90%',
          }
        });
      });

      /* ---- Section entrances ---- */
      const sectObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          gsap.to(entry.target, { opacity:1, y:0, duration:.9, ease:'power3.out' });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.06 });
      observers.push(sectObs);
      document.querySelectorAll('.sect-enter').forEach(el => sectObs.observe(el));

      /* ---- Typewriter boxes ---- */
      const twObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el._twDone) return; el._twDone = true;
          const text = el.textContent.trim(); el.textContent = '';
          let i = 0;
          const iv = setInterval(() => { el.textContent += text[i]; if (++i >= text.length) clearInterval(iv); }, 40);
          intervals.push(iv);
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });
      observers.push(twObs);
      document.querySelectorAll('.tw-box').forEach(el => twObs.observe(el));

      /* ---- Stat counters ---- */
      const statT = { 'stat-1': 11, 'stat-2': 5, 'stat-3': 100 };
      const statObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target; const target = statT[el.id]; if (!target) return;
          let cur = 0; const step = target / 60;
          const iv = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = Math.floor(cur); if (cur >= target) { el.textContent = target; clearInterval(iv); } }, 16);
          intervals.push(iv);
          obs.unobserve(el);
        });
      }, { threshold: 0.3 });
      observers.push(statObs);
      ['stat-1','stat-2','stat-3'].forEach(id => { const el = document.getElementById(id); if (el) statObs.observe(el); });

      /* ---- Feature cards ---- */
      gsap.fromTo('#feat-grid .feat-card', { y:55, opacity:0, scale:.96 }, { y:0, opacity:1, scale:1, stagger:.08, duration:.7, ease:'power3.out', scrollTrigger:{ trigger:'#feat-grid', start:'top 85%' } });

      /* ---- Origin cards ---- */
      gsap.fromTo('.origin-card', { x:60, opacity:0 }, { x:0, opacity:1, stagger:.1, duration:.65, ease:'power3.out', scrollTrigger:{ trigger:'.origins-section', start:'top 85%' } });

      /* ---- Magnetic ---- */
      document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x:(e.clientX - r.left - r.width/2)*.28, y:(e.clientY - r.top - r.height/2)*.28, duration:.4, ease:'power2.out' });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x:0, y:0, duration:.6, ease:'elastic.out(1,.4)' }));
      });

      /* ---- Product mouse parallax ---- */
      const ps = document.querySelector('.product-section');
      if (ps) {
        ps.addEventListener('mousemove', e => {
          const r = ps.getBoundingClientRect();
          const rx = (e.clientX - r.left)/r.width - .5;
          const ry = (e.clientY - r.top)/r.height - .5;
          gsap.to('#prod-img',     { x:rx*22, y:ry*16, duration:.7, ease:'power2.out' });
          gsap.to('.prod-glow',    { x:rx*-14, y:ry*-10, duration:.9, ease:'power2.out' });
          gsap.to('.prod-tag',     { x:rx*10, y:ry*8, duration:.6, ease:'power2.out', stagger:.05 });
          gsap.to('.prod-bg-text', { x:rx*-40, y:ry*-20, duration:1.1, ease:'power2.out' });
        });
        ps.addEventListener('mouseleave', () => gsap.to(['#prod-img','.prod-glow','.prod-tag','.prod-bg-text'], { x:0, y:0, duration:.9, ease:'power2.out' }));
      }

      /* ---- Parallax scrolls ---- */
      gsap.to('#prod-img',      { y:'-5vh', scrollTrigger:{ trigger:'.product-section', start:'top bottom', end:'bottom top', scrub:1 } });
      gsap.to('.prod-bg-text',  { x:'-7vw', scrollTrigger:{ trigger:'.product-section', start:'top bottom', end:'bottom top', scrub:1 } });
      gsap.to('.cta-bg-text',   { y:'9vh',  scrollTrigger:{ trigger:'.cta-section', start:'top bottom', end:'bottom top', scrub:1 } });

      /* ---- BG color shift ---- */
      [
        { trigger:'.pinned-hero',      bg:'#09090b' },
        { trigger:'#story',            bg:'#0d0d10' },
        { trigger:'.stats-section',    bg:'#3b1219' },
        { trigger:'.product-section',  bg:'#09090b' },
        { trigger:'.features-section', bg:'#0f0f12' },
        { trigger:'.origins-section',  bg:'#09090b' },
        { trigger:'.cta-section',      bg:'#0b0b0d' },
      ].forEach(({ trigger, bg }) => ScrollTrigger.create({ trigger, start:'top 60%', onEnter:()=>gsap.to('body',{backgroundColor:bg,duration:1.2,ease:'power2.inOut'}), onEnterBack:()=>gsap.to('body',{backgroundColor:bg,duration:1.2,ease:'power2.inOut'}) }));

      /* ---- Origins drag scroll ---- */
      const row = document.getElementById('origins-row');
      if (row) {
        let down=false, sx=0, sl=0;
        row.addEventListener('mousedown', e => { down=true; row.style.cursor='grabbing'; sx=e.pageX-row.offsetLeft; sl=row.scrollLeft; });
        row.addEventListener('mouseleave', () => { down=false; row.style.cursor='grab'; });
        row.addEventListener('mouseup',    () => { down=false; row.style.cursor='grab'; });
        row.addEventListener('mousemove',  e => { if(!down)return; e.preventDefault(); row.scrollLeft=sl-(e.pageX-row.offsetLeft-sx)*1.5; });
      }

      let rsFn = () => { clearTimeout(rsT); rsT = setTimeout(()=>ScrollTrigger.refresh(), 300); };
      window.addEventListener('resize', rsFn);
      
      return () => {
        window.removeEventListener('resize', rsFn);
      };
      }); // end ctx
    })();

    return () => {
      isMounted = false;
      // Restore body state immediately — critical if user navigates mid-intro
      document.body.style.overflow = '';
      document.body.style.backgroundColor = '';
      // Kill body tween (BG color transition) cleanly
      try {
        if (window.__gsap) window.__gsap.killTweensOf('body');
      } catch(e) {}
      if (ctx) { try { ctx.revert(); } catch(e) {} }
      observers.forEach(obs => obs.disconnect());
      intervals.forEach(iv => clearInterval(iv));
      clearTimeout(rsT);
    };
  }, []);

  return (
    <>
      {/* Intro overlay */}
      <div id="page-intro" aria-hidden="true">
        <div className="pi-logo" id="pi-logo">Noir Brew</div>
        <div className="pi-line" id="pi-line" />
      </div>

      {/* ===== HERO BACKGROUND (Pinned separately to sit behind Atmosphere) ===== */}
      <div id="hero-bg" className={styles.heroBg} style={{
        backgroundImage:'url(/hero.jpg)', backgroundSize:'cover', backgroundPosition:'center center',
        filter:'brightness(1.05) saturate(1.15)',
      }} aria-hidden="true">
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(9,9,11,0.2) 0%, transparent 20%, transparent 80%, rgba(9,9,11,0.95) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(9,9,11,0.35) 0%, transparent 15%, transparent 85%, rgba(9,9,11,0.35) 100%)' }} />
      </div>

      {/* ===== HERO ===== */}
      <div className="hero-pin-wrapper">
        <section className={`pinned-hero ${styles.hero}`} id="hero">

          {/* ── MAIN TITLE ── */}
          <div style={{
            position:'absolute', bottom:'18%', left:0, right:0,
            textAlign:'center', zIndex:10, pointerEvents:'none'
          }} aria-hidden="true">
            <div style={{
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:'clamp(64px, 11vw, 180px)',
              fontWeight:300,
              letterSpacing:'0.06em',
              lineHeight:0.9,
              color:'rgba(240,237,232,0.92)',
              textTransform:'uppercase',
              textShadow:'0 4px 60px rgba(0,0,0,0.8)',
            }}>
              TASTE<br/>
              <em style={{color:'var(--accent)', fontStyle:'italic', letterSpacing:'0.04em'}}>the Dark</em>
            </div>
          </div>

          {/* ── EYEBROW TAG ── */}
          <div style={{
            position:'absolute', top:'18%', left:'50%', transform:'translateX(-50%)',
            zIndex:10, textAlign:'center', pointerEvents:'none'
          }}>
            <div style={{
              fontSize:'max(9px, 0.65vw)', letterSpacing:'0.35em',
              textTransform:'uppercase', color:'var(--accent)', opacity:0.8
            }}>Single Origin · Est. 1924</div>
          </div>

          {/* Stamp */}
          <div id="hstamp" className={styles.stamp} style={{top:'14%',right:'5%', zIndex:10}}>
            <svg viewBox="0 0 120 120" width="max(60px,6vw)" height="max(60px,6vw)" fill="none" style={{animation:'stampSpin 22s linear infinite',display:'block'}}>
              <circle cx="60" cy="60" r="55" stroke="#c8a96e" strokeWidth=".5" strokeOpacity=".55"/>
              <circle cx="60" cy="60" r="46" stroke="#c8a96e" strokeWidth=".4" strokeDasharray="3 6" strokeOpacity=".4"/>
              <text fontFamily="Inter,sans-serif" fontSize="8.2" fill="#c8a96e" fillOpacity=".65" letterSpacing="2.8">
                <textPath href="#sp1">PREMIUM · SINGLE ORIGIN · NOIR BREW ·</textPath>
              </text>
              <defs><path id="sp1" d="M60,14 A46,46 0 1,1 59.99,14"/></defs>
              <text x="60" y="54" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="12" fill="#c8a96e" fillOpacity=".6" fontWeight="300">EST.</text>
              <text x="60" y="73" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="18" fill="#c8a96e" fillOpacity=".78" fontWeight="300">1924</text>
            </svg>
          </div>

          {/* Info boxes */}
          <div id="hibox1" className={styles.infoBox} style={{top:'42%',left:'4%', zIndex:10}}><div className={styles.ibLabel}>Origin</div><div className={styles.ibValue}>Ethiopia<br/>& Brazil</div></div>
          <div id="hibox2" className={styles.infoBox} style={{top:'42%',right:'4%',rotate:'-1deg', zIndex:10}}><div className={styles.ibLabel}>Process</div><div className={styles.ibValue}>Triple<br/>Filtered</div></div>

          {/* Scroll cue */}
          <div className={styles.scrollCue} aria-hidden="true" style={{zIndex:10}}>
            <span>Scroll</span>
            <div className={styles.scrollLine} />
          </div>

          {/* Marquee */}
          <div style={{marginTop:'auto', position:'relative', zIndex:10}}>
            <div className="marquee-wrap" style={{borderTop:'1px solid rgba(200,169,110,0.15)'}} aria-hidden="true">
              <div className="marquee-track">
                {['TASTE THE DARK','NOIR BREW','TASTE THE DARK','NOIR BREW','TASTE THE DARK','NOIR BREW','TASTE THE DARK','NOIR BREW'].map((t,i) => (
                  <span key={i} className={i%2===0 ? 'm-item' : 'm-sep'} style={{color: i%2!==0 ? 'var(--accent)':undefined}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== HORIZONTAL STORY ===== */}
      <div className="horizontal-pin-wrapper">
        <div className="h-overflow" id="story">
          <div className="h-track" id="h-track" style={{display:'flex',width:'max-content'}}>

          {/* Panel 1 */}
          <div className={styles.hPanel1}>
            <div className={styles.pContent}>
              <div className="p-tag">01 — The Story</div>
              <h2 dangerouslySetInnerHTML={{ __html: 'A century<br/>of <em style="color:var(--accent)">darkness</em>' }} />
              <p style={{maxWidth:'32ch'}}>Born in 1924 from a single obsession: the perfect dark roast. No shortcuts. No compromises.</p>
              <div className="tw-box" style={{alignSelf:'flex-start'}} dangerouslySetInnerHTML={{ __html: 'Since 1924' }} />
            </div>
            <div className={styles.pFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/story.jpg" alt="Raw coffee beans" className="img-reveal" loading="lazy" />
              <div className={styles.pFrameLabel}>Hand-selected · Ethiopia</div>
            </div>
            <div className={styles.cornerLabel} aria-hidden="true">01 / 03</div>
          </div>

          {/* Panel 2 divider */}
          <div className={styles.hPanel2} aria-hidden="true">
            <span className={styles.vertText}>Continue →</span>
            <div className={styles.midCircle}>
              <svg viewBox="0 0 80 80" width="max(65px,7.5vw)" height="max(65px,7.5vw)" fill="none" style={{animation:'stampSpin 18s linear infinite'}}>
                <circle cx="40" cy="40" r="36" stroke="rgba(200,169,110,.18)" strokeWidth=".6"/>
                <text fontFamily="Cormorant Garamond,serif" fontSize="8" fill="rgba(200,169,110,.5)" letterSpacing="2"><textPath href="#cp1">NOIR BREW · DARK ROAST ·</textPath></text>
                <defs><path id="cp1" d="M40,4 A36,36 0 1,1 39.99,4"/></defs>
                <text x="40" y="43" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="10" fill="rgba(200,169,110,.7)" fontWeight="300">NB</text>
              </svg>
            </div>
          </div>

          {/* Panel 3 */}
          <div className={styles.hPanel3}>
            <div className={styles.pContent}>
              <div className="p-tag">02 — The Origin</div>
              <h2 dangerouslySetInnerHTML={{ __html: 'Sourced<br/>across<br/><em style="color:var(--accent)">5 continents</em>' }} />
              <p style={{maxWidth:'32ch'}}>Eleven distinct varieties, each handpicked at peak harvest from the world's rarest growing regions.</p>
              <div className="tw-box" style={{alignSelf:'flex-start',marginTop:'.5vw'}} dangerouslySetInnerHTML={{ __html: '11 varieties' }} />
            </div>
            <div className={styles.rotGraphic} aria-hidden="true">
              <svg viewBox="0 0 200 200" width="max(180px,19vw)" height="max(180px,19vw)" fill="none" style={{animation:'stampSpin 28s linear infinite',display:'block'}}>
                <circle cx="100" cy="100" r="94" stroke="rgba(200,169,110,.1)" strokeWidth=".7"/>
                <circle cx="100" cy="100" r="70" stroke="rgba(200,169,110,.07)" strokeWidth=".6" strokeDasharray="4 8"/>
                <circle cx="100" cy="100" r="46" stroke="rgba(200,169,110,.14)" strokeWidth=".5"/>
                <text fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(200,169,110,.5)" letterSpacing="3.5"><textPath href="#cp2">ETHIOPIA · BRAZIL · COLOMBIA · VIETNAM · KENYA ·</textPath></text>
                <defs><path id="cp2" d="M100,6 A94,94 0 1,1 99.99,6"/></defs>
                <text x="100" y="93" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="30" fill="rgba(200,169,110,.75)" fontWeight="300">5</text>
                <text x="100" y="110" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(200,169,110,.45)" letterSpacing="2">ORIGINS</text>
              </svg>
            </div>
            <div className={styles.cornerLabel} aria-hidden="true">03 / 03</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <section className={`stats-section ${styles.statsSec}`} id="origin">
        <div className="s-label sect-enter" style={{fontSize:'max(9px,.65vw)',letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(200,169,110,.6)',marginBottom:'3vw'}}>By the numbers</div>
        <h2 dangerouslySetInnerHTML={{ __html: 'Obsession<br/>measured in <em style="color:var(--accent)">detail</em>' }} />
        <div className={styles.statsGrid}>
          {[{id:'stat-1',lbl:'Unique Ingredients'},{id:'stat-2',lbl:'Global Origins'},{id:'stat-3',lbl:'Years of Craft'}].map(s => (
            <div key={s.id} className={styles.statCell}>
              <div className="s-num" id={s.id} style={{fontFamily:'Cormorant Garamond,serif',fontSize:'max(60px,5vw)',color:'var(--accent)',lineHeight:1,fontVariantNumeric:'tabular-nums'}} dangerouslySetInnerHTML={{ __html: '0' }} />
              <div className="s-lbl" style={{fontSize:'max(10px,.75vw)',letterSpacing:'.12em',textTransform:'uppercase',marginTop:'1vw',color:'var(--muted)'}}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <svg className={styles.mountain} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 L0,45 L120,22 L240,50 L400,10 L560,48 L720,12 L880,46 L1040,8 L1200,40 L1320,18 L1440,38 L1440,80 Z" fill="#09090b"/>
        </svg>
      </section>

      {/* ===== PRODUCT ===== */}
      <section className={`product-section ${styles.prodSec}`} id="brew">
        <div className={styles.prodText}>
          <div className={styles.prodEyebrow}>The Craft</div>
          <h2 dangerouslySetInnerHTML={{ __html: 'Darkness<br/>perfected<br/><em style="color:var(--accent)">drop by drop</em>' }} />
          <p>Our signature triple-filtration process extracts only the finest compounds — yielding a cup of extraordinary depth, smooth, complex, and utterly unforgettable.</p>
          <TransitionLink href="/menu" className="btn-outline magnetic" style={{display:'inline-flex',alignItems:'center',gap:'.8vw',marginTop:'2.5vw'}}>
            Explore the menu <span style={{transition:'transform .3s'}}>→</span>
          </TransitionLink>
        </div>
        <div className={styles.prodVisual}>
          <div className="prod-glow" style={{position:'absolute',width:'35vw',height:'35vw',borderRadius:'50%',background:'radial-gradient(circle, rgba(200,169,110,.07) 0%, transparent 68%)'}} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/product.jpg" id="prod-img" className={`${styles.prodImg} img-reveal`} alt="Noir Brew tin" loading="lazy" />
          <div className="prod-tag" style={{position:'absolute',top:'12%',left:'2%',zIndex:20}}><div className="tw-box" style={{rotate:'-4deg'}} dangerouslySetInnerHTML={{ __html: 'Dark Roast' }} /></div>
          <div className="prod-tag" style={{position:'absolute',bottom:'18%',right:'0',zIndex:20}}><div className="tw-box gold" style={{rotate:'3deg'}} dangerouslySetInnerHTML={{ __html: 'Est. 1924' }} /></div>
        </div>
        <div className="prod-bg-text" style={{position:'absolute',bottom:'3vw',right:'-2vw',fontFamily:'Cormorant Garamond,serif',fontSize:'20vw',fontWeight:300,color:'rgba(255,255,255,.015)',lineHeight:1,pointerEvents:'none',whiteSpace:'nowrap',willChange:'transform'}} aria-hidden="true">NOIR</div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="breaking-bar" aria-hidden="true">
        <div className="marquee-track" style={{animationDuration:'28s'}}>
          {['Premium Dark Roast','Triple Filtered','11 Varieties','5 Origins','100 Years of Craft','Premium Dark Roast','Triple Filtered','11 Varieties','5 Origins','100 Years of Craft'].map((t,i) => (
            <span key={i} className={i%2===0?'m-item':'m-sep'}>{t}</span>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section className={styles.featSec}>
        <div className={`${styles.featHeader} sect-enter`}>
          <h3 dangerouslySetInnerHTML={{ __html: 'Why<br/><em style="color:var(--accent)">Noir Brew</em>' }} />
          <p>Six pillars of excellence that define every single cup we craft.</p>
        </div>
        <div className={styles.featGrid} id="feat-grid">
          {[
            {n:'01',title:'Single Origin',desc:'Every batch traced to its source. Full transparency from farm to cup.'},
            {n:'02',title:'Slow Extraction',desc:'18-hour cold extraction draws out complexity heat cannot replicate.'},
            {n:'03',title:'Layered Depth',desc:'Dark chocolate, charred oak, and a velvet finish that lingers.'},
            {n:'04',title:'Award Winning',desc:'Recognised by the World Brew Council for three consecutive years.'},
            {n:'05',title:'Time Honoured',desc:'100 years of refinement. Each generation improves upon the last.'},
            {n:'06',title:'Sustainable',desc:'Carbon-neutral. Ethical partnerships with every farm we source.'},
          ].map(f => (
            <article key={f.n} className={`feat-card ${styles.featCard}`}>
              <span className={styles.featNum} aria-hidden="true">{f.n}</span>
              <div className={styles.featTitle}>{f.title}</div>
              <p className={styles.featDesc}>{f.desc}</p>
              <svg className={styles.featArrow} viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </article>
          ))}
        </div>
      </section>

      {/* ===== ORIGINS ===== */}
      <section className={`origins-section ${styles.origSec}`}>
        <div className={`${styles.origHead} sect-enter`}>
          <h3 dangerouslySetInnerHTML={{ __html: 'Where it<br/>begins' }} />
          <p>Five growing regions — each contributing something irreplaceable.</p>
        </div>
        <div style={{overflow:'hidden',padding:'0 5vw'}}>
          <div id="origins-row" className={styles.origRow}>
            {[
              {n:'01',r:'East Africa',t:'Ethiopian\nHighlands',d:'The birthplace of coffee. Bright, floral, with citrus clarity.'},
              {n:'02',r:'South America',t:'Brazilian\nCerrado',d:'Full-bodied and smooth. The backbone of our blend.'},
              {n:'03',r:'South America',t:'Colombian\nAndes',d:'Perfect balance of acidity and sweetness.'},
              {n:'04',r:'Southeast Asia',t:'Vietnamese\nDalat',d:'Dense, earthy, complex. The dark character of the blend.'},
              {n:'05',r:'East Africa',t:'Kenyan\nNyeri',d:'Winey blackcurrant notes and a lingering finish.'},
            ].map(o => (
              <div key={o.n} className={`origin-card ${styles.origCard}`}>
                <div className={styles.oNum} aria-hidden="true">{o.n}</div>
                <div className={styles.oRegion}>{o.r}</div>
                <div className={styles.oTitle}>{o.t.split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div>
                <p className={styles.oDesc}>{o.d}</p>
                <div className={styles.oBar} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={`cta-section ${styles.ctaSec}`}>
        <div className="cta-bg-text" style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontFamily:'Cormorant Garamond,serif',fontSize:'28vw',fontWeight:300,color:'rgba(255,255,255,.018)',whiteSpace:'nowrap',pointerEvents:'none',lineHeight:1,willChange:'transform'}} aria-hidden="true">NOIR</div>
        <div className="tw-box" style={{margin:'0 auto 2.5vw',display:'table',rotate:'-2deg'}} dangerouslySetInnerHTML={{ __html: 'Limited Edition &middot; 2024' }} />
        <h2 dangerouslySetInnerHTML={{ __html: 'Taste<br/>the <em style="color:var(--accent)">dark.</em>' }} />
        <p>For those who believe the finest experiences are not found in the light.</p>
        <TransitionLink href="/menu" className="btn-filled magnetic" style={{marginTop:'3vw',display:'inline-flex',alignItems:'center',gap:'.8vw'}}>Order Now &nbsp;→</TransitionLink>
      </section>

      <style>{`
        @keyframes stampSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
