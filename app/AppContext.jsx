'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [user, setUser] = useState(null);

  // Load cart from local storage if available
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('noirbrew_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      
      const savedAudio = localStorage.getItem('noirbrew_audio');
      if (savedAudio === 'true') setAudioEnabled(true);

      const savedUser = localStorage.getItem('noirbrew_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('noirbrew_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Save user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('noirbrew_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('noirbrew_user');
      }
    } catch (e) {}
  }, [user]);

  // Save audio preference
  useEffect(() => {
    try {
      localStorage.setItem('noirbrew_audio', audioEnabled.toString());
    } catch (e) {}
  }, [audioEnabled]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.grind === item.grind && i.size === item.size);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, qty: i.qty + item.qty } : i);
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AppContext.Provider value={{
      cartItems, setCartItems,
      isCartOpen, setIsCartOpen,
      audioEnabled, setAudioEnabled,
      user, setUser,
      addToCart, removeFromCart
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
