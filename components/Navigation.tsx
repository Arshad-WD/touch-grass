'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

export default function Navigation() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Leaderboard', path: '/' },
    { name: 'Stake', path: '/stake' },
    { name: 'Claim', path: '/claim' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-[20px] border-b border-white/5 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="20" height="24" viewBox="0 0 80 120" fill="none" className="group-hover:scale-105 transition-transform duration-300">
            <path
              d="M 40,110 C 40,110 10,70 20,30 C 30,-10 70,10 60,50 C 50,90 40,110 40,110 Z"
              stroke="#A8C44A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-sans text-white text-[14px] font-medium tracking-wide">
            Touch Grass.
          </span>
        </Link>

        {/* Right: Links + Connect Button */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-sans text-[12px] tracking-[0.05em] transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[#666666] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-transparent border border-white/15 text-white px-5 py-2 text-[12px] tracking-[0.1em] font-sans rounded-[2px] transition-all duration-300 hover:border-white/40 hover:bg-white/5 uppercase"
            >
              Connect Wallet
            </button>
          ) : (
             <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-[2px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8C44A] shadow-[0_0_8px_#A8C44A]" />
                  <span className="font-mono text-[11px] text-[#999999] tracking-wider">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-transparent border border-white/15 text-white/50 px-4 py-2 text-[10px] tracking-[0.1em] font-sans rounded-[2px] transition-all duration-300 hover:border-white/40 hover:text-white uppercase"
                >
                  Disconnect
                </button>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
}
