'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Star properties
    const STAR_COUNT = window.innerWidth < 768 ? 120 : 250;
    const stars: { x: number, y: number, r: number, color: string, baseAlpha: number, twinklePhase: number, twinkleSpeed: number, depth: number }[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        // Size distribution: 70% 0.5px, 20% 1px, 10% 1.5px
        let r = 0.5;
        const sizeRand = Math.random();
        if (sizeRand > 0.9) r = 1.5;
        else if (sizeRand > 0.7) r = 1.0;

        // Color distribution: 60% white, 30% blue-white, 10% warm
        let color = '255, 255, 255';
        const colorRand = Math.random();
        if (colorRand > 0.9) color = '255, 248, 232'; // #FFF8E8
        else if (colorRand > 0.6) color = '232, 240, 255'; // #E8F0FF

        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r,
            color,
            baseAlpha: 0.3 + Math.random() * 0.7,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: (Math.PI * 2) / (120 + Math.random() * 240), // 2-6s roughly
            depth: 0.2 + (Math.random() * 0.8), // for parallax
        });
    }

    let scrollY = window.scrollY;
    const handleScroll = () => {
        scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(star.twinklePhase));
        
        // Parallax scroll calculation
        let drawY = star.y - (scrollY * star.depth * 0.2);
        
        // Wrap around
        if (drawY < 0) {
            drawY = (drawY % canvas.height) + canvas.height;
        }

        ctx.beginPath();
        ctx.arc(star.x, drawY, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${currentAlpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-end -mt-20">
      {/* Layer 1: Stars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Layer 2: Radial Glow */}
      <div 
        className="absolute z-[1] w-[600px] h-[600px] pointer-events-none rounded-full blur-[80px]"
        style={{
            background: 'radial-gradient(circle, rgba(168, 196, 74, 0.08) 0%, transparent 70%)',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)'
        }}
      />

      {/* Layer 3: Floating SVG Ethereal Grass */}
      <div className="absolute z-[2] top-[20%] left-1/2 -translate-x-1/2 pointer-events-none opacity-80"
           style={{ filter: 'drop-shadow(0 0 20px rgba(168,196,74,0.3))' }}>
         <motion.div
           animate={{ y: [-10, 0, -10] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         >
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path d="M 180,350 Q 150,200 130,100" stroke="#2D4A0F" strokeWidth="4" strokeLinecap="round"
                    animate={{ rotate: [-2, 2, -2], transformOrigin: 'bottom center' }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                <motion.path d="M 190,350 Q 170,180 180,80" stroke="#4A751A" strokeWidth="3" strokeLinecap="round"
                    animate={{ rotate: [-1.5, 1.5, -1.5], transformOrigin: 'bottom center' }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                <motion.path d="M 200,350 Q 200,150 220,60" stroke="#8CB037" strokeWidth="6" strokeLinecap="round"
                    animate={{ rotate: [-1, 1, -1], transformOrigin: 'bottom center' }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                <motion.path d="M 210,350 Q 230,180 260,90" stroke="#A8C44A" strokeWidth="2" strokeLinecap="round"
                    animate={{ rotate: [-3, 3, -3], transformOrigin: 'bottom center' }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                <motion.path d="M 220,350 Q 260,220 280,120" stroke="#688F27" strokeWidth="4" strokeLinecap="round"
                    animate={{ rotate: [-2.5, 2.5, -2.5], transformOrigin: 'bottom center' }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} />
                <motion.path d="M 170,350 Q 130,250 100,150" stroke="#5A801D" strokeWidth="3" strokeLinecap="round"
                    animate={{ rotate: [-1.8, 1.8, -1.8], transformOrigin: 'bottom center' }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
                 <motion.path d="M 195,350 Q 190,280 200,200" stroke="#C4E056" strokeWidth="1.5" strokeLinecap="round"
                    animate={{ rotate: [-0.5, 0.5, -0.5], transformOrigin: 'bottom center' }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
            </svg>
         </motion.div>
      </div>

      {/* Layer 4: Content */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center pb-[20vh]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[11px] tracking-[0.2em] text-[#666666] font-sans mb-5"
        >
          PROOF OF OUTDOOR ACTIVITY
        </motion.p>

        <h1 className="font-serif text-[clamp(48px,10vw,140px)] leading-[0.95] text-white flex flex-col md:flex-row gap-0 md:gap-8">
            <span className="overflow-hidden inline-block border-red-500">
                <motion.span 
                    className="inline-block"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    Touch
                </motion.span>
            </span>
            <span className="overflow-hidden inline-block border-red-500">
                <motion.span 
                    className="inline-block"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                    Grass.
                </motion.span>
            </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-[#666666] font-sans text-base tracking-[0.02em] mt-8 mb-12"
        >
          Stake STRK. Go outside. Unlock yield.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4"
        >
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-[10px] border border-white/20 text-white px-8 py-3.5 text-xs tracking-[0.15em] font-sans rounded hover:bg-white/20 hover:border-white/40 transition-all duration-300 uppercase">
                Stake Now
            </button>
            <button className="w-full sm:w-auto bg-[#A8C44A] text-black px-8 py-3.5 text-xs tracking-[0.15em] font-sans border-none rounded hover:bg-[#C4E056] hover:-translate-y-[1px] transition-all duration-300 uppercase">
                Learn More
            </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-[1px] h-10 bg-[#333333]" />
        <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-[#333333]"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="text-[#444444] text-[10px] tracking-[0.2em] font-sans mt-1">SCROLL</p>
      </motion.div>
    </div>
  );
}
