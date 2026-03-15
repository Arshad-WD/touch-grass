'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ── Canvas Particle System ──
interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  driftSpeed: number;
  driftPhase: number;
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>, count: number = 80) {
  const particles = useRef<Particle[]>([]);
  const animId = useRef<number>(0);

  const init = useCallback((w: number, h: number) => {
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.6,
      opacity: 0.25 + Math.random() * 0.15,
      drift: (Math.random() - 0.5) * 0.4,
      driftSpeed: 0.005 + Math.random() * 0.01,
      driftPhase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init(canvas.offsetWidth, canvas.offsetHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 1;

      particles.current.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time * p.driftSpeed + p.driftPhase) * p.drift;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 196, 74, ${p.opacity})`;
        ctx.fill();
      });

      animId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId.current);
    };
  }, [canvasRef, init]);
}

// ── SVG Layers ──
function SkyLayer() {
  return (
    <div className="absolute inset-0 z-0" style={{
      background: 'linear-gradient(180deg, #0A0A08 0%, #111210 40%, #1a1d15 70%, #1C1A14 100%)'
    }} />
  );
}

function TreelineLayer() {
  return (
    <svg
      className="absolute bottom-[20%] left-0 w-full z-10 opacity-40"
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      fill="#1a2a10"
    >
      <path d="M0,200 L0,140 Q60,80 120,130 Q160,60 200,110 Q240,50 280,100 Q320,30 360,90 Q400,40 440,100 Q480,60 520,110 Q560,50 600,95 Q640,35 680,85 Q720,45 760,100 Q800,55 840,95 Q880,40 920,85 Q960,50 1000,100 Q1040,60 1080,90 Q1120,45 1160,95 Q1200,55 1240,100 Q1280,65 1320,110 Q1360,70 1400,120 L1440,130 L1440,200 Z" />
    </svg>
  );
}

function GroundLayer() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[25%] z-20" style={{
      background: 'linear-gradient(to top, #1C1A14 0%, #1C1A14 50%, transparent 100%)'
    }} />
  );
}

// ── Hero Section ──
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useParticles(canvasRef, 80);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Text split effect
  const touchX = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const grassX = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layer 1: Sky */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <SkyLayer />
        {/* Star-like dots */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_#F5F0E8_0.5px,_transparent_0.5px)] bg-[size:60px_60px]" />
      </motion.div>

      {/* Layer 2: Treeline silhouette */}
      <motion.div style={{ y: midY }} className="absolute inset-0">
        <TreelineLayer />
      </motion.div>

      {/* Layer 3: Ground */}
      <GroundLayer />

      {/* Canvas Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-40 flex flex-col items-center text-center">
        <h1 className="font-serif font-bold text-cream-white leading-[0.85] overflow-hidden" style={{ fontSize: 'clamp(56px, 13vw, 180px)' }}>
          <motion.div 
            style={{ x: touchX, opacity }}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Touch
          </motion.div>
          <motion.div 
            style={{ x: grassX, opacity }}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-baseline"
          >
            Grass<span className="text-fresh-grass">.</span>
            <span className="animate-blink text-fresh-grass ml-1" style={{ fontSize: '0.6em' }}>|</span>
          </motion.div>
        </h1>
        
        <motion.p 
          style={{ opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 text-sand font-sans text-base md:text-lg tracking-widest uppercase max-w-md px-4"
        >
          Stake STRK · Go outside · Unlock yield
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-20 z-40 flex flex-col items-center gap-3"
      >
        <span className="text-earth text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-fresh-grass to-transparent"
        />
      </motion.div>
    </div>
  );
}
