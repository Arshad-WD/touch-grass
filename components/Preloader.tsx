'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [show, setShow] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasSeenPreloader');
    }
    return true;
  });

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('hasSeenPreloader', 'true');
    }, 1800);

    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none"
      >
        <svg 
          width="80" 
          height="120" 
          viewBox="0 0 80 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Minimalist leaf/blade shape */}
          <motion.path
            d="M 40,110 C 40,110 10,70 20,30 C 30,-10 70,10 60,50 C 50,90 40,110 40,110 Z"
            stroke="#A8C44A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.2,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}
