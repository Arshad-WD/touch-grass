'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0.00',
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

function truncateAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [isConnecting, setIsConnecting] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tg_wallet_address');
    if (saved) {
      setAddress(saved);
      fetchBalance(saved);
    }
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const { RpcProvider, uint256, CallData } = await import('starknet');
      const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.public.blastapi.io' });
      
      const result = await provider.callContract({
        contractAddress: STRK_TOKEN,
        entrypoint: 'balanceOf',
        calldata: CallData.compile({ account: addr }),
      });

      // STRK has 18 decimals. result is [low, high] uint256
      const bal = uint256.uint256ToBN({ low: result[0], high: result[1] });
      const formatted = (Number(bal) / 1e18).toFixed(2);
      setBalance(formatted);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance('0.00');
    }
  };

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { connect } = await import('get-starknet');
      const starknet: any = await connect();
      
      if (!starknet) {
        setIsConnecting(false);
        return;
      }

      await starknet.enable();
      
      if (starknet.selectedAddress) {
        const addr: string = starknet.selectedAddress;
        setAddress(addr);
        localStorage.setItem('tg_wallet_address', addr);
        fetchBalance(addr);
      }
    } catch (err) {
      console.error('Wallet connect failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance('0.00');
    localStorage.removeItem('tg_wallet_address');
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      isConnected: !!address,
      isConnecting,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export { truncateAddress };
