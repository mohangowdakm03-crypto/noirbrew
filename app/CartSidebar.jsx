'use client';
import { useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import styles from './cart.module.css';

export default function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart } = useAppContext();
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    import('gsap').then(({ gsap }) => {
      if (isCartOpen) {
        gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
        gsap.to(sidebarRef.current, { x: '0%', duration: 0.6, ease: 'power4.out' });
      } else {
        gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.in' });
        gsap.to(sidebarRef.current, { x: '100%', duration: 0.5, ease: 'power3.in' });
      }
    });
  }, [isCartOpen]);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <>
      <div 
        ref={overlayRef} 
        className={styles.cartOverlay} 
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      
      <div ref={sidebarRef} className={styles.cartSidebar}>
        <div className={styles.cartHeader}>
          <h3>Your Selection</h3>
          <button onClick={() => setIsCartOpen(false)} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.cartItems}>
          {cartItems.length === 0 ? (
            <p className={styles.emptyMsg}>Your cart is empty.</p>
          ) : (
            cartItems.map((item, i) => (
              <div key={i} className={styles.cartItem}>
                <div className={styles.itemImgWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  <p className={styles.itemDetails}>{item.size} • {item.grind}</p>
                  <div className={styles.itemPriceRow}>
                    <span>${item.price} × {item.qty}</span>
                    <button onClick={() => removeFromCart(i)} className={styles.removeBtn}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            className={`btn-filled magnetic ${styles.checkoutBtn}`} 
            disabled={cartItems.length === 0}
            onClick={() => alert('Checkout flow not implemented yet.')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}
