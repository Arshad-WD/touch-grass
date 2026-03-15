'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';

export default function StakePage() {
  const { isConnected, connectWallet, address } = useWallet();
  const [amount, setAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    setIsStaking(true);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success
    setTxHash('0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    setIsSuccess(true);
    setIsStaking(false);
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    connectWallet();
  };

  return (
    <div className="min-h-screen bg-black pt-32 px-6">
      <div className="max-w-[480px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#666666] hover:text-white transition-colors mb-16 font-sans text-[11px] tracking-[0.2em] uppercase">
          <ArrowLeft size={14} />
          Return
        </Link>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="stake-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="font-serif text-[56px] text-white leading-tight mb-12 text-center">Stake STRK</h1>
              
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-[4px] p-12">
                <form onSubmit={handleStake} className="space-y-12">
                  <div className="space-y-4 text-center">
                    <label className="font-sans text-[11px] text-[#444444] tracking-[0.2em] uppercase block">
                      Amount to Stake
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent border-none border-b border-[#333333] text-white font-serif text-[48px] text-center focus:outline-none focus:border-[#A8C44A] transition-colors py-4 appearance-none placeholder-[#222222]"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    {isConnected && (
                      <p className="font-sans text-[11px] text-[#A8C44A] tracking-wider text-right">
                        Balance: 500.25 STRK
                      </p>
                    )}
                  </div>

                  <div className="w-full h-[1px] bg-[#111111]" />

                  <div className="flex justify-between items-center">
                      <div>
                          <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] mb-2 uppercase">Proj. Daily Rate</p>
                          <p className="font-sans text-[14px] text-white">~35% APR</p>
                      </div>
                      <div className="text-right">
                          <p className="font-sans text-[11px] text-[#444444] tracking-[0.2em] mb-2 uppercase">Unlock Yield</p>
                          <p className="font-sans text-[14px] text-[#A8C44A]">via daily verification</p>
                      </div>
                  </div>

                  {!isConnected ? (
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="w-full bg-[#A8C44A] text-black py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:brightness-110 uppercase"
                    >
                      Connect to Stake
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isStaking || !amount || Number(amount) <= 0}
                      className="w-full bg-[#A8C44A] text-black py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:brightness-110 uppercase disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isStaking ? <><Loader2 size={16} className="animate-spin" /> Approving...</> : 'Confirm Stake'}
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stake-success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#A8C44A]/10 border border-[#A8C44A]/30 flex items-center justify-center mx-auto mb-8">
                <Check className="text-[#A8C44A]" size={24} />
              </div>
              
              <h1 className="font-serif text-[48px] text-white mb-6 leading-tight">Stake Active</h1>
              <p className="font-sans text-[#666666] mb-12">Your capital is now secured. Go outside to claim your first yield.</p>

              <div className="bg-[#A8C44A]/[0.04] border border-[#A8C44A]/20 rounded-[2px] p-8 space-y-4 mb-12">
                <div className="flex justify-between text-[11px] font-sans tracking-wide">
                  <span className="text-[#666666] uppercase">Amount Staked</span>
                  <span className="text-white font-mono">{Number(amount).toFixed(2)} STRK</span>
                </div>
                <div className="flex justify-between text-[11px] font-sans tracking-wide">
                  <span className="text-[#666666] uppercase">Txn Hash</span>
                  <span className="text-[#666666] font-mono">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                </div>
              </div>

              <Link
                href="/"
                className="w-full inline-block bg-[#A8C44A] text-black py-4 font-sans text-[12px] tracking-[0.15em] rounded-[2px] transition-all hover:brightness-110 uppercase"
              >
                Return to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
