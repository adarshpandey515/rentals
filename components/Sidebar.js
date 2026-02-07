'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Box,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const modules = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/',
    },
    {
      title: 'Companies',
      icon: Building2,
      href: '/companies',
    },
    {
      title: 'Clients',
      icon: Users,
      href: '/clients',
    },
    {
      title: 'Inventory',
      icon: Box,
      href: '/inventory',
    },
    {
      title: 'Rentals',
      icon: ShoppingCart,
      href: '/rentals',
    },
    {
      title: 'Invoices',
      icon: FileText,
      href: '/invoices',
    },
    {
      title: 'Payments',
      icon: CreditCard,
      href: '/payments',
    },
    {
      title: 'Reports',
      icon: BarChart3,
      href: '/reports',
    },
  ];

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <ShoppingCart size={24} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground">RentPro</span>
            <span className="text-xs text-gray-500">v1.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const active = isActive(module.href);

          return (
            <Link
              key={module.href}
              href={module.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-accent text-black font-semibold'
                  : 'text-foreground hover:bg-card/80 hover:text-accent'
              }`}
            >
              <Icon size={20} />
              <span>{module.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/settings')
              ? 'bg-accent text-black font-semibold'
              : 'text-foreground hover:bg-card/80 hover:text-accent'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
