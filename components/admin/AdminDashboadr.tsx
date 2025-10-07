"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Hotel, Users, Calendar, DollarSign, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminStats, getTopHotels } from '@/supabase/admin';
import Loader from '@/components/loader'
import { useCurrency } from '@/contexts/currency-context';

// Mock data for charts
// const revenueData = [
//   { month: 'Jan', revenue: 45000, bookings: 120 },
//   { month: 'Feb', revenue: 52000, bookings: 140 },
//   { month: 'Mar', revenue: 48000, bookings: 130 },
//   { month: 'Apr', revenue: 61000, bookings: 165 },
//   { month: 'May', revenue: 55000, bookings: 150 },
//   { month: 'Jun', revenue: 67000, bookings: 180 },
// ];

// const occupancyData = [
//   { name: 'Occupied', value: 75, color: '#3b82f6' },
//   { name: 'Available', value: 25, color: '#e5e7eb' },
// ];

const topHotels = [
  { name: 'Grand Luxury Hotel', bookings: 89, revenue: 26700 },
  { name: 'Boutique City Hotel', bookings: 67, revenue: 13330 },
  { name: 'Downtown Business Hotel', bookings: 54, revenue: 16200 },
  { name: 'Riverside Resort', bookings: 43, revenue: 17200 },
];

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
      
    </div>
  );
}