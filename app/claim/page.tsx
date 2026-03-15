'use client';

import React, { useState, useRef } from 'react';
import { Camera, MapPin, ArrowLeft, Loader2, Bot, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

// ... interface and defaults same as before but minimalized for dark cinematic styling

export default function ClaimPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [streakData, setStreakData] = useState<Record<string, unknown> | null>(null);
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
          alert("Failed to get location.");
          setIsCapturingGPS(false);
        }
      );
    } else setIsCapturingGPS(false);
  };

  const handleVerify = async () => {
    if (!file || !address) return;
    setIsVerifying(true);
    setResult(null);

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

      if (verifyData.verified) {
        try {
          const streakRes = await fetch('/api/update-streak', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ address })
          });
          const sData = await streakRes.json();
          setStreakData(sData);
        } catch {
          // ignore streak update errors
        }
      }
    } catch {
      // ignore
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-black pt-32 px-6 relative">
      <AnimatePresence>
        {result && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8 }}
             className={`fixed inset-0 pointer-events-none z-0 mix-blend-screen scale-110 ${
                 result.verified 
                 ? 'bg-[rgba(168,196,74,0.08)]' 
                 : 'bg-[rgba(255,60,60,0.06)]'
             }`}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[480px] mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-[#666666] hover:text-white transition-colors mb-12 font-sans text-[11px] tracking-[0.2em] uppercase">
          <ArrowLeft size={14} />
          Return
        </Link>
        
        <h1 className="font-serif text-[56px] text-white leading-tight mb-4">Verification</h1>
        <p className="font-sans text-[11px] text-[#666666] tracking-[0.2em] uppercase mb-12">Capture your surroundings</p>

        {!isConnected ? (
           <div className="bg-white/[0.03] border border-white/[0.08] p-12 text-center rounded-[2px]">
              <h2 className="font-serif text-[24px] text-white mb-4">Wallet Required</h2>
              <p className="font-sans text-[14px] text-[#666666] mb-8">Connect your wallet to upload proof and claim yield.</p>
              <button 
                 onClick={connectWallet}
                 className="bg-[#A8C44A] text-black px-8 py-3.5 text-[12px] tracking-[0.15em] font-sans rounded-[2px] hover:brightness-110 uppercase"
              >
                  Connect Wallet
              </button>
           </div>
        ) : result?.verified ? (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white/[0.03] border border-white/[0.08] p-12 text-center rounded-[2px]"
           >
              <h2 className="font-serif text-[48px] text-[#A8C44A] mb-4">Accepted.</h2>
              <p className="font-sans text-[14px] text-[#666666] italic bg-[#111111] p-4 rounded-[2px] mb-8 border border-[#222222]">
                  &quot;{String(result.reason)}&quot;
              </p>
              <div className="border-t border-[#111111] pt-8 mt-8">
                  <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] uppercase mb-2">Yield Unlocked</p>
                  <p className="font-serif text-[48px] text-white leading-none mb-8">+{Number(streakData?.todayYield || 1.20).toFixed(2)}</p>
                  
                  <Link href="/" className="block w-full bg-white/10 text-white py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:bg-white/20 border border-white/20 uppercase">
                     Return to Dashboard
                  </Link>
              </div>
           </motion.div>
        ) : (
           <motion.div className="space-y-6">
              {result && !result.verified && (
                 <div className="border border-red-900/50 bg-red-950/20 p-6 flex gap-4 rounded-[2px]">
                     <div className="text-red-500 mt-1"><RotateCcw size={20}/></div>
                     <div>
                         <p className="font-sans text-[12px] font-medium text-red-400 tracking-wider uppercase mb-1">Cheat Detected</p>
                         <p className="font-sans text-[14px] text-[#999999]">{String(result.reason)}</p>
                     </div>
                 </div>
              )}

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative min-h-[300px] flex items-center justify-center cursor-pointer transition-all duration-500 rounded-[2px] ${
                    previewUrl 
                    ? 'p-4 bg-white/[0.03] border border-[#333333] -rotate-1 shadow-2xl hover:rotate-0' 
                    : 'bg-transparent border border-[#222222] hover:border-[#444444]'
                }`}
              >
                 <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                 
                 {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover filter contrast-[1.1] grayscale-[0.2]" />
                 ) : (
                    <div className="text-center">
                        <Camera size={32} className="text-[#333333] mx-auto mb-4" />
                        <p className="font-serif text-[24px] text-[#666666]">Tap to capture</p>
                    </div>
                 )}
              </div>

              <div className="flex justify-between items-center border border-[#222222] bg-[#0A0A0A] p-1 rounded-[2px] mt-4">
                  <div className="flex items-center gap-3 pl-4">
                      <MapPin size={16} className={location ? "text-[#A8C44A]" : "text-[#444444]"} />
                      <span className="font-mono text-[12px] text-[#A8C44A]">
                          {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : <span className="text-[#444444] tracking-widest">AWAITING GPS</span>}
                      </span>
                  </div>
                  <button onClick={captureLocation} disabled={isCapturingGPS} className="bg-[#111111] text-[#999999] px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-[#222222] disabled:opacity-50">
                      Sync Loop
                    </button>
              </div>

              <div className="flex gap-3 text-[#444444] my-6 p-4 border border-[#111111] bg-[#0A0A0A]">
                  <Bot size={16} className="shrink-0 mt-0.5" />
                  <p className="font-sans text-[11px] leading-relaxed tracking-wide">Anti-cheat active. AI vision and GPS signatures are strictly verified on submission.</p>
              </div>

              <button 
                onClick={handleVerify}
                disabled={!file || isVerifying}
                className="w-full bg-[#A8C44A] text-black py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:brightness-110 uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : 'Initialize Verification'}
              </button>
           </motion.div>
        )}
      </div>
    </div>
  );
}
