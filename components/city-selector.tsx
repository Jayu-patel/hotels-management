"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface City {
  id: number
  name: string
  country_id: number
}

interface Country {
  id: number
  name: string
}

interface CitySelectorProps {
  city: string
  setCity: (val: string) => void
  country: string
  setCountry: (val: string) => void
  className?: string
}

export function CitySelector({
  city,
  setCity,
  country,
  setCountry,
  className,
}: CitySelectorProps) {
  const supabase = createClientComponentClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(city)
  const [cityOptions, setCityOptions] = useState<City[]>([])
  const [countryCache, setCountryCache] = useState<Record<number, string>>({})

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      if (!search) {
        setCityOptions([])
        return
      }

      const { data, error } = await supabase
        .from("cities")
        .select("id, name, country_id")
        .ilike("name", `%${search}%`)

      const {data: countryData, error: countryError} = await supabase
        .from("countries")
        .select("")

      if (error) {
        console.error("Error fetching cities:", error)
        return
      }

      setCityOptions(data || [])
    }

    fetchCities()
  }, [search, supabase])

  // Fetch single country name
  const fetchCountryName = async (country_id: number) => {
    if (countryCache[country_id]) return countryCache[country_id]

    const { data, error } = await supabase
      .from("countries")
      .select("name")
      .eq("id", country_id)
      .single()

    if (error) {
      console.error("Error fetching country:", error)
      return ""
    }

    setCountryCache(prev => ({ ...prev, [country_id]: data.name }))
    return data.name
  }

  // Handle user selecting city
  const handleSelect = async (selectedCity: City) => {
    setCity(selectedCity.name)
    const countryName = await fetchCountryName(selectedCity.country_id)
    setCountry(countryName)
    setOpen(false)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* City Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            {city || "Select City"}
            <ChevronsUpDown className="opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command className="w-full">
            <CommandInput
              placeholder="Search city..."
              className="h-9 w-full"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="w-full">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {cityOptions.map(opt => (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => handleSelect(opt)}
                  >
                    {opt.name}
                    {city === opt.name && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

    </div>
  )
}

