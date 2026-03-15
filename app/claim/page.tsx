'use client';

import React, { useState, useRef } from 'react';
import { Camera, MapPin, ArrowLeft, Loader2, CheckCircle, XCircle, Wallet, RotateCcw, Clock, Bot, Image, Monitor, MapPinOff, CalendarCheck, Leaf, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

interface VerificationResult {
  verified: boolean;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  cheatDetected?: string;
  checks?: Record<string, boolean>;
}

interface StreakData {
  streak: number;
  totalEarned: number;
  todayYield: number;
  streakMultiplier: number;
}

const CHEAT_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  duplicate_image:        { icon: <RotateCcw size={22} />,      label: 'Duplicate Photo Detected',     color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50' },
  old_photo:              { icon: <Clock size={22} />,           label: 'Photo Too Old',                color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-900/50' },
  ai_generated:           { icon: <Bot size={22} />,             label: 'AI Image Detected',            color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50' },
  stock_photo:            { icon: <Image size={22} />,           label: 'Stock Photo Detected',         color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50' },
  screenshot:             { icon: <Monitor size={22} />,         label: 'Screenshot Detected',          color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50' },
  gps_mismatch:           { icon: <MapPinOff size={22} />,       label: 'GPS Mismatch',                 color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-900/50' },
  indoors:                { icon: <XCircle size={22} />,         label: 'Indoor Photo',                 color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50' },
  no_grass:               { icon: <Leaf size={22} />,            label: 'No Grass Detected',            color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-900/50' },
  low_confidence:         { icon: <HelpCircle size={22} />,      label: 'Low Confidence',               color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-900/50' },
  already_verified_today: { icon: <CalendarCheck size={22} />,   label: 'Already Verified Today',       color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50' },
};

export default function ClaimPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setStreakData(null);
    }
  };

  const captureLocation = () => {
    setIsCapturingGPS(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsCapturingGPS(false);
        },
        () => {
          alert("Failed to get location. Please allow location access.");
          setIsCapturingGPS(false);
        }
      );
    } else {
      setIsCapturingGPS(false);
    }
  };

  const handleVerify = async () => {
    if (!file || !address) return;
    setIsVerifying(true);
    setResult(null);
    setStreakData(null);

    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          lat: location?.lat,
          lng: location?.lng,
          address,
        }),
      });

      const verifyData = await verifyRes.json();
      setResult(verifyData);

      // On success → call update-streak and capture the response
      if (verifyData.verified) {
        try {
          const streakRes = await fetch('/api/update-streak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });
          const sData = await streakRes.json();
          setStreakData(sData);
        } catch (err) {
          console.error('Streak update failed:', err);
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStreakData(null);
  };

  const cheatInfo = result?.cheatDetected ? CHEAT_CONFIG[result.cheatDetected] : null;

  return (
    <div className="max-w-xl mx-auto space-y-12 py-12 px-4 relative z-10">
      
      {/* Full Wash Overlay */}
      <AnimatePresence>
        {result?.verified === true && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[-1] bg-fresh-grass/60 mix-blend-multiply pointer-events-none"
          />
        )}
      </AnimatePresence>

      <Link href="/" className={`inline-flex items-center gap-3 transition-colors uppercase tracking-[0.2em] font-bold text-xs ${result?.verified ? 'text-near-black hover:text-near-black/70' : 'text-sand hover:text-parchment'}`}>
        <ArrowLeft size={16} />
        Return
      </Link>

      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className={`font-serif text-5xl md:text-6xl leading-tight ${result?.verified ? 'text-near-black' : 'text-cream-white'}`}>
            Prove You Were There.
          </h1>
          <p className={`text-sm tracking-widest uppercase font-bold ${result?.verified ? 'text-near-black/50' : 'text-sand'}`}>
            Upload a photo and capture your GPS coordinates
          </p>
        </div>

        {!isConnected ? (
          /* ── Wallet Gate ── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-earthy flex flex-col items-center text-center space-y-8 py-12"
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-earth flex items-center justify-center">
              <Camera size={28} className="text-sand" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-near-black">Connect your wallet first</h2>
              <p className="text-sand text-sm max-w-xs mx-auto">You need a connected wallet to submit proof and unlock yield.</p>
            </div>
            <button 
              onClick={connectWallet}
              className="bg-near-black text-cream-white font-bold uppercase tracking-[0.2em] py-4 px-8 text-sm hover:bg-earth transition-colors flex items-center gap-3"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          </motion.div>

        ) : result?.verified ? (
          /* ── Success State ── */
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-earthy space-y-8 bg-cream-white"
          >
            <div className="flex flex-col items-center text-center space-y-6 py-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle size={80} className="text-near-black" />
              </motion.div>
              <div className="space-y-4">
                <h2 className="font-serif text-4xl text-near-black font-bold">Verified.</h2>
                <p className="font-serif text-lg italic text-near-black/70 max-w-sm mx-auto">
                  &ldquo;{result.reason}&rdquo;
                </p>
              </div>

              {/* Yield + Streak Info from update-streak response */}
              <div className="pt-8 border-t border-near-black/10 w-full mt-4 space-y-6">
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest font-bold text-near-black/50 mb-2">Yield Unlocked</p>
                  <p className="font-mono text-4xl text-near-black font-bold">
                    +{streakData?.todayYield?.toFixed(2) ?? '1.20'} <span className="text-xl">STRK</span>
                  </p>
                </div>

                {streakData && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-near-black/10">
                    <div className="text-center">
                      <p className="font-mono text-2xl text-near-black font-bold">{streakData.streak}</p>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-near-black/50 font-bold">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-2xl text-deep-grass font-bold">{streakData.streakMultiplier.toFixed(2)}x</p>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-near-black/50 font-bold">Multiplier</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-2xl text-near-black font-bold">{streakData.totalEarned.toFixed(2)}</p>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-near-black/50 font-bold">Total STRK</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link 
              href="/" 
              className="w-full bg-near-black text-parchment font-bold uppercase tracking-[0.2em] py-5 flex justify-center items-center hover:bg-black transition-colors"
            >
              Return to Leaderboard
            </Link>
          </motion.div>

        ) : result && !result.verified ? (
          /* ── Cheat / Rejection Banner ── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`border p-6 space-y-4 ${cheatInfo?.bg || 'bg-red-950/40 border-red-900/50'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 shrink-0 ${cheatInfo?.color || 'text-red-400'}`}>
                  {cheatInfo?.icon || <XCircle size={22} />}
                </div>
                <div className="space-y-2 flex-1">
                  <p className={`font-bold text-sm uppercase tracking-wider ${cheatInfo?.color || 'text-red-400'}`}>
                    {cheatInfo?.label || 'Verification Failed'}
                  </p>
                  <p className="text-parchment text-sm leading-relaxed">{result.reason}</p>
                  {result.confidence && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-sand/60 mt-2">
                      Confidence: {result.confidence}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={resetForm}
              className="w-full bg-earth/80 text-parchment font-bold uppercase tracking-[0.2em] py-4 flex justify-center items-center gap-3 text-sm hover:bg-earth transition-colors"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </motion.div>

        ) : (
          /* ── Upload Form ── */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Photo Upload Zone */}
            <div 
              className={`border-[3px] border-dashed border-earth/50 rounded-[40px] md:rounded-[60px] rounded-bl-[10px] md:rounded-bl-[20px] overflow-hidden relative min-h-[300px] flex items-center justify-center bg-dark-soil hover:bg-near-black transition-colors cursor-pointer group ${previewUrl ? 'p-6 bg-parchment border-none shadow-xl rotate-1' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className="bg-white p-4 pb-12 shadow-md w-full h-[280px] relative pointer-events-none transform -rotate-1">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <p className="absolute bottom-4 left-0 right-0 text-center font-serif text-earth opacity-60 text-sm italic">Captured</p>
                </div>
              ) : (
                <div className="text-center space-y-4 p-6 z-10 pointer-events-none">
                  <div className="w-20 h-20 bg-earth/20 rounded-[30px] rounded-br-[10px] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <Camera size={28} className="text-sand" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl text-sand">Tap to capture</p>
                    <p className="text-xs text-earth uppercase tracking-widest font-bold mt-2">Must show the outdoors</p>
                  </div>
                </div>
              )}
            </div>

            {/* GPS Tracker */}
            <div className="border border-earth/50 bg-near-black flex items-center justify-between p-1">
              <div className="flex items-center gap-4 pl-4 py-3">
                <MapPin size={18} className={location ? "text-fresh-grass" : "text-sand"} />
                <div className="font-mono text-xs uppercase tracking-widest text-parchment">
                  {location ? (
                    <span className="text-fresh-grass">{location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</span>
                  ) : (
                    <span className="text-sand/50">COORDS UNKNOWN</span>
                  )}
                </div>
              </div>
              <button 
                onClick={captureLocation}
                disabled={isCapturingGPS}
                className="bg-earth text-parchment uppercase tracking-widest text-[10px] font-bold px-4 py-4 hover:bg-warm-brown transition-colors disabled:opacity-50 h-full"
              >
                {isCapturingGPS ? <Loader2 size={14} className="animate-spin" /> : 'Ping Satellite'}
              </button>
            </div>

            {/* Anti-cheat notice */}
            <div className="flex items-start gap-3 p-4 bg-earth/10 border border-earth/20">
              <Bot size={16} className="text-sand shrink-0 mt-0.5" />
              <p className="text-[11px] text-sand leading-relaxed">
                <span className="font-bold uppercase tracking-wider">Anti-cheat active</span> — Photos are checked for duplicates, EXIF timestamps, GPS consistency, and scanned by AI for fake, stock, or indoor images. Grass must be visible.
              </p>
            </div>

            <button 
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className="w-full bg-fresh-grass text-near-black font-bold uppercase tracking-[0.2em] py-5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm hover:shadow-[0_0_30px_rgba(168,196,74,0.2)]"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Running anti-cheat checks...
                </>
              ) : (
                'Submit Proof'
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
