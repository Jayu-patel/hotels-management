"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface CurrencyContextType {
    rate: number;
    loading: boolean;
    currency: "usd" | "inr";
    setCurrency: (value: Currency) => void;
    currencyConverter: (price: number) => number;
    symbol: string;
}

type Currency = "usd" | "inr";

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within an CurrencyProvider');
  }
  return context;
}


interface CurrencyProviderProps {
  children: React.ReactNode;
}

export function CurrencyProvider({children}: CurrencyProviderProps){
    const [loading, setLoading] = useState(false)
    const [currency, setCurrencyState] = useState<Currency>("usd");
    const [rate, setRate] = useState(0)
    const [symbol, setSymbol] = useState("$");

    const currencyConverter = (price: number) => {
        if (!rate) return Math.floor(price);

        const converted = currency === "inr" ? price * rate : price;
        return Math.floor(converted);
    };


    const setCurrency = (value: Currency) => {
        setCurrencyState(value);
        setSymbol(value === "usd" ? "$" : "₹");
        if (typeof window !== "undefined") {
            localStorage.setItem("currency", value);
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem("usdInrRate");
        if (stored) {
            setRate(parseFloat(stored));
        }
        else{
            fetch("https://api.frankfurter.app/latest?from=USD&to=INR")
            .then(res => res.json())
            .then(data => {
                if (data?.rates) {
                    setRate(data?.rates?.INR);
                    localStorage.setItem("usdInrRate", data?.rates?.INR);
                }
            });
        }
    }, [rate]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("currency") as Currency | null;
        if (stored){
            setCurrency(stored);
            setSymbol(stored == "usd" ? "$" : "₹")
        } 
    }, []);

    const value = {
        rate,
        loading,
        currency,
        setCurrency,
        currencyConverter,
        symbol
    };

    return (
        <CurrencyContext.Provider value={value}>
        {children}
        </CurrencyContext.Provider>
    );
}