import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">🌿 touch grass</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
            <Wallet size={16} />
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
