'use client';

import { useState, useEffect } from 'react';
import { rentalService, invoiceService, clientService, companyService } from '@/lib/firebaseService';
import { toast } from 'sonner';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Package,
  Clock,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    activeRentals: 0,
    totalClients: 0,
    monthlyRevenue: [],
    rentalsByStatus: {},
    topClients: [],
    completedRentals: 0,
    pendingRentals: 0,
    averageRentalValue: 0,
    totalCompanies: 0,
    paymentStatus: {},
    clientRevenue: [],
    rentalDuration: { average: 0, longest: 0, shortest: 0 },
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [rentals, invoices, clients, companies] = await Promise.all([
        rentalService.getAllRentals(),
        invoiceService.getAllInvoices(),
        clientService.getAllClients(),
        companyService.getAllCompanies(),
      ]);

      // Filter by date range
      const startTime = new Date(dateRange.startDate).getTime();
      const endTime = new Date(dateRange.endDate).getTime() + 86400000;

      const filteredInvoices = invoices.filter((inv) => {
        const invTime = new Date(inv.invoiceDate).getTime();
        return invTime >= startTime && invTime <= endTime;
      });

      const filteredRentals = rentals.filter((r) => {
        const rentalTime = new Date(r.createdAt || r.startDate).getTime();
        return rentalTime >= startTime && rentalTime <= endTime;
      });

      // Core metrics
      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const activeRentals = rentals.filter((r) => r.status === 'Active').length;
      const completedRentals = filteredRentals.filter((r) => r.status === 'Completed').length;
      const pendingRentals = rentals.filter((r) => r.status === 'Pending').length;
      const averageRentalValue = filteredRentals.length > 0 ? totalRevenue / filteredRentals.length : 0;

      // Monthly revenue
      const monthlyRevenueMap = {};
      invoices.forEach((inv) => {
        const date = new Date(inv.invoiceDate);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (Number(inv.amount) || 0);
      });
      const monthlyRevenue = Object.entries(monthlyRevenueMap)
        .sort()
        .slice(-6)
        .map(([month, revenue]) => ({
          month: new Date(month + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          revenue: parseFloat(revenue.toFixed(2)),
        }));

      // Rental status distribution
      const rentalsByStatus = rentals.reduce((acc, rental) => {
        acc[rental.status] = (acc[rental.status] || 0) + 1;
        return acc;
      }, {});

      // Payment status
      const paymentStatus = invoices.reduce((acc, inv) => {
        const status = inv.paymentStatus || 'Unpaid';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Client revenue analysis
      const clientRevenueMap = {};
      invoices.forEach((inv) => {
        clientRevenueMap[inv.clientId] = (clientRevenueMap[inv.clientId] || 0) + (Number(inv.amount) || 0);
      });
      const clientRevenue = Object.entries(clientRevenueMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([clientId, revenue]) => {
          const client = clients.find((c) => c.id === clientId);
          return {
            name: client?.name || 'Unknown',
            revenue: parseFloat(revenue.toFixed(2)),
          };
        });

      // Top clients by rental count
      const clientRentalCount = {};
      rentals.forEach((rental) => {
        clientRentalCount[rental.clientId] = (clientRentalCount[rental.clientId] || 0) + 1;
      });
      const topClients = Object.entries(clientRentalCount)
        .map(([clientId, count]) => ({
          clientId,
          clientName: clients.find((c) => c.id === clientId)?.name || 'Unknown',
          rentalCount: count,
        }))
        .sort((a, b) => b.rentalCount - a.rentalCount)
        .slice(0, 5);

      // Rental duration analysis
      const durations = rentals
        .map((r) => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);
          return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        })
        .filter((d) => d > 0);
      const rentalDuration = {
        average: durations.length > 0 ? parseFloat((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)) : 0,
        longest: durations.length > 0 ? Math.max(...durations) : 0,
        shortest: durations.length > 0 ? Math.min(...durations) : 0,
      };

      setReportData({
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalRentals: filteredRentals.length,
        activeRentals,
        totalClients: clients.length,
        completedRentals,
        pendingRentals,
        averageRentalValue: parseFloat(averageRentalValue.toFixed(2)),
        totalCompanies: companies.length,
        monthlyRevenue,
        rentalsByStatus,
        topClients,
        paymentStatus,
        clientRevenue,
        rentalDuration,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadReportPDF = () => {
    try {
      const reportHTML = generateReportHTML();
      const printWindow = window.open('', '', 'height=800,width=1000');
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
      toast.success('Report exported to PDF');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const generateReportHTML = () => {
    const date = new Date().toLocaleDateString();
    return `<!DOCTYPE html>
      <html>
      <head>
        <title>Rental Management Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; }
          .header h1 { color: #1f2937; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #6b7280; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1f2937; font-size: 18px; margin-bottom: 15px; border-left: 4px solid #f59e0b; padding-left: 10px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .metric-card { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
          .metric-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .metric-value { color: #1f2937; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f3f4f6; color: #374151; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rental Management Report</h1>
          <p>Generated on ${date}</p>
          <p>Report Period: ${dateRange.startDate} to ${dateRange.endDate}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Revenue</div>
              <div class="metric-value">$${reportData.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Rentals</div>
              <div class="metric-value">${reportData.totalRentals}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Active Rentals</div>
              <div class="metric-value">${reportData.activeRentals}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Clients</div>
              <div class="metric-value">${reportData.totalClients}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Rental Status Distribution</h2>
          <table>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
            ${Object.entries(reportData.rentalsByStatus)
              .map(
                ([status, count]) =>
                  `<tr>
              <td>${status}</td>
              <td>${count}</td>
              <td>${((count / reportData.totalRentals) * 100).toFixed(1)}%</td>
            </tr>`
              )
              .join('')}
          </table>
        </div>

        <div class="section">
          <h2>Top 10 Clients by Revenue</h2>
          <table>
            <tr>
              <th>Client Name</th>
              <th>Revenue</th>
            </tr>
            ${reportData.clientRevenue
              .map(
                (client) =>
                  `<tr>
              <td>${client.name}</td>
              <td>$${client.revenue.toLocaleString()}</td>
            </tr>`
              )
              .join('')}
          </table>
        </div>

        <div class="section">
          <h2>Payment Status</h2>
          <table>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
            ${Object.entries(reportData.paymentStatus)
              .map(
                ([status, count]) =>
                  `<tr>
              <td>${status || 'Unpaid'}</td>
              <td>${count}</td>
            </tr>`
              )
              .join('')}
          </table>
        </div>
      </body>
      </html>`;
  };

  if (loading) {
    return (
      <div className="bg-background text-foreground p-6 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-accent animate-pulse" />
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="w-8 h-8 text-accent" />
          Reports & Analytics
        </h1>
        <p className="text-gray-400">Comprehensive business intelligence and insights</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="bg-input border border-border rounded px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="bg-input border border-border rounded px-3 py-2 text-foreground"
            />
          </div>
          <button
            onClick={downloadReportPDF}
            className="bg-accent hover:bg-amber-600 text-white px-4 py-2 rounded flex items-center gap-2 font-medium transition"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        <button
          onClick={() => setReportType('overview')}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            reportType === 'overview'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setReportType('revenue')}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            reportType === 'revenue'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-foreground'
          }`}
        >
          Revenue Analysis
        </button>
        <button
          onClick={() => setReportType('clients')}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            reportType === 'clients'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-foreground'
          }`}
        >
          Client Analysis
        </button>
        <button
          onClick={() => setReportType('rentals')}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            reportType === 'rentals'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-foreground'
          }`}
        >
          Rental Analytics
        </button>
        <button
          onClick={() => setReportType('payments')}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            reportType === 'payments'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-foreground'
          }`}
        >
          Payment Status
        </button>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">${reportData.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-10 h-10 text-accent opacity-20" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Rentals</p>
                  <p className="text-3xl font-bold mt-2">{reportData.totalRentals}</p>
                </div>
                <Package className="w-10 h-10 text-accent opacity-20" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Rentals</p>
                  <p className="text-3xl font-bold mt-2">{reportData.activeRentals}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-accent opacity-20" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Clients</p>
                  <p className="text-3xl font-bold mt-2">{reportData.totalClients}</p>
                </div>
                <Users className="w-10 h-10 text-accent opacity-20" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Monthly Revenue (Last 6 Months)
            </h2>
            <div className="space-y-3">
              {reportData.monthlyRevenue.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="w-24">{item.month}</span>
                  <div className="flex-1 bg-input rounded h-8 mx-4 relative overflow-hidden">
                    <div
                      className="bg-accent h-full"
                      style={{
                        width: `${Math.max(
                          10,
                          (item.revenue / Math.max(...reportData.monthlyRevenue.map((m) => m.revenue || 0), 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-accent w-24 text-right">${item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Rental Status Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(reportData.rentalsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-accent"></span>
                      <span>{status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{count}</span>
                      <span className="text-gray-400 text-sm ml-2">({((count / reportData.totalRentals) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Payment Status Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(reportData.paymentStatus).map(([status, count]) => {
                  const total = Object.values(reportData.paymentStatus).reduce((a, b) => a + b, 0);
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-accent"></span>
                        <span>{status || 'Unpaid'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-gray-400 text-sm ml-2">({((count / total) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Analysis */}
      {reportType === 'revenue' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 text-accent">${reportData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Average Rental Value</p>
              <p className="text-3xl font-bold mt-2 text-accent">${reportData.averageRentalValue.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Completed Rentals</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.completedRentals}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top 10 Clients by Revenue</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">Client Name</th>
                    <th className="text-right py-2 px-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.clientRevenue.map((client, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-input transition">
                      <td className="py-2 px-2">{client.name}</td>
                      <td className="text-right py-2 px-2 font-bold text-accent">${client.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Client Analysis */}
      {reportType === 'clients' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.totalClients}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Avg Revenue per Client</p>
              <p className="text-3xl font-bold mt-2 text-accent">
                ${(reportData.totalRevenue / (reportData.totalClients || 1)).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top Clients by Rental Activity</h2>
            <div className="space-y-4">
              {reportData.topClients.map((client, idx) => (
                <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg">{client.clientName}</p>
                      <p className="text-gray-400 text-sm">{client.rentalCount} rentals</p>
                    </div>
                  </div>
                  <div className="w-full bg-input rounded h-2">
                    <div
                      className="bg-accent h-full rounded"
                      style={{
                        width: `${(client.rentalCount / Math.max(...reportData.topClients.map((c) => c.rentalCount || 0), 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rental Analytics */}
      {reportType === 'rentals' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Active Rentals</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.activeRentals}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.completedRentals}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.pendingRentals}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold mt-2 text-accent">{reportData.totalRentals}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Rental Duration Analysis
              </h2>
              <div className="space-y-4">
                <div className="bg-input p-4 rounded">
                  <p className="text-gray-400 text-sm">Average Duration</p>
                  <p className="text-2xl font-bold text-accent">{reportData.rentalDuration.average} days</p>
                </div>
                <div className="bg-input p-4 rounded">
                  <p className="text-gray-400 text-sm">Longest Rental</p>
                  <p className="text-2xl font-bold text-accent">{reportData.rentalDuration.longest} days</p>
                </div>
                <div className="bg-input p-4 rounded">
                  <p className="text-gray-400 text-sm">Shortest Rental</p>
                  <p className="text-2xl font-bold text-accent">{reportData.rentalDuration.shortest} days</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Rental Status Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(reportData.rentalsByStatus).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{status}</span>
                      <span className="text-accent">{count}</span>
                    </div>
                    <div className="w-full bg-input rounded-full h-2">
                      <div
                        className="bg-accent h-full rounded-full"
                        style={{
                          width: `${(count / reportData.totalRentals) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status */}
      {reportType === 'payments' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Total Invoices</p>
              <p className="text-3xl font-bold mt-2 text-accent">
                {Object.values(reportData.paymentStatus).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-gray-400 text-sm font-medium">Collection Rate</p>
              <p className="text-3xl font-bold mt-2 text-accent">
                {reportData.paymentStatus.Paid
                  ? (
                      ((reportData.paymentStatus.Paid || 0) /
                        Object.values(reportData.paymentStatus).reduce((a, b) => a + b, 0)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Payment Status Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(reportData.paymentStatus).map(([status, count]) => {
                const total = Object.values(reportData.paymentStatus).reduce((a, b) => a + b, 0);
                const percentage = (count / total) * 100;
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{status || 'Unpaid'}</span>
                      <span className="text-accent font-bold">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-input rounded-full h-3">
                      <div
                        className="bg-accent h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
