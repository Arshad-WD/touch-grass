'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Sun, TrendingUp } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Stake",
    desc: "Lock your STRK on Sepolia.",
    icon: Sprout
  },
  {
    num: "02",
    title: "Go Outside",
    desc: "Upload a photo + GPS to prove it.",
    icon: Sun
  },
  {
    num: "03",
    title: "Unlock Yield",
    desc: "AI verifies you. Yield starts flowing.",
    icon: TrendingUp
  }
];

export default function HowItWorksSection() {
  return (
    <section className="relative w-full py-32 bg-dark-soil px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-5xl md:text-6xl text-cream-white mb-6">The Cycle</h2>
          <div className="w-16 h-px bg-earth mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative card-earthy overflow-hidden group hover:-translate-y-2"
            >
              {/* Massive faded number behind */}
              <span className="absolute -bottom-6 -right-4 font-serif text-[120px] font-bold text-earth/20 leading-none pointer-events-none select-none transition-transform group-hover:scale-110 duration-500">
                {step.num}
              </span>

              <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="w-12 h-12 rounded-full border border-earth flex items-center justify-center bg-near-black text-fresh-grass">
                  <step.icon size={20} />
                </div>
                
                <div className="space-y-2 mt-auto">
                  <h3 className="font-serif text-2xl font-bold">{step.title}</h3>
                  <p className="text-sand font-sans uppercase text-xs tracking-widest font-bold leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
