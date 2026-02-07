import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LightBill Pro | Shooting Lights Rental ERP",
  description: "Professional rental management and billing for shooting lights business",
};

import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <Sidebar />
        <main className="ml-64 min-h-screen bg-background">
          {children}
        </main>
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(23, 23, 23, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
