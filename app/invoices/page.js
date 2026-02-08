'use client';

import { useState, useEffect } from 'react';
import { invoiceService, companyService, rentalService, clientService } from '@/lib/firebaseService';
import { toast } from 'sonner';
import { Plus, FileText, Download, X } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    rentalId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    includeGST: true,
    gstRate: 18,
    notes: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [companiesData, invoicesData, rentalsData, clientsData] = await Promise.all([
        companyService.getAllCompanies(),
        invoiceService.getAllInvoices(),
        rentalService.getAllRentals(),
        clientService.getAllClients(),
      ]);
      setCompanies(companiesData);
      setInvoices(invoicesData);
      setRentals(rentalsData);
      setClients(clientsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      rentalId: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      includeGST: true,
      gstRate: 18,
      notes: '',
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        createdAt: new Date(),
        status: 'Draft',
      };
      await invoiceService.addInvoice(invoiceData);
      toast.success('Invoice created successfully');
      await fetchAllData();
      resetForm();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const downloadPDF = (invoice) => {
    const selectedCompany = companies.find(c => c.id === invoice.companyId);
    const selectedRental = rentals.find(r => r.id === invoice.rentalId);
    const selectedClient = clients.find(c => c.id === selectedRental?.clientId);
    
    // Get logo from settings
    const appSettings = typeof window !== 'undefined' ? localStorage.getItem('appSettings') : null;
    const logoImage = appSettings ? JSON.parse(appSettings).logoImage : null;

    // Build invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: white; color: #333; }
            .container { max-width: 850px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 3px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }
            .header-logo { margin-bottom: 15px; }
            .header-logo img { max-height: 60px; }
            .header h1 { margin: 0 0 5px 0; font-size: 28px; color: #1f2937; }
            .header p { margin: 3px 0; color: #666; font-size: 13px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info > div { flex: 1; }
            .invoice-info h2 { font-size: 16px; margin-bottom: 8px; color: #1f2937; }
            .invoice-info h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; color: #666; font-weight: 600; }
            .invoice-info p { font-size: 13px; margin: 4px 0; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #1f2937; font-weight: 600; font-size: 13px; }
            td { padding: 12px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
            tr:hover { background: #fafafa; }
            .totals { float: right; width: 320px; margin-bottom: 20px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; font-size: 13px; }
            .totals-row.total { font-weight: bold; font-size: 15px; border-top: 2px solid #1f2937; padding-top: 12px; }
            .clear { clear: both; }
            .section { margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
            .section h4 { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #1f2937; }
            .section p { font-size: 12px; margin: 3px 0; color: #555; }
            .signature { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
            .signature-line { width: 200px; }
            .signature-line p:first-child { margin: 40px 0 5px 0; border-top: 1px solid #333; padding-top: 5px; text-align: center; }
            .notes { margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #f59e0b; font-size: 12px; }
            @media print {
              body { padding: 0; }
              .container { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoImage ? `<div class="header-logo"><img src="${logoImage}" alt="Logo" /></div>` : ''}
              <h1>${selectedCompany?.name || 'Company Name'}</h1>
              <p>${selectedCompany?.address || 'Address'}</p>
              <p>${selectedCompany?.city || 'City'}, ${selectedCompany?.state || 'State'} ${selectedCompany?.zipCode || 'ZIP'}</p>
              <p>Phone: ${selectedCompany?.phone || 'N/A'} | Email: ${selectedCompany?.email || 'N/A'}</p>
              ${selectedCompany?.gstNumber ? `<p>GST: ${selectedCompany.gstNumber}</p>` : ''}
            </div>

            <div class="invoice-info">
              <div>
                <h2>INVOICE</h2>
                <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3>Bill To</h3>
                <p><strong>${selectedClient?.name || 'Client Name'}</strong></p>
                <p>${selectedClient?.address || 'Address'}</p>
                <p>${selectedClient?.city || 'City'}, ${selectedClient?.state || 'State'}</p>
                <p>Phone: ${selectedClient?.phone || 'N/A'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center; width: 80px;">Qty</th>
                  <th style="text-align: right; width: 120px;">Unit Price</th>
                  <th style="text-align: right; width: 100px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rental Services</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <strong>Subtotal:</strong>
                <span>0.00</span>
              </div>
              ${invoice.includeGST ? `
                <div class="totals-row">
                  <strong>GST (${invoice.gstRate}%):</strong>
                  <span>0.00</span>
                </div>
              ` : ''}
              <div class="totals-row total">
                <strong>Total Amount Due:</strong>
                <span>0.00</span>
              </div>
            </div>
            <div class="clear"></div>

            ${selectedCompany?.bankName ? `
              <div class="section">
                <h4>Bank Details:</h4>
                <p><strong>Bank Name:</strong> ${selectedCompany.bankName}</p>
                ${selectedCompany?.bankAccountHolder ? `<p><strong>Account Holder:</strong> ${selectedCompany.bankAccountHolder}</p>` : ''}
                ${selectedCompany?.bankAccountNumber ? `<p><strong>Account Number:</strong> ${selectedCompany.bankAccountNumber}</p>` : ''}
                ${selectedCompany?.ifscCode ? `<p><strong>IFSC Code:</strong> ${selectedCompany.ifscCode}</p>` : ''}
                ${selectedCompany?.upiId ? `<p><strong>UPI ID:</strong> ${selectedCompany.upiId}</p>` : ''}
              </div>
            ` : ''}

            <div class="signature">
              <div>
                <h4>Sender Details:</h4>
                ${selectedCompany?.inchargeName ? `<p><strong>Name:</strong> ${selectedCompany.inchargeName}</p>` : ''}
                ${selectedCompany?.inchargePhone ? `<p><strong>Phone:</strong> ${selectedCompany.inchargePhone}</p>` : ''}
              </div>
              <div class="signature-line">
                <p>____________________________</p>
                <p style="text-align: center;"><strong>Authorized Signature</strong></p>
              </div>
            </div>

            ${invoice.notes ? `<div class="notes"><h4>Notes:</h4><p>${invoice.notes}</p></div>` : ''}
          </div>
        </body>
      </html>
    `;

    // Download as HTML file
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  };

  if (loading) {
    return <div className="p-6 text-center text-foreground min-h-screen bg-background">Loading invoices...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-6 pt-4 xs:pt-6 sm:pt-0">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Invoices Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold"
          >
            <Plus size={20} /> Create Invoice
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Create New Invoice</h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Select Company *</label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-border rounded-lg p-2 bg-input text-foreground"
                >
                  <option value="">-- Choose Company --</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Select Rental *</label>
                <select
                  name="rentalId"
                  value={formData.rentalId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-border rounded-lg p-2 bg-input text-foreground"
                >
                  <option value="">-- Choose Rental --</option>
                  {rentals.map((rental) => {
                    const clientName = clients.find(c => c.id === rental.clientId)?.name || 'Unknown';
                    return (
                      <option key={rental.id} value={rental.id}>
                        {clientName} - {rental.rentalDate}
                      </option>
                    );
                  })}
                </select>
              </div>

              <input
                type="text"
                name="invoiceNumber"
                placeholder="Invoice Number (e.g., INV-001)"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />

              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground"
              />

              <input
                type="date"
                name="dueDate"
                placeholder="Due Date"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    name="includeGST"
                    checked={formData.includeGST}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Include GST</span>
                </label>
                {formData.includeGST && (
                  <input
                    type="number"
                    name="gstRate"
                    placeholder="GST %"
                    value={formData.gstRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-20 border border-border rounded-lg p-2 bg-input text-foreground"
                  />
                )}
              </div>

              <textarea
                name="notes"
                placeholder="Invoice Notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 col-span-2 bg-input text-foreground placeholder-gray-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-black py-2 rounded-lg hover:bg-accent/80 flex items-center justify-center gap-2 font-semibold"
            >
              <FileText size={20} />
              Create Invoice
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No invoices created yet. Click "Create Invoice" to get started.
          </div>
        ) : (
          invoices.map((invoice) => {
            const company = companies.find(c => c.id === invoice.companyId);
            const rental = rentals.find(r => r.id === invoice.rentalId);
            const client = clients.find(c => c.id === rental?.clientId);

            return (
              <div key={invoice.id} className="bg-card rounded-lg shadow-md p-4 border border-border hover:border-accent/50 transition-all">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400"><strong>Invoice No:</strong></p>
                    <p className="font-bold text-foreground">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400"><strong>Company:</strong></p>
                    <p className="font-bold text-foreground">{company?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400"><strong>Client:</strong></p>
                    <p className="font-bold text-foreground">{client?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400"><strong>Date:</strong></p>
                    <p className="font-bold text-foreground">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => downloadPDF(invoice)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
