"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus
} from "lucide-react";
import Link from "next/link";
import { rentalActions } from "@/lib/db";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, dueToday: 0, pendingPayments: 0, revenue: 0 });
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        rentalActions.getStats(),
        rentalActions.getRecent()
      ]);
      setStats(statsData);
      setRecentRentals(recentData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Main Content */}
      <main className="p-2 xs:p-3 sm:p-4 lg:p-8 w-full max-w-screen overflow-hidden">
        <header className="flex flex-col xs:gap-2 sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold truncate">Welcome back, Admin</h2>
            <p className="text-gray-400 text-xs xs:text-sm sm:text-base truncate">Here's what's happening with your rentals today.</p>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 text-xs xs:text-sm sm:text-base">
            <Link
              href="/inventory"
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-card border border-border text-gray-400 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
            >
              <Package size={18} />
              <span className="hidden sm:inline">Manage Gear</span>
            </Link>
            <Link
              href="/rentals/create"
              className="px-4 sm:px-6 py-2 sm:py-2.5 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Rental</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Active Rentals", value: stats.active.toString(), icon: Clock, color: "text-blue-400" },
            { label: "Returns Due Today", value: stats.dueToday.toString(), icon: AlertCircle, color: "text-orange-400" },
            { label: "Pending Payments", value: `₹${stats.pendingPayments.toLocaleString()}`, icon: Receipt, color: "text-red-400" },
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
          ].map((stat, i) => (
            <div key={i} className="premium-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Real-time</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{loading ? "..." : stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 premium-card">
            <h3 className="text-xl font-bold mb-6">Recent Rentals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-border">
                    <th className="pb-4 font-medium">Client</th>
                    <th className="pb-4 font-medium">Items</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4"><div className="h-10 w-32 bg-white/5 rounded-lg"></div></td>
                        <td className="py-4"><div className="h-6 w-24 bg-white/5 rounded-lg"></div></td>
                        <td className="py-4"><div className="h-6 w-20 bg-white/5 rounded-lg"></div></td>
                        <td className="py-4 text-right"><div className="h-6 w-16 bg-white/5 rounded-lg ml-auto"></div></td>
                      </tr>
                    ))
                  ) : recentRentals.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-500">No recent rentals found.</td>
                    </tr>
                  ) : (
                    recentRentals.map((rental) => (
                      <tr key={rental.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="font-medium">{rental.clientName}</div>
                          <div className="text-xs text-gray-500">{rental.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-4 text-sm text-gray-400">
                          {rental.items?.length} items • {rental.nod} days
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${rental.status === 'Active' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                            'bg-green-400/10 text-green-400 border-green-400/20'
                            }`}>
                            {rental.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold">₹{Number(rental.total || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="premium-card">
            <h3 className="text-xl font-bold mb-6">Inventory Alerts</h3>
            <div className="space-y-6">
              {[
                { item: "ARRI Skypanel S60", status: "Low Stock", count: "2 left", color: "text-orange-400" },
                { item: "C-Stands (Heavy Duty)", status: "Out of Stock", count: "0 left", color: "text-red-400" },
                { item: "LED Panel 1x1", status: "Damaged", count: "3 units", color: "text-gray-400" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full bg-current ${alert.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{alert.item}</div>
                    <div className="text-sm text-gray-500">{alert.status} • {alert.count}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/inventory"
              className="block w-full mt-8 py-3 rounded-xl border border-border text-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              View All Inventory
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
