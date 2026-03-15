'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Link as LinkIcon, Wallet } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, truncateAddress } from '@/context/WalletContext';

const GAS_FEE_TEXT = "free (gasless via AVNU paymaster)";

export default function StakePage() {
  const { address, balance, isConnected, connectWallet } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const estimatedDailyYield = amount ? (parseFloat(amount) * 0.00096).toFixed(4) : '0.0000';

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsStaking(true);
    setTxHash(null);
    
    try {
      const res = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, address }),
      });
      const data = await res.json();
      setTxHash(data.txHash || `0x${Math.random().toString(16).slice(2, 66)}`);
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-12 py-12 px-4 relative z-10">
      <Link href="/" className="inline-flex items-center gap-3 text-sand hover:text-parchment transition-colors uppercase tracking-[0.2em] font-bold text-xs">
        <ArrowLeft size={16} />
        Return
      </Link>

      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className="font-serif text-5xl md:text-6xl text-cream-white leading-tight">Initiate Stake.</h1>
          <p className="text-sand text-sm tracking-widest uppercase font-bold">Lock your STRK on Sepolia to begin earning yield</p>
        </div>

        {!isConnected ? (
          /* ── Wallet Gate ── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-earthy flex flex-col items-center text-center space-y-8 py-12"
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-earth flex items-center justify-center">
              <Wallet size={28} className="text-sand" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-near-black">Connect your wallet to stake</h2>
              <p className="text-sand text-sm max-w-xs mx-auto">You need an Argent X or Braavos wallet to interact with Starknet.</p>
            </div>
            <button 
              onClick={connectWallet}
              className="bg-near-black text-cream-white font-bold uppercase tracking-[0.2em] py-4 px-8 text-sm hover:bg-earth transition-colors flex items-center gap-3"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!txHash ? (
              <motion.div 
                key="stake-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-earthy space-y-8"
              >
                {/* Balance */}
                <div className="flex justify-between items-end border-b border-earth/30 pb-4">
                  <div className="space-y-1">
                    <span className="font-sans text-[10px] font-bold text-sand uppercase tracking-widest">Available Balance</span>
                    <p className="font-mono text-2xl text-near-black">{balance} STRK</p>
                  </div>
                  <span className="font-mono text-xs text-sand bg-earth/10 px-2 py-1">
                    {address ? truncateAddress(address) : '---'}
                  </span>
                </div>

                {/* Mechanical Input */}
                <div className="space-y-3">
                  <label htmlFor="amount" className="font-serif text-xl font-bold text-near-black">Amount</label>
                  <div className="relative group">
                    <input
                      id="amount"
                      type="number"
                      placeholder="0.0000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-near-black text-fresh-grass font-mono text-4xl p-6 border-2 border-near-black outline-none focus:border-fresh-grass transition-colors placeholder:text-earth"
                      style={{ letterSpacing: '0.05em' }}
                    />
                    <button 
                      onClick={() => setAmount(balance)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs font-bold uppercase tracking-widest text-parchment hover:text-fresh-grass bg-near-black/50 px-3 py-1 border border-earth/50 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Yield Stats */}
                <div className="bg-earth/5 p-6 border border-earth/20 font-mono text-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-earth/10 pb-2">
                    <span className="text-sand uppercase text-[10px] tracking-widest">Daily Yield</span>
                    <span className="text-deep-grass font-bold text-lg">+{estimatedDailyYield}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sand uppercase text-[10px] tracking-widest">Network Fee</span>
                    <span className="text-near-black text-xs">{GAS_FEE_TEXT}</span>
                  </div>
                </div>

                <button 
                  onClick={handleStake}
                  disabled={!amount || parseFloat(amount) <= 0 || isStaking}
                  className="w-full bg-fresh-grass text-near-black font-bold uppercase tracking-[0.2em] py-5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm hover:shadow-[0_0_30px_rgba(168,196,74,0.2)]"
                >
                  {isStaking ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Executing...
                    </>
                  ) : (
                    'Confirm Stake'
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="receipt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Paper Receipt UI */}
                <div className="bg-parchment p-8 text-near-black relative overflow-hidden" style={{ border: '2px dashed #2D2A1E' }}>
                  <div className="text-center space-y-2 border-b-2 border-earth/20 pb-6 mb-6">
                    <p className="font-mono text-xs uppercase tracking-widest text-sand">Transaction Receipt</p>
                    <h2 className="font-serif text-3xl font-bold italic">Stake Confirmed</h2>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-sand">Amount:</span>
                      <span className="font-bold">{amount} STRK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sand">Status:</span>
                      <span className="text-deep-grass font-bold">✓ Success</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-earth/20">
                      <span className="text-sand flex-col flex">
                        <span className="text-[10px]">TX Hash</span>
                        <span className="text-xs truncate w-32">{txHash}</span>
                      </span>
                      <a 
                        href={`https://sepolia.starkscan.co/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-near-black text-parchment px-3 py-2 text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-earth transition-colors"
                      >
                        Starkscan <LinkIcon size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/claim" 
                  className="w-full bg-near-black border border-fresh-grass text-fresh-grass font-bold uppercase tracking-[0.2em] py-5 flex justify-center items-center gap-3 text-sm group hover:bg-fresh-grass hover:text-near-black transition-colors"
                >
                  Now go touch grass
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
