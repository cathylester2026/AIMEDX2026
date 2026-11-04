import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// If anything ever throws while drawing, show the reason instead of a blank page.
class Guard extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontFamily: 'Georgia, serif' }}>Something went wrong</h1>
        <p style={{ background: '#fbe8e3', color: '#8a2f1e', padding: '.8rem', borderRadius: 12, wordBreak: 'break-word' }}>
          {String(this.state.err && this.state.err.message ? this.state.err.message : this.state.err)}
        </p>
        <p><a href="#/check">Check connection</a> · <a href="#/solo">Play on your own</a> · <a href="#/">Home</a></p>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<Guard><App /></Guard>);
