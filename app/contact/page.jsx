'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formState, setFormState] = useState('idle'); // idle | submitting | success
  const formRef = useRef(null);

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
      // Intro animation
      const overlay = document.getElementById('page-intro');
      const logo = document.getElementById('pi-logo');
      const line = document.getElementById('pi-line');
      const isClientNav = overlay && sessionStorage.getItem('nb_client_nav');
      if (isClientNav) {
        sessionStorage.removeItem('nb_client_nav');
        if (overlay) overlay.style.display = 'none';
        ScrollTrigger.refresh();
      } else if (overlay && logo && line) {
        document.body.style.overflow = 'hidden';
        const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; overlay.style.display = 'none'; ScrollTrigger.refresh(); } });
        tl.to(line, { width: '100%', duration: 0.7, ease: 'power3.inOut' }, 0.3)
          .to(logo, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5)
          .to(logo, { letterSpacing: '0.8em', duration: 0.8, ease: 'power2.inOut' }, 0.8)
          .to(overlay, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 1.8)
          .from(`.${styles.contactContent}`, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, 2.2);
      }

      // Staggered form field reveal
      const introDelay = isClientNav ? 0 : 2.5;
      gsap.fromTo(`.${styles.formGroup}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: introDelay });

      // Title reveal
      if (typeof SplitType !== 'undefined') {
        const h1 = document.querySelector('h1');
        if (h1) {
          h1.style.perspective = '600px'; h1.style.overflow = 'hidden';
          const sp = new SplitType(h1, { types: 'lines' });
          splitInstances.push(sp);
          gsap.fromTo(sp.lines, { y: 30, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 2.2 });
        }
      }
      }); // end ctx
    })();

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
      splitInstances.forEach(sp => sp.revert());
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('submitting');
    
    const formData = new FormData(e.target);

    try {
      const res = await fetch("https://formsubmit.co/ajax/rmpcreations03@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      if (res.ok) {
        setFormState('success');
        formRef.current.reset();
        setTimeout(() => setFormState('idle'), 3000);
      } else {
        setFormState('idle');
        alert("Failed to send message. Please try again.");
      }
    } catch(err) {
      setFormState('idle');
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <div id="page-intro" aria-hidden="true">
        <div className="pi-logo" id="pi-logo">Noir Brew</div>
        <div className="pi-line" id="pi-line" />
      </div>

      <section className={styles.contactSec}>
        <div className={styles.contactContent}>
          <div className={styles.contactHeader}>
            <div className="p-tag" style={{ marginBottom: '2vw' }}>Get in touch</div>
            <h1 dangerouslySetInnerHTML={{ __html: 'Speak with<br /><em style="color: var(--accent)">The Roaster.</em>' }} />
            <p>For wholesale inquiries, press, or to learn more about our sourcing practices, please leave a message below.</p>
          </div>
          
          <form className={styles.contactForm} onSubmit={handleSubmit} ref={formRef}>
            {/* FormSubmit config */}
            <input type="hidden" name="_subject" value="New inquiry from Noir Brew website!" />
            
            <div className={styles.formGroup}>
              <input type="text" id="name" name="name" required placeholder=" " className={styles.formInput} />
              <label htmlFor="name" className={styles.formLabel}>Your Name</label>
              <div className={styles.inputLine} aria-hidden="true" />
            </div>
            
            <div className={styles.formGroup}>
              <input type="email" id="email" name="email" required placeholder=" " className={styles.formInput} />
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <div className={styles.inputLine} aria-hidden="true" />
            </div>

            <div className={styles.formGroup}>
              <select id="inquiry" name="inquiry" required defaultValue="" className={`${styles.formInput} ${styles.formSelect}`}>
                <option value="" disabled hidden>Select Inquiry Type</option>
                <option value="wholesale">Wholesale</option>
                <option value="press">Press & Media</option>
                <option value="general">General Questions</option>
              </select>
              <div className={styles.inputLine} aria-hidden="true" />
            </div>
            
            <div className={styles.formGroup}>
              <textarea id="message" name="message" required placeholder=" " rows="4" className={styles.formInput}></textarea>
              <label htmlFor="message" className={styles.formLabel}>Message</label>
              <div className={styles.inputLine} aria-hidden="true" />
            </div>
            
            <button type="submit" className={`btn-filled magnetic ${styles.submitBtn}`} disabled={formState === 'submitting'}>
              {formState === 'idle' && 'Send Message →'}
              {formState === 'submitting' && 'Sending...'}
              {formState === 'success' && 'Message Sent ✓'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
