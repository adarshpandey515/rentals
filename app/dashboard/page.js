'use client';

import Link from 'next/link';
import {
  Users,
  Box,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  Building2,
} from 'lucide-react';

export default function Dashboard() {
  const modules = [
    {
      title: 'Companies',
      description: 'Manage lighting companies & their details',
      icon: Building2,
      href: '/companies',
      color: 'bg-purple-500',
    },
    {
      title: 'Clients',
      description: 'Manage client information',
      icon: Users,
      href: '/clients',
      color: 'bg-blue-500',
    },
    {
      title: 'Inventory',
      description: 'Manage rental inventory items',
      icon: Box,
      href: '/inventory',
      color: 'bg-green-500',
    },
    {
      title: 'Rentals',
      description: 'Create and manage rental bookings',
      icon: ShoppingCart,
      href: '/rentals',
      color: 'bg-orange-500',
    },
    {
      title: 'Invoices',
      description: 'Generate and manage invoices',
      icon: FileText,
      href: '/invoices',
      color: 'bg-red-500',
    },
    {
      title: 'Payments',
      description: 'Track payments and transactions',
      icon: CreditCard,
      href: '/payments',
      color: 'bg-yellow-500',
    },
    {
      title: 'Reports',
      description: 'View business reports and analytics',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to Rental Management System</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-lg shadow border border-border p-6">
            <p className="text-gray-400 text-sm">Total Clients</p>
            <p className="text-3xl font-bold text-foreground">--</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-6">
            <p className="text-gray-400 text-sm">Total Inventory Items</p>
            <p className="text-3xl font-bold text-foreground">--</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-6">
            <p className="text-gray-400 text-sm">Active Rentals</p>
            <p className="text-3xl font-bold text-foreground">--</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-6">
            <p className="text-gray-400 text-sm">Pending Invoices</p>
            <p className="text-3xl font-bold text-foreground">--</p>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link key={index} href={module.href}>
                <div className="bg-card rounded-lg shadow hover:shadow-lg border border-border hover:border-accent/50 transition-all cursor-pointer h-full">
                  <div className={`${module.color} text-white p-4 rounded-t-lg`}>
                    <Icon size={32} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-400">{module.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
