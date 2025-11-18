// components/CityCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type CityCardProps = {
  city: string;
  country: string;
  image: string;
  cityName: string;
  countryName: string
};

export function CityCard({ city, country, image, cityName, countryName }: CityCardProps) {
  return (
    <Link href={`/hotels/explore?country=${country}&city=${city}`}>
      <div className="relative overflow-hidden rounded-xl cursor-pointer group">
        <Image
          src={image}
          alt={city}
          width={600}
          height={400}
          className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute bottom-4 sm:left-4">
          <div className="flex items-center">
            <div className="text-white font-bold text-2xl px-3">
              HOTELS
            </div>
            <div className="text-white font-extrabold text-2xl">
              IN
            </div>
          </div>

          <div className="text-white text-2xl sm:text-3xl 2xl:text-4xl font-extrabold px-3">
            {cityName.toUpperCase() || countryName.toUpperCase()}
          </div>
        </div>
      </div>
    </Link>
  );
}
