"use client";

import React, { useState, useEffect } from "react";
import {
    Receipt,
    ArrowLeft,
    Search,
    Filter,
    Plus,
    CheckCircle2,
    Clock,
    CreditCard,
    Banknote,
    Smartphone,
    X
} from "lucide-react";
import Link from "next/link";

import { paymentActions, clientActions } from "@/lib/db";
import { toast } from "sonner";

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [newPayment, setNewPayment] = useState({
        clientName: "",
        amount: 0,
        mode: "Bank Transfer",
        date: new Date().toISOString().split('T')[0],
        status: "Completed"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsData, clientsData] = await Promise.all([
                paymentActions.getAll(),
                clientActions.getAll()
            ]);
            setPayments(paymentsData);
            setClients(clientsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Database Error: Could not fetch payments.");
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await paymentActions.add(newPayment);
            setModalOpen(false);
            setNewPayment({
                clientName: "",
                amount: 0,
                mode: "Bank Transfer",
                date: new Date().toISOString().split('T')[0],
                status: "Completed"
            });
            fetchData();
            toast.success("Payment recorded successfully!");
        } catch (error) {
            console.error("Error recording payment:", error);
            toast.error("Failed to record payment: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-2 xs:p-3 sm:p-4 lg:p-8 overflow-x-hidden w-full max-w-screen">
            <div className="w-full">
                <header className="flex flex-col xs:gap-2 sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 pt-4 xs:pt-6 sm:pt-0">
                    <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
                            <ArrowLeft size={20} className="xs:w-6 xs:h-6 sm:w-6 sm:h-6" />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold truncate">Payments</h1>
                            <p className="text-gray-400 text-xs xs:text-sm sm:text-base truncate">Record and track all incoming payments.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={20} />
                        Record Payment
                    </button>
                </header>

                {/* Date Filter */}
                <div className="mb-8 flex gap-4 items-center">
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <Filter size={20} className="text-accent" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1 bg-card border border-border rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate("")}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {selectedDate && (
                        <span className="text-gray-400 text-sm">Showing payments from {new Date(selectedDate).toLocaleDateString()}</span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="premium-card">
                        <div className="flex items-center gap-3 mb-2 text-blue-400">
                            <Banknote size={20} />
                            <span className="text-sm font-bold uppercase">Bank</span>
                        </div>
                        <h3 className="text-2xl font-bold">₹{(selectedDate ? payments.filter(p => p.date === selectedDate && p.mode === 'Bank Transfer') : payments.filter(p => p.mode === 'Bank Transfer')).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString()}</h3>
                    </div>
                    <div className="premium-card">
                        <div className="flex items-center gap-3 mb-2 text-purple-400">
                            <Smartphone size={20} />
                            <span className="text-sm font-bold uppercase">UPI</span>
                        </div>
                        <h3 className="text-2xl font-bold">₹{(selectedDate ? payments.filter(p => p.date === selectedDate && p.mode === 'UPI') : payments.filter(p => p.mode === 'UPI')).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString()}</h3>
                    </div>
                    <div className="premium-card">
                        <div className="flex items-center gap-3 mb-2 text-green-400">
                            <CreditCard size={20} />
                            <span className="text-sm font-bold uppercase">Cash</span>
                        </div>
                        <h3 className="text-2xl font-bold">₹{(selectedDate ? payments.filter(p => p.date === selectedDate && p.mode === 'Cash') : payments.filter(p => p.mode === 'Cash')).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString()}</h3>
                    </div>
                    <div className="premium-card">
                        <div className="flex items-center gap-3 mb-2 text-orange-400">
                            <Clock size={20} />
                            <span className="text-sm font-bold uppercase">Total Payments</span>
                        </div>
                        <h3 className="text-2xl font-bold">{(selectedDate ? payments.filter(p => p.date === selectedDate) : payments).length}</h3>
                    </div>
                </div>

                <div className="premium-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 border-b border-border">
                                <th className="px-6 py-4 font-medium">Payment ID</th>
                                <th className="px-6 py-4 font-medium">Client</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Mode</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading payments...</td>
                                </tr>
                            ) : (selectedDate ? payments.filter(p => p.date === selectedDate) : payments).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">{selectedDate ? "No payments found for this date." : "No payments recorded."}</td>
                                </tr>
                            ) : (
                                (selectedDate ? payments.filter(p => p.date === selectedDate) : payments).map((pay) => (
                                    <tr key={pay.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5 font-mono text-accent">{pay.id.slice(0, 8)}</td>
                                        <td className="px-6 py-5 font-medium">{pay.clientName}</td>
                                        <td className="px-6 py-5 text-gray-400">{pay.date}</td>
                                        <td className="px-6 py-5 font-bold">₹{Number(pay.amount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-sm">{pay.mode}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${pay.status === 'Completed' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-orange-400/10 text-orange-400 border-orange-400/20'}`}>
                                                {pay.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Record Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Record Payment</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    list="client-list"
                                    required
                                    value={newPayment.clientName}
                                    onChange={(e) => setNewPayment({ ...newPayment, clientName: e.target.value })}
                                    className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                    placeholder="Select or type client name"
                                />
                                <datalist id="client-list">
                                    {clients.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newPayment.amount}
                                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                        placeholder="₹"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newPayment.date}
                                        onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Mode</label>
                                <select
                                    value={newPayment.mode}
                                    onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value })}
                                    className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                >
                                    <option>Bank Transfer</option>
                                    <option>UPI</option>
                                    <option>Cash</option>
                                    <option>Cheque</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`w-full py-4 premium-gradient text-black font-bold rounded-xl mt-6 shadow-lg shadow-accent/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? 'Saving...' : 'Save Payment Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
