'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StakePage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [staking, setStaking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.00');

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      // Mock fetching balance for demo purposes
      setBalance('500.00');
    }
  }, []);

  const estimatedYield = (parseFloat(amount) || 0) * 0.00096;

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
    setBalance('500.00');
  };

  const handleStake = async () => {
    setStaking(true);
    try {
      const res = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          address: walletAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        setTxHash(data.txHash);
      }
    } catch (e) {
      console.error(e);
    }
    setStaking(false);
  };

  const isDisabled = !amount || parseFloat(amount) <= 0 || staking || !walletAddress;

  return (
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
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, marginBottom: '8px' }}>
          Initiate Stake.
        </h1>
        <p style={{ fontSize: '13px', color: '#444', marginBottom: '60px', letterSpacing: '0.02em' }}>
          Lock your STRK. Go outside. Earn yield.
        </p>

        {!txHash ? (
          <>
            {/* Input Section */}
            <label style={{ fontSize: '10px', color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              Amount
            </label>
            <div style={{ position: 'relative', marginBottom: '48px' }}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.0000"
                style={{
                  width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #222', color: 'white', fontSize: '48px', fontFamily: 'var(--serif)', padding: '8px 80px 16px 0', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderBottomColor = 'var(--green)'}
                onBlur={e => e.target.style.borderBottomColor = '#222'}
              />
              <span style={{ position: 'absolute', right: 0, bottom: '16px', fontSize: '16px', color: '#333' }}>STRK</span>
              <button
                onClick={() => setAmount(balance)}
                style={{ position: 'absolute', right: 0, top: 0, background: 'transparent', border: '1px solid #222', color: '#444', padding: '4px 10px', fontSize: '10px', letterSpacing: '0.1em', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#444'}
              >
                MAX
              </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#0D0D0D', border: '1px solid #0D0D0D', marginBottom: '40px' }}>
              <div style={{ background: '#000', padding: '20px 24px' }}>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Available Balance</p>
                <p style={{ fontSize: '14px', color: 'white' }}>{balance} STRK</p>
              </div>
              <div style={{ background: '#000', padding: '20px 24px' }}>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Daily Yield</p>
                <p style={{ fontSize: '14px', color: 'var(--green)' }}>+{estimatedYield.toFixed(4)} STRK</p>
              </div>
              <div style={{ background: '#000', padding: '20px 24px' }}>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Network</p>
                <p style={{ fontSize: '14px', color: 'white' }}>Starknet Sepolia</p>
              </div>
              <div style={{ background: '#000', padding: '20px 24px' }}>
                <p style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Gas Fee</p>
                <p style={{ fontSize: '14px', color: 'var(--green)' }}>Free (Gasless)</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isDisabled}
              onClick={handleStake}
              style={{
                width: '100%', background: isDisabled ? '#0A0A0A' : 'var(--green)', border: isDisabled ? '1px solid #111' : 'none', color: isDisabled ? '#222' : '#000', padding: '18px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: '2px', transition: 'all 0.3s', cursor: isDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              {!walletAddress ? 'CONNECT WALLET FIRST' : staking ? 'STAKING...' : 'STAKE STRK'}
            </button>
          </>
        ) : (
          /* Receipt */
          <div style={{ border: '1px solid var(--green-dim)', background: 'var(--green-glow)', padding: '40px', borderRadius: '2px' }}>
            <p style={{ fontSize: '10px', color: 'var(--green)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>
              ✓ Stake Confirmed
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #0D0D0D', fontSize: '13px' }}>
              <span style={{ color: '#444' }}>Amount Staked</span>
              <span style={{ color: 'white' }}>{amount} STRK</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #0D0D0D', fontSize: '13px' }}>
              <span style={{ color: '#444' }}>Network</span>
              <span style={{ color: 'white' }}>Starknet Sepolia</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #0D0D0D', fontSize: '13px' }}>
              <span style={{ color: '#444' }}>Status</span>
              <span style={{ color: 'var(--green)' }}>Confirmed</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #0D0D0D', fontSize: '13px' }}>
              <span style={{ color: '#444' }}>Transaction</span>
              <a href={`https://sepolia.starkscan.co/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                {txHash.slice(0, 8)}...{txHash.slice(-6)}
              </a>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href={`https://sepolia.starkscan.co/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ background: 'transparent', border: '1px solid #222', color: '#666', padding: '12px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', flex: 1 }}>
                VIEW ON STARKSCAN
              </a>
              <button onClick={() => router.push('/claim')} style={{ background: 'var(--green)', border: 'none', color: '#000', padding: '12px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1 }}>
                CLAIM YIELD →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
