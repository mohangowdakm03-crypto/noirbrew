'use client';
import { useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';

export default function SoundEngine() {
  const { audioEnabled } = useAppContext();
  const ambientRef = useRef(null);
  
  useEffect(() => {
    // Initialize audio objects once on mount
    if (!ambientRef.current) {
      ambientRef.current = new Audio('/ambient.wav');
      ambientRef.current.loop = true;
      ambientRef.current.volume = 0;
    }

    const hoverSound = new Audio('/hover.wav');
    hoverSound.volume = 0.15;

    const playHover = () => { if (audioEnabled) { hoverSound.currentTime = 0; hoverSound.play().catch(()=>{}); } };

    // Attach listeners to interactive elements
    const attachListeners = () => {
      document.querySelectorAll('a, button, .magnetic').forEach(el => {
        el.addEventListener('mouseenter', playHover);
      });
    };

    attachListeners();
    // Re-attach on mutations (like page transitions)
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.querySelectorAll('a, button, .magnetic').forEach(el => {
        el.removeEventListener('mouseenter', playHover);
      });
      observer.disconnect();
    };
  }, [audioEnabled]);

  // Handle ambient drone fade in/out
  useEffect(() => {
    if (!ambientRef.current) return;
    
    if (audioEnabled) {
      ambientRef.current.play().catch(()=>{});
      // Fade in
      let v = 0;
      const iv = setInterval(() => {
        v += 0.05;
        if (v >= 0.3) { v = 0.3; clearInterval(iv); }
        ambientRef.current.volume = v;
      }, 100);
    } else {
      // Fade out
      let v = ambientRef.current.volume;
      const iv = setInterval(() => {
        v -= 0.05;
        if (v <= 0) {
          v = 0;
          clearInterval(iv);
          ambientRef.current.pause();
        }
        ambientRef.current.volume = v;
      }, 100);
    }
  }, [audioEnabled]);

  return null;
}
