'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  address: string;
  streak: number;
  totalEarned: number;
  verifiedToday: boolean;
}

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-black py-32 border-t border-[#111111]" id="leaderboard" ref={ref}>
      <div className="max-w-[800px] mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
           transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
           className="text-center mb-16"
        >
          <h2 className="font-serif text-[56px] text-white leading-tight mb-4">Who Touched Grass Today</h2>
          <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] uppercase">The Top 20 Initiates</p>
        </motion.div>

        <div className="w-full">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-5 border-b border-[#111111] animate-pulse">
                  <div className="w-16 h-12 bg-white/5" />
                  <div className="w-32 h-4 bg-white/5 ml-4" />
                  <div className="w-16 h-4 bg-white/5 ml-auto" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-20 border-b border-[#111111]"
            >
              <p className="font-sans text-[16px] text-[#333333] mb-2">No one has touched grass yet today.</p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="font-sans text-[16px] text-[#A8C44A] cursor-pointer hover:text-[#C4E056] transition-colors"
              >
                Be the first.
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col">
              {entries.map((entry, index) => {
                const isFirst = index === 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                    className={`flex items-center py-5 border-b border-[#111111] hover:bg-white/[0.02] transition-colors group px-4 ${
                      isFirst ? 'border-l-[2px] border-l-[#A8C44A]' : 'border-l-[2px] border-l-transparent'
                    }`}
                  >
                    <div 
                      className="font-serif text-[48px] w-[80px] shrink-0 leading-none"
                      style={{ color: isFirst ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)' }}
                    >
                      {index + 1}
                    </div>

                    <div className="font-sans font-mono text-[14px] text-[#888888] w-[140px] truncate shrink-0">
                      {entry.address}
                    </div>

                    <div className="font-sans text-[13px] text-[#A8C44A] flex items-center gap-1.5 shrink-0 ml-4 md:ml-8">
                      {entry.streak} day streak
                      {entry.streak >= 3 && <span className="text-base" title="Hot streak!">🔥</span>}
                    </div>

                    <div className="font-sans text-[14px] text-white ml-auto flex items-center gap-4">
                      <span>{entry.totalEarned.toFixed(2)} STRK</span>
                      <div 
                        className={`w-2 h-2 rounded-full ${entry.verifiedToday ? 'bg-[#A8C44A] shadow-[0_0_8px_rgba(168,196,74,0.4)]' : 'bg-[#222222]'}`} 
                        title={entry.verifiedToday ? 'Verified today' : 'Not verified yet'}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
