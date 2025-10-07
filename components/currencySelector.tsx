"use client";

import * as React from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = [
  { code: "usd", label: "USD", flag: "https://flagcdn.com/us.svg" },
  { code: "inr", label: "INR", flag: "https://flagcdn.com/in.svg" },
];

export function CurrencySelector({
  onCurrencyChange,
}: {
  onCurrencyChange: (currency: string) => void;
}) {
  const [currency, setCurrency] = React.useState(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("currency") as string) || "usd";
    }
    return "usd";
  });

  const selectedCurrency = currencies.find((c) => c.code === currency);

  return (
    <Select
      value={currency}
      onValueChange={(val) => {
        setCurrency(val);
        onCurrencyChange(val);
      }}
    >
      {/* Trigger (shows only one flag + label) */}
      <SelectTrigger className="sm:w-[120px] flex items-center gap-2 rounded-lg border-gray-300 shadow-sm cursor-pointer">
        {selectedCurrency && (
          <div className="flex items-center gap-2">
            <Image
              src={selectedCurrency.flag}
              alt={selectedCurrency.code}
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="hidden sm:block">{selectedCurrency.label}</span>
          </div>
        )}
      </SelectTrigger>

      {/* Dropdown options */}
      <SelectContent className="rounded-lg shadow-lg">
        {currencies.map((cur) => (
          <SelectItem key={cur.code} value={cur.code}>
            <div className="flex items-center gap-2">
              <Image
                src={cur.flag}
                alt={cur.code}
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span>{cur.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
