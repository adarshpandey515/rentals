"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Calendar,
    User,
    MapPin,
    Trash2,
    ArrowLeft,
    Save,
    Send,
    Download,
    Package
} from "lucide-react";
import Link from "next/link";
import { rentalActions, inventoryActions, clientActions } from "@/lib/db";
import { useRouter } from "next/navigation";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

export default function CreateRentalPage() {
    const router = useRouter();
    const [inventory, setInventory] = useState([]);
    const [formData, setFormData] = useState({
        clientName: "",
        location: "Filmcity",
        incharge: "",
        doh: "",
        dor: "",
        nod: 1,
        transport: 0,
        securityDeposit: 0,
        items: [{ id: "initial-item", name: "", qty: 1, rate: 0, total: 0 }]
    });

    useEffect(() => {
        const fetchInventory = async () => {
            const data = await inventoryActions.getAll();
            setInventory(data);
        };
        fetchInventory();
    }, []);

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveBooking = async () => {
        if (!formData.clientName || formData.items.some(i => !i.name)) {
            toast.error("Please fill in client name and item details.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Save to database
            const rentalDoc = await rentalActions.create({
                ...formData,
                subtotal,
                grandTotal,
                status: "Active",
                due: grandTotal
            });

            // 2. Try to send email
            try {
                const client = await clientActions.getByName(formData.clientName);
                if (client && client.email) {
                    const doc = generateInvoicePDF({
                        ...formData,
                        invoiceNo: `INV-${rentalDoc.id.slice(0, 6).toUpperCase()}`
                    });
                    const pdfBase64 = doc.output('datauristring').split(',')[1];

                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: client.email,
                            subject: `New Rental Booking - LightBill Pro`,
                            text: `Hello ${formData.clientName},\n\nYour rental booking has been confirmed.\n\nTotal Amount: Rs. ${grandTotal}\n\nThank you!`,
                            html: `<p>Hello <b>${formData.clientName}</b>,</p><p>Your rental booking has been confirmed.</p><p><b>Total Amount:</b> Rs. ${grandTotal}</p><p>Thank you for choosing LightBill Pro!</p>`,
                            attachments: [
                                {
                                    filename: `Invoice_${rentalDoc.id.slice(0, 8)}.pdf`,
                                    content: pdfBase64
                                }
                            ]
                        })
                    });
                    toast.success("Booking saved and invoice sent!");
                } else {
                    toast.success("Booking saved!");
                }
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                toast.warning("Booking saved, but failed to send email.");
            }

            router.push("/rentals");
        } catch (error) {
            console.error("Error saving booking:", error);
            toast.error("Failed to save booking.");
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-calculate NOD when dates change
    useEffect(() => {
        if (formData.doh && formData.dor) {
            const start = new Date(formData.doh);
            const end = new Date(formData.dor);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            setFormData(prev => ({ ...prev, nod: diffDays }));
        }
    }, [formData.doh, formData.dor]);

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), name: "", qty: 1, rate: 0, total: 0 }]
        }));
    };

    const removeItem = (id) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const updateItem = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    updatedItem.total = updatedItem.qty * updatedItem.rate * prev.nod;
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const grandTotal = subtotal + Number(formData.transport);

    const handleDownloadPDF = () => {
        const doc = generateInvoicePDF({
            ...formData,
            invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
            subtotal,
            grandTotal
        });
        doc.save(`Invoice_${formData.clientName}.pdf`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold">New Rental Booking</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-gray-400 hover:text-white transition-colors"
                        >
                            <Download size={18} />
                            Preview PDF
                        </button>
                        <button
                            onClick={handleSaveBooking}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                            {isSaving ? 'Saving...' : 'Save Booking'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Client & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="premium-card">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User size={20} className="text-accent" />
                                Client Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Party Name</label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                        placeholder="Production House / Client Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Incharge (Attendant)</label>
                                    <input
                                        type="text"
                                        value={formData.incharge}
                                        onChange={(e) => setFormData({ ...formData, incharge: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                        placeholder="Staff Name"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="premium-card">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-accent" />
                                Rental Period
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">D.O.H (Hire Date)</label>
                                    <input
                                        type="date"
                                        value={formData.doh}
                                        onChange={(e) => setFormData({ ...formData, doh: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">D.O.R (Return Date)</label>
                                    <input
                                        type="date"
                                        value={formData.dor}
                                        onChange={(e) => setFormData({ ...formData, dor: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">N.O.D (Days)</label>
                                    <input
                                        type="number"
                                        readOnly
                                        value={formData.nod}
                                        className="w-full bg-white/5 border border-border rounded-xl p-3 text-accent font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="premium-card">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Package size={20} className="text-accent" />
                                    Equipment List
                                </h3>
                                <button
                                    onClick={addItem}
                                    className="text-accent hover:text-accent/80 text-sm font-bold flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.items.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-xl border border-border/50">
                                        <div className="col-span-5">
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Item Name</label>
                                            <input
                                                type="text"
                                                list="inventory-list"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const selected = inventory.find(i => i.name === e.target.value);
                                                    if (selected) {
                                                        updateItem(item.id, "name", selected.name);
                                                        updateItem(item.id, "rate", selected.rate);
                                                    } else {
                                                        updateItem(item.id, "name", e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-input border border-border rounded-lg p-2 text-sm outline-none"
                                                placeholder="Search gear..."
                                            />
                                            <datalist id="inventory-list">
                                                {inventory.map(i => (
                                                    <option key={i.id} value={i.name} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Qty</label>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 0)}
                                                className="w-full bg-input border border-border rounded-lg p-2 text-sm outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Rate</label>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => updateItem(item.id, "rate", parseInt(e.target.value) || 0)}
                                                className="w-full bg-input border border-border rounded-lg p-2 text-sm outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Total</label>
                                            <div className="p-2 text-sm font-bold text-accent">₹{item.total.toLocaleString()}</div>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="space-y-8">
                        <section className="premium-card sticky top-8">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-400">Transport Charges</label>
                                    <input
                                        type="number"
                                        value={formData.transport}
                                        onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/50"
                                        placeholder="₹"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-400">Security Deposit</label>
                                    <input
                                        type="number"
                                        value={formData.securityDeposit}
                                        onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                                        className="w-full bg-input border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/50"
                                        placeholder="₹"
                                    />
                                </div>
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-lg font-bold">Grand Total</span>
                                    <span className="text-2xl font-bold text-accent">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveBooking}
                                disabled={isSaving}
                                className={`w-full py-4 premium-gradient text-black font-bold rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mb-4 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Send size={18} className={isSaving ? 'animate-pulse' : ''} />
                                {isSaving ? 'Sending...' : 'Confirm & Send Invoice'}
                            </button>
                            <p className="text-xs text-center text-gray-500">
                                This will save the rental and generate an invoice automatically.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
