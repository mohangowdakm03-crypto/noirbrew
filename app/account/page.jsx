'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import styles from './account.module.css';

export default function AccountPage() {
  const { user, setUser } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Handle Mock Login / Register
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Mock user creation
    setUser({
      name: isLogin ? 'Guest Member' : (name || 'New Member'),
      email: email,
      memberSince: new Date().getFullYear()
    });
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // Entrance animation
  useEffect(() => {
    import('gsap').then(({ gsap }) => {
      gsap.fromTo('.auth-fade', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
    });
  }, [user, isLogin]);

  if (user) {
    return (
      <div className={styles.accountContainer}>
        <div className={`auth-fade ${styles.dashboard}`}>
          <div className={styles.dashHeader}>
            <div>
              <h1 className={styles.dashTitle}>Welcome, {user.name}</h1>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{user.email} • Member since {user.memberSince}</p>
            </div>
            <button onClick={handleLogout} className={`magnetic ${styles.logoutBtn}`}>Sign Out</button>
          </div>

          <div className={`auth-fade ${styles.orderHistory}`}>
            <h3>Order History</h3>
            <p>You have not placed any orders yet.</p>
            <a href="/menu" className="btn-outline magnetic" style={{ display: 'inline-block', margin: '2vw auto 0' }}>
              Explore The Blend
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountContainer}>
      <div className={`auth-fade ${styles.authBox}`}>
        <h2 className={styles.authTitle}>{isLogin ? 'Sign In' : 'Join the Club'}</h2>
        <p className={styles.authSubtitle}>
          {isLogin ? 'Access your private reserve and order history.' : 'Create an account to track orders and save your preferences.'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={`auth-fade ${styles.inputGroup}`}>
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className={styles.inputField} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div className={`auth-fade ${styles.inputGroup}`}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className={styles.inputField} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@noirbrew.com"
              required
            />
          </div>

          <div className={`auth-fade ${styles.inputGroup}`}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className={styles.inputField} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={`auth-fade btn-filled magnetic ${styles.submitBtn}`}>
            {isLogin ? 'Enter' : 'Create Account'}
          </button>
        </form>

        <p className={`auth-fade ${styles.toggleText}`}>
          {isLogin ? "Don't have an account?" : "Already a member?"}
          <button type="button" className={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </p>
      </div>
    </div>
  );
}
