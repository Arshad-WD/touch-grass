'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: "01",
    title: "Stake STRK",
    desc: "Lock your STRK tokens in the smart contract. Your capital generates base yield while securing the network.",
    icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.81-8.163-2.182m15.686 0A5.969 5.969 0 0121 12a5.969 5.969 0 01-5.969 5.969M12 10.5c3.27 0 6.273 1.18 8.441 3.12m-8.441-3.12a11.954 11.954 0 01-8.441 3.12M12 10.5c-3.27 0-6.273 1.18-8.441 3.12m0 0A5.969 5.969 0 003 12c0 2.5 1.5 4.64 3.666 5.56" />
        </svg>
    )
  },
  {
    num: "02",
    title: "Go Outside",
    desc: "Take a daily photo of nature with your phone. Our AI vision and GPS anti-cheat system verifies you are actually outdoors.",
    icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
        </svg>
    )
  },
  {
    num: "03",
    title: "Unlock Yield",
    desc: "Every verified day builds your streak. Higher streaks multiply your base yield. Miss a day, and the streak resets.",
    icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    )
  }
];

export default function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-black py-32 border-t border-[#111111]" id="how-it-works" ref={ref}>
      <div className="max-w-[1000px] mx-auto px-6">
        
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-24"
        >
            <h2 className="font-serif text-[56px] text-white">The Cycle</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.15 + (index * 0.15), 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              className="relative overflow-hidden group border border-white/5 bg-white/[0.03] rounded-[2px] p-10 hover:border-[#A8C44A]/30 hover:bg-[#A8C44A]/[0.03] transition-colors duration-300"
            >
              <div className="w-6 h-6 text-[#A8C44A] mb-8">
                {step.icon}
              </div>
              
              <h3 className="font-sans font-medium text-[18px] text-white mb-4">
                {step.title}
              </h3>
              
              <p className="font-sans text-[14px] text-[#666666] leading-[1.7] relative z-10 pr-4">
                {step.desc}
              </p>

              <span className="absolute bottom-6 right-8 font-serif text-[80px] text-white/[0.04] leading-none select-none pointer-events-none group-hover:text-[#A8C44A]/[0.04] transition-colors duration-300">
                {step.num}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
