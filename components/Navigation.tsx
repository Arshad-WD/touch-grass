'use client';

import React from 'react';
import { Home, Sprout, Camera, Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet, truncateAddress } from '@/context/WalletContext';

export default function Navigation() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const links = [
    { href: '/', label: 'Leaderboard', icon: Home },
    { href: '/stake', label: 'Stake', icon: Sprout },
    { href: '/claim', label: 'Claim', icon: Camera },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-near-black/60 backdrop-blur-xl border-b border-earth/40">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-fresh-grass/10 border border-fresh-grass/30 flex items-center justify-center">
              <span className="text-fresh-grass text-lg">🌿</span>
            </div>
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-cream-white leading-none">Touch Grass.</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-1">
              {links.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link 
                    key={href} 
                    href={href} 
                    className={`relative text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 ${
                      isActive 
                        ? 'text-fresh-grass bg-fresh-grass/10' 
                        : 'text-sand hover:text-cream-white hover:bg-cream-white/5'
                    }`}
                  >
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-fresh-grass"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="h-8 w-px bg-earth/40" />
            
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-earth/20 border border-earth/30 px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-fresh-grass animate-pulse" />
                  <span className="font-mono text-xs text-cream-white tracking-wider">{truncateAddress(address)}</span>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="p-2.5 border border-earth/30 text-sand hover:text-cream-white hover:bg-earth/20 transition-colors"
                  title="Disconnect"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary py-2.5 px-6 flex items-center gap-2 text-xs"
              >
                <Wallet size={14} />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* Mobile connect button */}
          <div className="md:hidden">
            {isConnected && address ? (
              <div className="flex items-center gap-2 bg-earth/20 border border-earth/30 px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-fresh-grass animate-pulse" />
                <span className="font-mono text-[10px] text-cream-white">{truncateAddress(address)}</span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary py-2 px-4 flex items-center gap-2 text-xs"
              >
                <Wallet size={14} /> {isConnecting ? '...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-near-black/90 backdrop-blur-xl border-t border-earth/40">
        <ul className="flex items-center justify-around h-16">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="w-full h-full">
                <Link 
                  href={href} 
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? 'text-fresh-grass' : 'text-sand hover:text-parchment'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'fill-fresh-grass/20' : ''} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
