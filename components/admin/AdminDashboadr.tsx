"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Hotel, Users, Calendar, DollarSign, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminStats, getTopHotels } from '@/supabase/admin';
import Loader from '@/components/loader'

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
      value: monthlyRevenue,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
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

      {/* Charts Row */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  <p className="text-3xl text-blue-600">75%</p>
                  <p className="text-sm text-gray-600">Current Occupancy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

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
                  <p className="text-sm text-green-600">${hotel.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New booking', details: 'Grand Luxury Hotel - Executive Suite', time: '2 hours ago', type: 'booking' },
              { action: 'Hotel added', details: 'Seaside Resort & Spa', time: '4 hours ago', type: 'hotel' },
              { action: 'User registered', details: 'john.doe@email.com', time: '6 hours ago', type: 'user' },
              { action: 'Booking cancelled', details: 'Boutique City Hotel - Standard Room', time: '8 hours ago', type: 'cancellation' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border-l-4 border-blue-600 bg-blue-50">
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}