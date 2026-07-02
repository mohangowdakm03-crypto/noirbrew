'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Page error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#09090b',
          color: '#fff', fontFamily: 'var(--font-inter, sans-serif)', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', color: 'var(--accent, #c8a96e)', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{
              background: 'transparent', border: '1px solid var(--accent, #c8a96e)',
              color: 'var(--accent, #c8a96e)', padding: '0.8rem 2rem',
              cursor: 'pointer', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem'
            }}
          >
            Return Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
