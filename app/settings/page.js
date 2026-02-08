"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Save,
    X,
    Zap,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        appName: 'RentPro',
        companyEmail: '',
        companyPhone: '',
        currency: 'INR',
        invoicePrefix: 'INV',
        taxRate: 18,
        defaultPaymentTerms: 30,
        theme: 'dark',
        logoImage: null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Set client flag and current date only on client side
        setIsClient(true);
        setCurrentDate(new Date().toLocaleDateString());

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setSettings(prev => ({
                    ...prev,
                    logoImage: event.target?.result,
                }));
                toast.success('Logo image added');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSettings(prev => ({
            ...prev,
            logoImage: null,
        }));
        toast.success('Logo image removed');
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            // Save to localStorage
            localStorage.setItem('appSettings', JSON.stringify(settings));
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
                toast.success('Settings reset to last saved state');
            } catch (error) {
                toast.error('Failed to reset settings');
            }
        }
    };

    return (
        <div className="p-6 min-h-screen bg-background">
            <div className="flex items-center gap-3 mb-6">
                <Settings size={32} className="text-accent" />
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                        <h2 className="text-xl font-bold text-foreground mb-6">Application Settings</h2>

                        <div className="space-y-6">
                            {/* General Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">General</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Application Name
                                        </label>
                                        <input
                                            type="text"
                                            name="appName"
                                            value={settings.appName}
                                            onChange={handleInputChange}
                                            className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                        />
                                    </div>
                                    
                                    {/* Logo Image Upload */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                                            <ImageIcon size={16} />
                                            Company Logo (for PDF embedding)
                                        </label>
                                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent transition">
                                            {settings.logoImage ? (
                                                <div className="space-y-2">
                                                    <img 
                                                        src={settings.logoImage} 
                                                        alt="Logo preview" 
                                                        className="h-24 mx-auto rounded"
                                                    />
                                                    <div className="flex gap-2 justify-center">
                                                        <label className="cursor-pointer">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="hidden"
                                                            />
                                                            <span className="inline-block bg-accent hover:bg-amber-600 text-white px-3 py-1 rounded text-sm">
                                                                Change
                                                            </span>
                                                        </label>
                                                        <button
                                                            onClick={removeImage}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer block">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Upload size={24} className="text-gray-400" />
                                                        <span className="text-sm text-gray-400">
                                                            Click to upload or drag and drop
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            PNG, JPG up to 2MB
                                                        </span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Company Email
                                        </label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={settings.companyEmail}
                                            onChange={handleInputChange}
                                            className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Company Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="companyPhone"
                                            value={settings.companyPhone}
                                            onChange={handleInputChange}
                                            className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Invoice Settings</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Invoice Prefix
                                            </label>
                                            <input
                                                type="text"
                                                name="invoicePrefix"
                                                value={settings.invoicePrefix}
                                                onChange={handleInputChange}
                                                placeholder="e.g., INV"
                                                className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Currency
                                            </label>
                                            <select
                                                name="currency"
                                                value={settings.currency}
                                                onChange={handleInputChange}
                                                className="w-full border border-border rounded-lg p-3 bg-input text-foreground"
                                            >
                                                <option value="INR">Indian Rupee (₹)</option>
                                                <option value="USD">US Dollar ($)</option>
                                                <option value="EUR">Euro (€)</option>
                                                <option value="GBP">British Pound (£)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Tax Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="taxRate"
                                                value={settings.taxRate}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Payment Terms (Days)
                                            </label>
                                            <input
                                                type="number"
                                                name="defaultPaymentTerms"
                                                value={settings.defaultPaymentTerms}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="1"
                                                className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-lg hover:bg-accent/80 font-semibold disabled:opacity-50"
                            >
                                <Save size={20} />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
                            >
                                <X size={20} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-accent" />
                            Information
                        </h3>
                        <div className="space-y-4 text-sm text-gray-400">
                            <div>
                                <p className="font-semibold text-foreground mb-1">App Version</p>
                                <p>1.0.0</p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground mb-1">Last Updated</p>
                                <p>{isClient ? currentDate : 'Loading...'}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground mb-1">Framework</p>
                                <p>Next.js 16</p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground mb-1">Database</p>
                                <p>Firebase Firestore</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-gray-500">
                                This is a professional rental management system designed for shooting lights rental businesses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
