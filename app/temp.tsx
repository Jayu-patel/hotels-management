import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Users } from 'lucide-react';
import React, { useState } from 'react'

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

export default function temp() {
  const [guestCount, setGuestCount] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  })
  return (
    <div>
      <div className="space-y-2 relative">
        <label className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Guests
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left"
            >
              <span>
                {guestCount.adults + guestCount.children + guestCount.infants} Guest
                {guestCount.adults + guestCount.children + guestCount.infants > 1 ? 's' : ''}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              {([
                { label: 'Adults', key: 'adults', min: 1, max: 10 },
                { label: 'Children', key: 'children', min: 0, max: 5 },
                { label: 'Infants', key: 'infants', min: 0, max: 5 },
              ] as const).map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-gray-500">
                      {item.label === 'Adults'
                        ? 'Ages 13+'
                        : item.label === 'Children'
                        ? 'Ages 2-12'
                        : 'Under 2'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={guestCount[item.key as keyof GuestCount] <= item.min}
                      onClick={() =>
                        setGuestCount((prev) => ({
                          ...prev,
                          [item.key]: Math.max(
                            prev[item.key as keyof GuestCount] - 1,
                            item.min
                          ),
                        }))
                      }
                    >
                      -
                    </Button>
                    <span>{guestCount[item.key as keyof GuestCount]}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        guestCount[item.key as keyof GuestCount] >= item.max ||
                        guestCount.adults + guestCount.children + guestCount.infants >= 10
                      }
                      onClick={() =>
                        setGuestCount((prev) => ({
                          ...prev,
                          [item.key]: Math.min(
                            prev[item.key as keyof GuestCount] + 1,
                            item.max
                          ),
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
