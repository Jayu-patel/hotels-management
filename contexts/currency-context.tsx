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
    getEffectivePrice: (room: any, checkIn?: string, checkOut?: string) => number
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

    function getEffectivePrice(room: any, checkIn?: string, checkOut?: string) {

        let checkInDate : Date;
        let checkOutDate : Date;
        
        if (!checkIn || !checkOut){
            checkInDate = new Date();
            checkOutDate = new Date();
        }
        else{
            checkInDate = new Date(checkIn);
            checkOutDate = new Date(checkOut);
        }

        const nights = (Number(checkOutDate) - Number(checkInDate)) / (1000 * 60 * 60 * 24);

        let price = room.pricePerNight;

        // Seasonal slab
        const seasonal = room.seasonalSlabs?.find(
            (s: any) =>
            checkInDate >= new Date(s.start_date) &&
            checkOutDate <= new Date(s.end_date)
        );

        if (seasonal?.price_multiplier)
            price *= seasonal.price_multiplier;

        // Duration slab
        const duration = room.durationSlabs?.find(
            (d: any) => nights >= d.min_days && nights <= d.max_days
        );

        if (duration?.discount_percent)
            price -= (price * duration.discount_percent) / 100;

        return price;
    }

    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem("usdInrRate");

        const today = new Date().toISOString().split("T")[0];
        const storedRate = localStorage.getItem("usdInrRate");
        const storedDate = localStorage.getItem("usdInrRateDate");
        if (storedRate && storedDate === today) {
            setRate(parseFloat(storedRate));
        }
        else{
            // fetch("https://api.frankfurter.app/latest?from=USD&to=INR")
            fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,INR,AUD,CAD,CHF,CNY,SGD,NZD,MXN,KRW,BRL,ZAR")
            .then(res => res.json())
            .then(data => {
                if (data?.rates) {
                    setRate(data?.rates?.INR);
                    localStorage.setItem("usdInrRate", data?.rates?.INR);
                    localStorage.setItem("usdInrRate", data.rates.INR);
                    localStorage.setItem("usdInrRateDate", today);
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
        symbol,
        getEffectivePrice
    };

    return (
        <CurrencyContext.Provider value={value}>
        {children}
        </CurrencyContext.Provider>
    );
}