import React, { createContext, useContext, useState, useCallback } from 'react';

interface CurrencyContextType {
  bcvRate: number;
  setBcvRate: (rate: number) => void;
  convertToVES: (usd: number) => number;
  convertToUSD: (ves: number) => number;
  formatDualPrice: (usd: number) => string;
  formatUSD: (amount: number) => string;
  formatVES: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Tasa BCV inicial (ejemplo: 1 USD = 45 VES)
  const [bcvRate, setBcvRate] = useState<number>(45);

  const convertToVES = useCallback((usd: number): number => {
    return usd * bcvRate;
  }, [bcvRate]);

  const convertToUSD = useCallback((ves: number): number => {
    return ves / bcvRate;
  }, [bcvRate]);

  const formatUSD = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatVES = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatDualPrice = useCallback((usd: number): string => {
    const ves = convertToVES(usd);
    return `${formatUSD(usd)} / ${formatVES(ves)}`;
  }, [convertToVES, formatUSD, formatVES]);

  return (
    <CurrencyContext.Provider
      value={{
        bcvRate,
        setBcvRate,
        convertToVES,
        convertToUSD,
        formatDualPrice,
        formatUSD,
        formatVES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
