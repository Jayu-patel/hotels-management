"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Hotel, Users, Calendar, DollarSign, IndianRupee, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminStats, getTopHotels } from '@/supabase/admin';
import Loader from '@/components/loader'
import { useCurrency } from '@/contexts/currency-context';

type TopHotel = {
  name: string;
  bookings: number;
  revenue: number;
};

export function AdminDashboard() {
  const [activeBookings, setActiveBookings] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalHotels, setTotalHotels] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [topHotels, setTopHotels] = useState<TopHotel[]>([]);
  const [loading, setLoading] = useState(true)
  const {currency, symbol, currencyConverter} = useCurrency()

  const stats = [
    {
      title: 'Total Hotels',
      value: totalHotels,
      change: '+2',
      changeType: 'positive' as const,
      icon: Hotel,
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      change: '+12',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+84',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Monthly Revenue',
      value: currencyConverter(monthlyRevenue),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: currency == "usd" ? DollarSign : IndianRupee,
      // <IndianRupee />
    },
  ];

  const adminStats=async()=>{
    setLoading(true)
    try{
      const {activeBookings, monthlyRevenue, totalHotels, totalUsers} = await getAdminStats()
      setActiveBookings(activeBookings);
      setMonthlyRevenue(monthlyRevenue);
      setTotalHotels(totalHotels);
      setTotalUsers(totalUsers);

      const data = await getTopHotels()
      setTopHotels(data)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    adminStats()
  },[])

  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {/* <IndianRupee /> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl">{stat.value}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Hotels */}
      {
        (!loading &&  topHotels.length == 0) ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg bg-card space-y-4 text-center">
            <Info className="w-12 h-12 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700">
              No Top-Performing Hotels Yet
            </h3>
            <p className="text-sm text-gray-600">
              There are currently no bookings with completed payments. 
              Once users start making bookings, top-performing hotels will appear here.
            </p>
          </div>
        ) :
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHotels.map((hotel, index) => (
                <div key={hotel.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm">{hotel.name}</p>
                      <p className="text-xs text-gray-600">{hotel.bookings} bookings this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">{symbol}{currencyConverter(hotel.revenue)}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
      
    </div>
  );
}