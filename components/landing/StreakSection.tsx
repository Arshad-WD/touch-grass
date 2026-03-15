'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

const MILESTONES = [3, 7, 14, 30];

export default function StreakSection() {
  const { isConnected, address } = useWallet();
  const [currentStreak, setCurrentStreak] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    let mounted = true;
    if (isConnected && address) {
        setTimeout(() => {
          if (mounted) setCurrentStreak(12);
        }, 0);
    } else {
        setTimeout(() => {
          if (mounted) setCurrentStreak(0);
        }, 0);
    }
    return () => { mounted = false; };
  }, [isConnected, address]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Calculate percentage for the bar (max 30)
  const pct = Math.min((currentStreak / 30) * 100, 100);

  return (
    <section className="bg-[#050505] py-32 border-t border-[#111111]" id="streak" ref={containerRef}>
      <div className="max-w-[700px] mx-auto px-6 text-center">
        
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
           transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
           className="mb-24"
        >
          <h2 className="font-serif text-[56px] text-white">Your Streak</h2>
        </motion.div>

        <div className="relative w-full h-[3px] bg-[#111111]">
            {/* Animated Fill Bar */}
            <motion.div 
               className="absolute top-0 left-0 h-full origin-left"
               style={{ background: 'linear-gradient(90deg, #2D4A0F, #A8C44A)' }}
               initial={{ scaleX: 0 }}
               animate={controls}
               variants={{
                 visible: { scaleX: pct / 100, transition: { duration: 1.5, ease: "easeOut", delay: 0.3 } }
               }}
            />

            {/* Milestones */}
            {MILESTONES.map((day) => {
                const isReached = currentStreak >= day;
                const pos = (day / 30) * 100;
                return (
                  <div 
                    key={day}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${pos}%` }}
                  >
                     <motion.div 
                        initial={{ backgroundColor: '#050505', borderColor: '#333333' }}
                        animate={controls}
                        variants={{
                           visible: { 
                             backgroundColor: isReached ? '#A8C44A' : '#050505',
                             borderColor: isReached ? '#A8C44A' : '#333333',
                             transition: { duration: 0.5, delay: 0.3 + (isReached ? (pos/100)*1.5 : 0) }
                           }
                        }}
                        className="w-2.5 h-2.5 rounded-full border border-[#333333] z-10"
                     />
                     <p className="absolute top-6 font-sans text-[10px] text-[#444444] whitespace-nowrap">
                        {day} days
                     </p>
                  </div>
                );
            })}
        </div>

        {!isConnected && (
            <motion.p 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.8 }}
                className="font-sans text-[12px] text-[#444444] mt-24 tracking-wide"
            >
                Connect wallet to start building your streak.
            </motion.p>
        )}
      </div>
    </section>
  );
}
