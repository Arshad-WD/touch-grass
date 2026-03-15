'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: "01",
    title: "Stake",
    desc: "Lock your STRK on Sepolia. Your yield starts accumulating immediately.",
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ stroke: '#A8C44A', strokeWidth: 1.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0a4 4 0 014-4h0a4 4 0 00-4-4h0a4 4 0 00-4 4h0a4 4 0 014 4z" />
        </svg>
    )
  },
  {
    num: "02",
    title: "Go Outside",
    desc: "Leave your screen. Find grass. Take a photo. GPS confirms your location.",
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ stroke: '#A8C44A', strokeWidth: 1.5 }}>
            <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
        </svg>
    )
  },
  {
    num: "03",
    title: "Unlock Yield",
    desc: "Groq AI verifies your outdoor photo. Yield released. Streak grows.",
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ stroke: '#A8C44A', strokeWidth: 1.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
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

        <div className="mobile-stack-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                maxWidth: '900px',
                margin: '0 auto',
            }}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15, 
                ease: "easeOut"
              }}
              className="cycle-card group"
            >
              <div className="w-6 h-6 mb-6">
                {step.icon}
              </div>
              
              <h3 className="font-sans font-medium text-[16px] text-white mb-2">
                {step.title}
              </h3>
              
              <p className="font-sans text-[13px] text-[#555555] leading-[1.7] relative z-10 pr-4">
                {step.desc}
              </p>

              <span className="card-number">
                {step.num}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Inline styles for custom card logic requested */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
            .mobile-stack-grid {
                grid-template-columns: 1fr !important;
            }
        }
        .cycle-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 3px;
            padding: 40px 32px;
            position: relative;
            overflow: hidden;
            transition: border-color 0.3s ease;
        }
        .cycle-card:hover {
            border-color: rgba(168,196,74,0.35);
        }
        .card-number {
            position: absolute;
            bottom: -15px;
            right: 10px;
            font-family: var(--font-serif), serif;
            font-size: 96px;
            color: rgba(255,255,255,0.04);
            line-height: 1;
            pointer-events: none;
            user-select: none;
        }
      `}} />
    </section>
  );
}
