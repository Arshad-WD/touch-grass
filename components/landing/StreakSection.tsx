'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Unlock, Zap, Trophy } from 'lucide-react';

const milestones = [
  { days: 3, label: 'Sprout', icon: Unlock },
  { days: 7, label: 'Sapling', icon: Zap },
  { days: 14, label: 'Tree', icon: Trophy },
  { days: 30, label: 'Forest', icon: Trophy },
];

export default function StreakSection() {
  const currentStreak = 0; // Real value — 0 for new users
  const maxDays = 30;
  const progressPercentage = Math.min((currentStreak / maxDays) * 100, 100);

  return (
    <section className="w-full py-24 md:py-32 bg-near-black px-4 overflow-hidden border-t border-earth/50">
      <div className="max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-cream-white text-center">Your Journey</h2>
          <p className="font-sans text-sand text-sm tracking-widest uppercase font-bold text-center">
            Every day outside = more yield. Miss a day = streak resets.
          </p>
        </motion.div>

        {/* The Chunky XP Bar */}
        <div className="relative pt-10 px-4 md:px-0">
          <div className="h-6 w-full bg-dark-soil border border-earth flex relative">
            <motion.div 
              initial={{ width: '0%' }}
              whileInView={{ width: `${progressPercentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-warm-brown to-fresh-grass relative"
            >
              <div className="absolute inset-0 opacity-20 mix-blend-overlay" />
            </motion.div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((segment) => (
              <div 
                key={segment} 
                className="absolute top-0 bottom-0 w-px bg-near-black/50 z-10" 
                style={{ left: `${segment * 10}%` }} 
              />
            ))}
          </div>

          {/* Milestones */}
          <div className="absolute top-0 left-0 right-0 h-full pointer-events-none px-4 md:px-0">
            {milestones.map((milestone) => {
              const position = (milestone.days / maxDays) * 100;
              const isAchieved = currentStreak >= milestone.days;
              
              return (
                <div 
                  key={milestone.days}
                  className="absolute flex flex-col items-center pointer-events-auto"
                  style={{ left: `calc(${position}% - 24px)`, top: '-40px' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (position / 100), type: 'spring' }}
                    className={`w-12 h-12 rounded-[2px] border flex items-center justify-center transition-colors duration-500
                      ${isAchieved 
                        ? 'bg-fresh-grass border-fresh-grass text-near-black shadow-[0_0_20px_rgba(168,196,74,0.3)]' 
                        : 'bg-dark-soil border-earth text-sand'}`}
                  >
                    <milestone.icon size={20} className={isAchieved ? "fill-near-black/10" : ""} />
                  </motion.div>
                  <div className="mt-10 text-center">
                    <p className={`font-serif text-xl leading-none ${isAchieved ? 'text-cream-white' : 'text-sand'}`}>
                      {milestone.days}
                    </p>
                    <p className={`font-sans text-[10px] uppercase font-bold tracking-wider ${isAchieved ? 'text-fresh-grass' : 'text-earth'}`}>
                      Days
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div 
          className="text-center pt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          <div className="inline-flex items-end gap-2 text-fresh-grass">
            <span className="font-serif text-6xl md:text-8xl leading-none">{currentStreak}</span>
            <span className="font-sans text-sm md:text-base uppercase tracking-widest font-bold pb-2 md:pb-3">
              {currentStreak === 0 ? 'Days — start your journey' : 'Days outside'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
