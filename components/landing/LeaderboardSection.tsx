'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

interface LeaderboardEntry {
  address: string;
  streak: number;
  totalEarned: number;
  verifiedToday: boolean;
}

export default function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-24 md:py-32 bg-dark-soil px-4 border-t border-earth/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16 space-y-4"
        >
          <h2 className="font-serif text-4xl md:text-7xl text-parchment">Who Touched Grass Today</h2>
          <p className="font-sans text-sand uppercase tracking-widest text-xs md:text-sm font-bold">Live Leaderboard</p>
        </motion.div>

        <div className="w-full">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-6 p-6 border-b border-earth/20">
                  <div className="w-12 h-12 bg-earth/20 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-earth/20 rounded-sm" />
                    <div className="h-3 w-48 bg-earth/10 rounded-sm" />
                  </div>
                  <div className="w-10 h-10 bg-earth/15 rounded-full" />
                </div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="flex flex-col">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`relative flex items-center justify-between border-b border-earth/30 transition-colors hover:bg-near-black/20 group ${
                    index === 0 ? 'bg-parchment/5 border-l-4 border-l-fresh-grass p-6 md:p-8' : 
                    index < 3 ? 'bg-earth/5 p-5 md:p-6' : 'p-4 md:p-5'
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className={`font-serif leading-none text-earth/40 font-bold select-none ${
                      index === 0 ? 'text-5xl md:text-7xl' : index < 3 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
                    }`}>
                      {index + 1}
                    </span>
                    
                    <div className="space-y-1">
                      <div className="font-mono text-cream-white text-xs md:text-sm tracking-wider">
                        {entry.address}
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold font-sans uppercase tracking-widest text-sand">
                        <span className="flex items-center gap-1">
                          {entry.streak} Days
                          {entry.streak >= 3 && <Flame size={10} className="text-warm-brown" />}
                        </span>
                        <span className="text-earth hidden md:inline">·</span>
                        <span className="text-fresh-grass">{entry.totalEarned.toFixed(2)} STRK</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {entry.verifiedToday ? (
                      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-fresh-grass/30 bg-fresh-grass/10 text-fresh-grass group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={20} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-earth/30 text-earth">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-earth/30 bg-near-black/30"
            >
              <div className="mx-auto w-24 h-24 mb-8 border-2 border-dashed border-earth/30 rounded-full flex items-center justify-center text-earth">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c0-5 3-5 3-10 0-3-3-4-3-4s-3 1-3 4c0 5 3 5 3 10Z"/><path d="M12 22s-3-2-3-7c0-3 3-4 3-4"/><path d="M12 22s3-2 3-7c0-3-3-4-3-4"/></svg>
              </div>
              <p className="font-serif text-xl md:text-2xl text-sand italic mb-2">No one has touched grass yet today.</p>
              <p className="font-sans text-xs text-earth uppercase tracking-widest font-bold">Be the first.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
