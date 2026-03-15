'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

export default function StakingCardSection() {
  const { balance, isConnected } = useWallet();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.gamma || !e.beta) return;
      x.set(Math.max(-0.5, Math.min(0.5, e.gamma / 90)));
      y.set(Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 90)));
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [x, y]);

  const displayBalance = isConnected ? balance : '0.00';
  const displayYield = isConnected ? (parseFloat(balance) * 0.00096).toFixed(2) : '0.00';

  return (
    <section className="relative w-full py-32 md:py-40 border-t border-earth/50 overflow-hidden flex flex-col items-center justify-center bg-earth/80">
      <div 
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          style={{
            rotateX,
            rotateY,
            z: hovered ? 50 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`w-[300px] h-[380px] md:w-[380px] md:h-[480px] border border-earth/50 bg-parchment p-8 flex flex-col justify-between relative transition-shadow duration-300 ${hovered ? 'shadow-[0_20px_60px_rgba(0,0,0,0.4)]' : 'shadow-xl'}`}
        >
          {/* Inner grain */}
          <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-4xl text-near-black font-bold">Your Stake</h3>
            <div className="w-8 h-1 bg-fresh-grass mt-4" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand font-bold">Current Locked</p>
              <p className="font-mono text-3xl md:text-4xl text-near-black">{displayBalance} <span className="text-lg">STRK</span></p>
            </div>
            
            <div className="space-y-1">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand font-bold">Est. Daily Yield</p>
              <p className="font-mono text-xl md:text-2xl text-deep-grass">+{displayYield} <span className="text-sm">STRK</span></p>
            </div>
            
            <div className="space-y-1">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand font-bold">Status</p>
              <p className="font-serif text-lg text-near-black italic">
                {isConnected ? 'Connected & ready' : 'Not connected'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12 md:mt-16"
      >
        <Link href="/stake" className="btn-primary inline-flex items-center gap-4 text-base md:text-lg px-8 md:px-10 py-5 group">
          Start Staking
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
