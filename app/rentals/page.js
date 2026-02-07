"use client";

import React, { useState, useEffect } from "react";
import {
    History,
    ArrowLeft,
    Search,
    Calendar,
    Filter,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Trash2
} from "lucide-react";
import Link from "next/link";

import { rentalActions } from "@/lib/db";
import { toast } from "sonner";

export default function RentalsListPage() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        const fetchRentals = async () => {
            setLoading(true);
            try {
                const data = await rentalActions.getAll();
                setRentals(data);
            } catch (error) {
                console.error("Error fetching rentals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRentals();
    }, []);

    const handleDeleteRental = async (id) => {
        try {
            await rentalActions.delete(id);
            setRentals(rentals.filter(r => r.id !== id));
            setDeleteConfirm(null);
            setOpenMenu(null);
            toast.success("Rental deleted successfully!");
        } catch (error) {
            console.error("Error deleting rental:", error);
            toast.error("Failed to delete rental: " + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-blue-400/10 text-blue-400 border-blue-400/20";
            case "Returned": return "bg-green-400/10 text-green-400 border-green-400/20";
            case "Booked": return "bg-purple-400/10 text-purple-400 border-purple-400/20";
            case "Overdue": return "bg-red-400/10 text-red-400 border-red-400/20";
            default: return "bg-gray-400/10 text-gray-400 border-gray-400/20";
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Rentals</h1>
                            <p className="text-gray-400">Operational layer: Track gear movement and bookings.</p>
                        </div>
                    </div>
                    <Link
                        href="/rentals/create"
                        className="flex items-center justify-center gap-2 px-6 py-3 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                    >
                        + Create New Rental
                    </Link>
                </header>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by client or rental ID..."
                            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-gray-400 hover:text-white transition-colors">
                            <Filter size={20} />
                            Status
                        </button>
                    </div>
                </div>

                {/* Rentals Table */}
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 border-b border-border">
                                    <th className="px-6 py-4 font-medium">Rental ID</th>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Period</th>
                                    <th className="px-6 py-4 font-medium">Items Summary</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading rentals...</td>
                                    </tr>
                                ) : rentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No rentals found.</td>
                                    </tr>
                                ) : (
                                    rentals.map((rental) => (
                                        <tr key={rental.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5 font-mono text-accent">{rental.id.slice(0, 8)}</td>
                                            <td className="px-6 py-5 font-medium">{rental.clientName}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1 text-gray-300">
                                                        <Calendar size={12} /> {rental.doh}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <History size={12} /> {rental.dor}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-400 max-w-xs truncate">
                                                {rental.items?.length} items • {rental.nod} days
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rental.status)}`}>
                                                    {rental.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right relative">
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setOpenMenu(openMenu === rental.id ? null : rental.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {openMenu === rental.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                                                            <button
                                                                onClick={() => setDeleteConfirm(rental.id)}
                                                                className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 border-t border-border first:border-t-0"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete Rental
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Delete Rental</h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this rental? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteRental(deleteConfirm)}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
