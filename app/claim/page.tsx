'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [gps, setGps] = useState<{ lat: string; lng: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; reason: string; confidence: string; cheatDetected?: string } | null>(null);
  const [streakData, setStreakData] = useState<{ streak: number; totalEarned: number; todayYield: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) setWalletAddress(savedAddress);
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
        () => setGps({ lat: '19.0760', lng: '72.8777' })
      );
    } else {
      setGps({ lat: '19.0760', lng: '72.8777' });
    }
  };

  const handleVerify = async () => {
    if (!photo) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photo,
          mimeType,
          lat: gps?.lat ?? '0',
          lng: gps?.lng ?? '0',
          address: walletAddress ?? '0x0',
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.verified) {
        // Only update streak if address exists
        if (walletAddress) {
          try {
             const streakRes = await fetch('/api/update-streak', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ address: walletAddress }),
             });
             const sData = await streakRes.json();
             setStreakData(sData.streakData);
          } catch(e) {
             console.error("Streak update failed", e);
          }
        }
        setShowSuccess(true);
      } else {
        setVerifyResult(verifyData);
      }
    } catch (e) {
      console.error(e);
      setVerifyResult({ verified: false, reason: "Network error occurred.", confidence: "low" });
    }
    setVerifying(false);
  };

  const getCheatIcon = (detected?: string) => {
    switch(detected) {
      case 'duplicate_image': return '🔄';
      case 'old_photo': return '🕐';
      case 'ai_generated': return '🤖';
      case 'stock_photo': return '📸';
      case 'screenshot': return '🖥️';
      case 'indoors': return '🏠';
      case 'no_grass': return '🌱';
      case 'gps_mismatch': return '📍';
      case 'already_verified_today': return '✅';
      default: return '✗';
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseLeaf { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}} />
      <div style={{ minHeight: '100vh', background: '#000', paddingTop: '64px' }}>
        
        {/* Navigation */}
        <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #111' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'white', letterSpacing: '-0.01em' }}>
              ← Touch Grass.
            </a>
            {walletAddress ? (
              <button style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '8px 16px', fontSize: '11px', letterSpacing: '0.1em', borderRadius: '2px' }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </button>
            ) : (
              <button onClick={connectWallet} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 20px', fontSize: '11px', letterSpacing: '0.12em', borderRadius: '2px' }}>
                CONNECT
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 40px' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '72px', fontWeight: 400, marginBottom: '8px' }}>
            Prove It.
          </h1>
          <p style={{ fontSize: '13px', color: '#444', marginBottom: '60px' }}>
            Upload a photo touching grass. GPS required.
          </p>

          {showSuccess ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'pulseLeaf 1s ease infinite' }}>🌿</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '48px', color: 'white', marginBottom: '8px' }}>
                Yield Unlocked.
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--green)', marginBottom: '48px' }}>
                +{streakData?.todayYield?.toFixed(4) ?? '0.000'} STRK earned
              </p>
              
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '48px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>STREAK</p>
                  <p style={{ fontSize: '14px', color: (streakData?.streak ?? 0) >= 3 ? 'var(--green)' : 'white' }}>
                    {streakData?.streak ?? 0} days
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL EARNED</p>
                  <p style={{ fontSize: '14px', color: 'white' }}>
                    {streakData?.totalEarned?.toFixed(2) ?? '0.00'} STRK
                  </p>
                </div>
              </div>
              
              <button onClick={() => router.push('/')} style={{ background: 'var(--green)', color: '#000', padding: '14px 40px', fontSize: '11px', letterSpacing: '0.2em', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>
                VIEW LEADERBOARD →
              </button>
            </div>
          ) : (
            <>
              {/* Form Step 1 */}
              <p style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Step 1 — Photo
              </p>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              
              {!photo ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '1px solid #111', borderRadius: '2px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '32px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" stroke="#333" strokeWidth="1.5" fill="none" style={{ margin: '0 auto' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p style={{ fontSize: '13px', color: '#333', marginTop: '16px', marginBottom: '4px' }}>Tap to upload photo</p>
                  <p style={{ fontSize: '11px', color: '#222', letterSpacing: '0.05em' }}>Must be taken today · Outdoors only</p>
                </div>
              ) : (
                <div style={{ position: 'relative', marginBottom: '32px', transform: 'rotate(-0.5deg)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:${mimeType};base64,${photo}`} alt="uploaded grass" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block', border: '1px solid #222', borderBottom: '40px solid #0A0A0A', borderRadius: '1px' }} />
                  <p style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#333', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                    TOUCH GRASS — {new Date().toLocaleDateString()}
                  </p>
                  <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: '1px solid #222', color: '#666', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' }}>
                    Change
                  </button>
                </div>
              )}

              {/* Form Step 2 */}
              <p style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', marginTop: '32px' }}>
                Step 2 — Location
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #111', borderRadius: '2px', marginBottom: '32px' }}>
                {!gps ? (
                  <>
                    <span style={{ fontSize: '11px', color: '#222', letterSpacing: '0.05em' }}>Location not captured</span>
                    <button onClick={captureGPS} style={{ background: 'transparent', border: 'none', color: 'var(--green)', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer' }}>CAPTURE →</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--green)', letterSpacing: '0.05em' }}>{gps.lat}°N, {gps.lng}°E</span>
                    <span style={{ fontSize: '14px', color: 'var(--green)' }}>✓</span>
                  </>
                )}
              </div>

              {/* VERIFY RESULT BANNER */}
              {verifyResult && !verifyResult.verified && (
                <div style={{
                  padding: '20px 24px',
                  background: verifyResult.cheatDetected === 'already_verified_today' ? 'rgba(168,196,74,0.05)' : 'rgba(255,40,40,0.05)',
                  border: `1px solid ${verifyResult.cheatDetected === 'already_verified_today' ? 'rgba(168,196,74,0.15)' : 'rgba(255,40,40,0.15)'}`,
                  borderRadius: '2px', display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{getCheatIcon(verifyResult.cheatDetected)}</span>
                  <div>
                    <p style={{ fontSize: '13px', color: 'white', marginBottom: '4px' }}>{verifyResult.reason}</p>
                    <p style={{ fontSize: '11px', color: '#444' }}>{verifyResult.cheatDetected?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button 
                disabled={!photo || verifying}
                onClick={handleVerify}
                style={{
                  width: '100%',
                  background: !photo ? '#050505' : verifying ? '#0A0A0A' : 'var(--green)',
                  border: !photo ? '1px solid #0D0D0D' : 'none',
                  color: !photo ? '#1A1A1A' : verifying ? '#555' : '#000',
                  padding: '18px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: '2px', transition: 'all 0.3s',
                  cursor: !photo ? 'not-allowed' : 'pointer', marginBottom: '16px'
                }}
              >
                {verifying ? 'AI IS CHECKING YOUR GRASS...' : 'VERIFY & UNLOCK YIELD'}
              </button>
            </>
          )}
        </main>
      </div>
    </>
  );
}
