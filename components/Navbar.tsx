import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav role="banner" className="w-full sticky top-0 z-50 bg-white border-b" style={{height:56}}>
      <div className="site-container flex items-center justify-between" style={{height:56}}>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',fontWeight:500,color:'var(--color-text-primary)',letterSpacing:'-0.02em'}}>GPT to PDF</div>
        <div>
          <a href="#faq" className="text-sm" style={{color:'var(--color-text-secondary)',transition:'var(--transition-fast)'}}>
            FAQ
          </a>
        </div>
      </div>
    </nav>
  );
}
