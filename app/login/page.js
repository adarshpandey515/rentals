"use client";

import React, { useState } from "react";
import { TrendingUp, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 premium-gradient rounded-2xl shadow-xl shadow-accent/20 mb-6">
                        <TrendingUp className="text-black" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">LightBill <span className="text-accent">Pro</span></h1>
                    <p className="text-gray-400">Sign in to manage your rental business</p>
                </div>

                <div className="premium-card">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-input border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    placeholder="admin@lightbillpro.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-input border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                                <input type="checkbox" className="rounded border-border bg-input text-accent focus:ring-accent" />
                                Remember me
                            </label>
                            <a href="#" className="text-accent hover:underline">Forgot password?</a>
                        </div>

                        <Link
                            href="/"
                            className="w-full py-4 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                            Sign In
                            <ArrowRight size={20} />
                        </Link>
                    </form>
                </div>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    Don't have an account? <a href="#" className="text-accent hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}
