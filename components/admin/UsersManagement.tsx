"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Filter, User, UserCheck, UserX, Calendar, Plus } from 'lucide-react';
import { getAllUsers, userStatistic } from '@/supabase/users';
import { toast } from 'react-toastify';
import Loader from '@/components/loader'
import PaginationComponent from '@/components/pagination'
import {AddUserDialog, EditUserDialog } from './UserAction';
import { supabase } from '@/lib/supabase/client';


interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Inactive' | 'Suspended';
  totalBookings: number;
  totalSpent: number;
  lastLogin: Date;
  createdAt: Date;
  phoneNumber?: string;
  address?: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // const [roleFilter, setRoleFilter] = useState('All');
  // const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [totalUsers, setTotalUserss] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState<number>(0);
  // const [totalGuests, setTotalGuests] = useState<number>(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState<number>(0);

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'default';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserStatistic=async()=>{
    try{
      const {totalUsers, newUsersThisMonth} = await userStatistic()
      setTotalUsers(totalUsers);
      // setTotalGuests(totalGuests);
      setNewUsersThisMonth(newUsersThisMonth);
    }
    catch(err: any){
      toast.error(err.message)
    }
  }

  const initialFetch=async()=>{
    setLoading(true);
    await fetchUsers()
    await getUserStatistic()
    setLoading(false);
  }
  const fetchUsers=async()=>{
    try{
      const { users, totalPages } = await getAllUsers({page, size: 8, searchTerm});
      if(users){
        setUsers(users);
        setTotalPages(totalPages);
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
  }

  useEffect(()=>{
    const channel = supabase.channel("user_update")

    channel
    .on("postgres_changes", {event: "*", schema: "public", table: "profiles"}, (payload)=>{
      fetchUsers()
    })
    .subscribe((status) => {
      console.log("Realtime channel status:", status)
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },[])

  useEffect(()=>{
    fetchUsers()
  },[page, searchTerm])
  
  useEffect(()=>{
    initialFetch()
  },[])

  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl">{totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Guests</p>
                <p className="text-2xl">{totalGuests}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <UserX className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New This Month</p>
                <p className="text-2xl">{newUsersThisMonth}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <CardTitle>Users Management</CardTitle>
          <Button onClick={()=>{setIsAddOpen(true)}}>
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  {/* <TableHead>Last Login</TableHead> */}
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className="text-xs text-gray-500">
                              {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell> */}
                    <TableCell>{user.totalBookings}</TableCell>
                    <TableCell>${user.totalSpent.toLocaleString()}</TableCell>
                    {/* <TableCell>
                      <div className="text-sm">
                        {user.lastLogin.toLocaleDateString()}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                        {/* {user.createdAt.toLocaleDateString()} */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.role !== 'admin' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>{
                                setSelectedUser(user)
                                setIsEditOpen(true)
                              }}
                            >
                              Edit
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserStatus(user.id, 'Suspended')}
                            >
                              Suspend
                            </Button> */}
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserStatus(user.id, 'Inactive')}
                            >
                              Deactivate
                            </Button> */}
                          </>
                        )}
                        {/* {user.status === 'Suspended' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, 'Active')}
                          >
                            Activate
                          </Button>
                        )}
                        {user.status === 'Inactive' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, 'Active')}
                          >
                            Activate
                          </Button>
                        )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <PaginationComponent page={page} totalPages={totalPages} onPageChange={(newPage)=>{setPage(newPage)}}/>
          </div>

          {isAddOpen && (
            <AddUserDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
          )}

          {/* Edit User Popup */}
          {isEditOpen && selectedUser && (
            <EditUserDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              user={selectedUser}
            />
          )}

          {users?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No users found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}