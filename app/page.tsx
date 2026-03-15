'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  // State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const streakFillRef = useRef<HTMLDivElement>(null);
  const streakContainerRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    // 1. Scroll listener
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // 2. Fetch Leaderboard
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      } catch (e) {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
    const lbInterval = setInterval(fetchLeaderboard, 30000);

    // 3. Intersection Observer for .reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 4. Check LocalStorage
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) setWalletAddress(savedAddress);

    // 5. Star field canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars: any[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() < 0.7 ? 0.5 : Math.random() < 0.9 ? 1 : 1.5,
        opacity: 0.3 + Math.random() * 0.7,
        speed: 0,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId: number;
    let frame = 0;
    
    // Parallax logic
    let lastScrollY = window.scrollY;

    const render = () => {
      frame++;
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      ctx.clearRect(0, 0, w, h);
      
      stars.forEach(star => {
        star.y -= scrollDelta * 0.1;
        if (star.y > h) star.y = 0;
        if (star.y < 0) star.y = h;

        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity * (0.6 + 0.4 * twinkle);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(lbInterval);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const starknet = (window as any).starknet;
    if (!starknet) {
      alert('Please install Argent X or Braavos wallet');
      return;
    }
    await starknet.enable();
    const address = starknet.selectedAddress;
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
  };

  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const handleMouseLeaveCard = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sway-1 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-2deg); } }
        @keyframes sway-2 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1.5deg); } }
        @keyframes sway-3 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-1deg); } }
        @keyframes sway-4 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
        @keyframes sway-5 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-1.5deg); } }
        @keyframes sway-6 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1deg); } }
        @keyframes sway-7 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-2deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseIndicator { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .nav-link { font-size: 12px; color: var(--grey-4); letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: var(--white); }
        .btn-connect { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 20px; font-size: 11px; letter-spacing: 0.12em; border-radius: 2px; transition: all 0.2s; }
        .btn-connect:hover { background: rgba(255,255,255,0.1); }
        .btn-connected { background: transparent; border: 1px solid var(--grey-3); color: var(--grey-5); padding: 8px 16px; font-size: 11px; letter-spacing: 0.1em; border-radius: 2px; }
        
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; }
          .hero-headline { font-size: 64px !important; }
        }
      `}} />

      {/* STAR FIELD */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 0, pointerEvents: 'none'
        }} 
      />

      {/* NAVIGATION */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        transition: 'background 0.3s ease',
        background: navScrolled ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(20px)' : 'none',
        borderBottom: navScrolled ? '1px solid var(--grey-1)' : 'none',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 40px',
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Left Logo */}
          <a href="/">
            <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'white', letterSpacing: '-0.01em' }}>
              Touch Grass.
            </span>
          </a>

          {/* Right Links & Connect */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
              <a href="#leaderboard" className="nav-link">Leaderboard</a>
              <a href="/stake" className="nav-link">Stake</a>
              <a href="/claim" className="nav-link">Claim</a>
            </div>
            
            {walletAddress ? (
              <button className="btn-connected">
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </button>
            ) : (
              <button className="btn-connect" onClick={connectWallet}>
                CONNECT
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section style={{
        position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 1
      }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(168,196,74,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        {/* Grass SVG */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2, pointerEvents: 'none' }}>
          <svg width="300" height="220" viewBox="0 0 300 220">
            <defs>
              <linearGradient id="grassGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#2D4A0F" />
                <stop offset="100%" stopColor="#A8C44A" />
              </linearGradient>
            </defs>
            <path d="M150,220 C130,180 100,140 80,60" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-1 4s ease-in-out infinite' }} />
            <path d="M150,220 C135,175 115,130 100,50" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-2 5s ease-in-out infinite' }} />
            <path d="M150,220 C140,170 125,120 120,40" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-3 3.5s ease-in-out infinite' }} />
            <path d="M150,220 C150,165 150,110 150,30" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-4 6s ease-in-out infinite' }} />
            <path d="M150,220 C160,170 175,120 180,40" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-5 4.5s ease-in-out infinite' }} />
            <path d="M150,220 C165,175 185,130 200,50" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-6 5.5s ease-in-out infinite' }} />
            <path d="M150,220 C170,180 200,140 220,60" stroke="url(#grassGrad)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ transformOrigin: 'bottom center', animation: 'sway-7 3s ease-in-out infinite' }} />
          </svg>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.25em', color: 'var(--grey-3)', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'var(--sans)',
            animation: 'slideUp 0.8s ease 0.2s both'
          }}>
            Proof of Outdoor Activity
          </p>

          <h1 className="hero-headline" style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(72px, 11vw, 150px)', fontWeight: 400, lineHeight: 0.92, color: 'white', letterSpacing: '-0.02em', marginBottom: '32px'
          }}>
            <span style={{ display:'block', animation:'slideUp 0.8s ease 0.4s both' }}>Touch</span>
            <span style={{ display:'block', animation:'slideUp 0.8s ease 0.65s both' }}>Grass.</span>
          </h1>

          <p style={{ fontSize: '15px', color: '#555', letterSpacing: '0.03em', marginBottom: '40px', animation: 'slideUp 0.8s ease 0.9s both' }}>
            Stake STRK. Go outside. Unlock yield.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', animation: 'slideUp 0.8s ease 1.1s both', flexWrap: 'wrap' }}>
            <button 
              onClick={() => router.push('/stake')}
              style={{
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)', color: 'white', padding: '14px 40px', fontSize: '11px', letterSpacing: '0.18em', borderRadius: '2px', transition: 'all 0.25s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >STAKE NOW</button>

            <button 
              onClick={() => { const el = document.getElementById('how-it-works'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{
                background: 'var(--green)', border: 'none', color: '#000', padding: '14px 40px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', borderRadius: '2px', transition: 'all 0.25s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#BDD65A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; }}
            >LEARN MORE</button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10,
          animation: 'pulseIndicator 2s ease infinite'
        }}>
          <div style={{ width: 1, height: 40, background: '#222' }} />
          <span style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#333', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '120px 40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <h2 className="reveal" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 400, color: 'white', textAlign: 'center', marginBottom: '16px' }}>
          The Cycle
        </h2>
        <p className="reveal" style={{ fontSize: '12px', color: '#333', textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '80px' }}>
          Three steps. Every day.
        </p>

        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#111', border: '1px solid #111' }}>
          
          {[
            { num: '01', title: 'Stake', desc: 'Lock your STRK tokens on Starknet Sepolia. Yield starts accumulating the moment you stake.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0a4 4 0 014-4h0a4 4 0 00-4-4h0a4 4 0 00-4 4h0a4 4 0 014 4z" /> },
            { num: '02', title: 'Go Outside', desc: 'Leave your screen. Find real grass. Upload a photo with your GPS location to prove it.', icon: <><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m7.07-14.07l-1.41 1.41M6.34 17.66l-1.41 1.41M22 12h-2M4 12H2m15.66 5.66l-1.41-1.41M6.34 6.34l-1.41-1.41"/></> },
            { num: '03', title: 'Unlock Yield', desc: 'Groq AI verifies you were actually outdoors. Pass the check — yield is yours. Fail — try again tomorrow.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> }
          ].map((card, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.15}s`, background: '#000', padding: '48px 36px', position: 'relative', overflow: 'hidden', transition: 'background 0.3s' }}
                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,196,74,0.03)'} onMouseLeave={e => e.currentTarget.style.background = '#000'}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '120px', color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', position: 'absolute', right: '24px', bottom: '16px' }}>
                {card.num}
              </span>
              <svg width="28" height="28" viewBox="0 0 24 24" stroke="var(--green)" strokeWidth="1.5" fill="none" style={{ marginBottom: '28px' }}>
                {card.icon}
              </svg>
              <h3 style={{ fontFamily: 'var(--sans)', fontSize: '15px', color: 'white', fontWeight: 500, marginBottom: '10px' }}>{card.title}</h3>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#555', lineHeight: 1.8 }}>{card.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* SECTION 3: LEADERBOARD */}
      <section id="leaderboard" style={{ padding: '120px 40px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <h2 className="reveal" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, marginBottom: '8px' }}>
          Who Touched Grass Today
        </h2>
        <p className="reveal" style={{ fontSize: '11px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '60px' }}>
          Updated every 30 seconds
        </p>

        {loadingLeaderboard ? (
          <div>
            {[1,2,3,4,5].map(j => (
              <div key={j} style={{ height: '64px', background: '#0A0A0A', marginBottom: '1px', borderRadius: 0, animation: 'skeletonPulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
            <p style={{ fontSize: '15px', color: '#333', marginBottom: '12px' }}>No one has touched grass yet today.</p>
            <button onClick={() => router.push('/stake')} style={{ background: 'transparent', border: 'none', color: 'var(--green)', fontSize: '13px', letterSpacing: '0.1em', cursor: 'pointer' }}>
              Be the first →
            </button>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry, i) => (
              <div key={entry.address} style={{ display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #0D0D0D', borderLeft: i === 0 ? '2px solid var(--green)' : 'none', paddingLeft: i === 0 ? '20px' : '0', transition: 'background 0.2s' }}
                   onMouseEnter={e => e.currentTarget.style.background = '#050505'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '36px', color: i < 3 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', width: '72px', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#666', flex: 1 }}>
                  {entry.address.slice(0,8)}...{entry.address.slice(-6)}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--green)', marginRight: '32px', letterSpacing: '0.05em' }}>
                  {entry.streak >= 3 ? '🔥 ' : ''}{entry.streak} days
                </span>
                <span style={{ fontSize: '13px', color: 'white', marginRight: '24px', fontVariantNumeric: 'tabular-nums' }}>
                  {Number(entry.totalEarned).toFixed(2)} STRK
                </span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.verifiedToday ? 'var(--green)' : '#1A1A1A', border: entry.verifiedToday ? 'none' : '1px solid #222' }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: STAKING CARD */}
      <section style={{ padding: '120px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <h2 className="reveal" style={{ fontFamily: 'var(--serif)', fontSize: '56px', marginBottom: '64px', fontWeight: 400 }}>Your Stake</h2>
        
        <div ref={cardRef} onMouseMove={handleMouseMoveCard} onMouseLeave={handleMouseLeaveCard} style={{ maxWidth: '440px', width: '100%', perspective: '1000px' }}>
          <div className="reveal" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '48px',
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 ? 'transform 0.6s ease' : 'transform 0.1s ease', willChange: 'transform'
          }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#333', textTransform: 'uppercase', marginBottom: '8px' }}>Your Stake</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '52px', color: 'white', lineHeight: 1, marginBottom: '32px' }}>0.00 <span style={{ fontSize: '20px', color: '#333' }}>STRK</span></p>
            
            <div style={{ borderTop: '1px solid #111', marginBottom: '24px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Daily Yield</p>
                <p style={{ fontSize: '14px', color: 'var(--green)' }}>0.000 STRK</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Streak</p>
                <p style={{ fontSize: '14px', color: 'white' }}>0 days</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #111', marginTop: '24px', marginBottom: '24px' }} />
            
            <button onClick={() => walletAddress ? router.push('/stake') : connectWallet()} style={{
              width: '100%', background: 'var(--green)', border: 'none', color: '#000', padding: '16px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: '2px', transition: 'all 0.2s'
            }}>
              {walletAddress ? 'STAKE NOW' : 'CONNECT WALLET'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: STREAK BAR */}
      <section style={{ padding: '120px 40px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <h2 className="reveal" style={{ fontFamily: 'var(--serif)', fontSize: '56px', marginBottom: '16px', fontWeight: 400 }}>Your Streak</h2>
        <p className="reveal" style={{ fontSize: '12px', color: '#333', letterSpacing: '0.2em', marginBottom: '60px', textTransform: 'uppercase' }}>Miss a day. Lose it all.</p>

        <div className="reveal" ref={streakContainerRef} style={{ height: '2px', background: '#111', position: 'relative', marginBottom: '48px' }}>
          <div ref={streakFillRef} style={{ height: '100%', background: 'linear-gradient(90deg, #1A2E05, #A8C44A)', width: '0%', transition: 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} />
          {[ { p: 10, l: '3d' }, { p: 23.3, l: '7d' }, { p: 46.7, l: '14d' }, { p: 100, l: '30d' } ].map(m => (
            <div key={m.l} style={{ position: 'absolute', left: `${m.p}%`, top: '-3px', width: '1px', height: '8px', background: '#222' }}>
              <div style={{ position: 'absolute', top: '16px', fontSize: '10px', color: '#333', transform: 'translateX(-50%)', letterSpacing: '0.1em' }}>{m.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
          {[ { v: '0', l: 'Current Streak' }, { v: '0.00', l: 'STRK Earned' }, { v: '0', l: 'Days Verified' } ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: '32px', fontFamily: 'var(--serif)', color: 'white' }}>{s.v}</div>
              <div style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '8px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 40px', borderTop: '1px solid #0D0D0D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, flexWrap: 'wrap', gap: '24px' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: '#222' }}>Touch Grass.</span>
        <span style={{ fontSize: '11px', color: '#222', letterSpacing: '0.1em' }}>Built on Starknet · Powered by Groq</span>
        <a href="https://github.com/keep-starknet-strange/starkzap" target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#222', letterSpacing: '0.1em', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'} onMouseLeave={e => e.currentTarget.style.color = '#222'}>
          Starkzap SDK →
        </a>
      </footer>

    </>
  );
}
