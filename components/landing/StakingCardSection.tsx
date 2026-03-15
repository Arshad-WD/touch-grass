'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

export default function StakingCardSection() {
  const { isConnected, connectWallet, address } = useWallet();
  const [balance, setBalance] = useState('0.00');
  const [streak, setStreak] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [[rotateX, rotateY], setRotation] = useState([0, 0]);

  useEffect(() => {
    let mounted = true;
    if (isConnected && address) {
      setTimeout(() => {
        if (mounted) {
            setBalance('500.25'); 
            setStreak(12);
        }
      }, 0);
    } else {
      setTimeout(() => {
        if (mounted) {
            setBalance('0.00');
            setStreak(0);
        }
      }, 0);
    }
    return () => { mounted = false; };
  }, [isConnected, address]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Max rotation 8 degrees
    const rotateYVal = ((mouseX - centerX) / (width / 2)) * 8;
    const rotateXVal = ((centerY - mouseY) / (height / 2)) * 8;
    
    setRotation([rotateXVal, rotateYVal]);
  };

  const handleMouseLeave = () => {
    setRotation([0, 0]);
  };

  return (
    <section className="bg-black py-32 border-t border-[#111111]" id="staking">
      <div className="max-w-[480px] mx-auto px-6" style={{ perspective: '1000px' }}>
        
        <motion.div
           ref={cardRef}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}
           style={{
             rotateX,
             rotateY,
             transformStyle: 'preserve-3d'
           }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className="bg-white/[0.03] border border-white/[0.08] rounded-[4px] p-12 relative"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="font-sans text-[11px] text-[#444444] tracking-[0.2em] mb-4">YOUR STAKE</h3>
                    <motion.p 
                       key={balance}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="font-serif text-[48px] text-white leading-none"
                    >
                        {balance} STRK
                    </motion.p>
                </div>

                <div className="w-full h-[1px] bg-[#111111] my-6" />

                <div className="flex justify-between items-center pb-2">
                    <div>
                        <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] mb-2">DAILY YIELD</p>
                        <p className="font-sans text-[16px] text-[#A8C44A]">~0.48 STRK</p>
                    </div>
                    <div className="text-right">
                        <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] mb-2">STREAK</p>
                        <p className="font-sans text-[16px] text-white flex items-center gap-2 justify-end">
                            {streak} {streak >= 3 && '🔥'}
                        </p>
                    </div>
                </div>

                {!isConnected ? (
                    <button 
                       onClick={connectWallet}
                       className="w-full bg-[#A8C44A] text-black py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:brightness-110 uppercase mt-4"
                       style={{ transform: 'translateZ(10px)' }}
                    >
                        Connect to Stake
                    </button>
                ) : (
                    <button 
                       className="w-full bg-white/10 text-white py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:bg-white/20 border border-white/20 uppercase mt-4"
                       style={{ transform: 'translateZ(10px)' }}
                    >
                        Manage Stake
                    </button>
                )}
            </div>
        </motion.div>

      </div>
    </section>
  );
}
