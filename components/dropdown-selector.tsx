"use client"

import { useState } from "react"
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ComboBoxProps<T> {
  value: string
  onChange: (val: string) => void
  options: T[]
  valueKey: keyof T
  labelKey: keyof T
  placeholder?: string
  className?: string
}

export function ComboBox<T>({
  value,
  onChange,
  options,
  valueKey,
  labelKey,
  placeholder = "Select...",
  className,
}: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-48 justify-between", className)}>
          {value ? String(options.find(i => i[valueKey] === value)?.[labelKey]) : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-48 p-0", className)}>
        <Command>
          <CommandInput placeholder={`${placeholder}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={String(item[valueKey])}
                  value={String(item[valueKey])}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {String(item[labelKey])}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === String(item[valueKey]) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
