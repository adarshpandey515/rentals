'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[100] p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      {/* Logo */}
      <div className="mb-8 mt-8 md:mt-0">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
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
              onClick={() => setIsOpen(false)}
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
          onClick={() => setIsOpen(false)}
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
    </>
  );
}
