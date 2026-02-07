'use client';

import { useState, useEffect } from 'react';
import { companyService } from '@/lib/firebaseService';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    gstNumber: '',
    phone: '',
    email: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    upiId: '',
    inchargeName: '',
    inchargePhone: '',
    inchargeEmail: '',
    signatureUrl: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      gstNumber: '',
      phone: '',
      email: '',
      bankAccountHolder: '',
      bankAccountNumber: '',
      bankName: '',
      ifscCode: '',
      upiId: '',
      inchargeName: '',
      inchargePhone: '',
      inchargeEmail: '',
      signatureUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await companyService.updateCompany(editingId, formData);
        toast.success('Company updated successfully');
      } else {
        await companyService.addCompany(formData);
        toast.success('Company added successfully');
      }
      await fetchCompanies();
      resetForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update company' : 'Failed to add company');
    }
  };

  const handleEdit = (company) => {
    setFormData(company);
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companyService.deleteCompany(id);
        toast.success('Company deleted successfully');
        await fetchCompanies();
      } catch (error) {
        toast.error('Failed to delete company');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-foreground min-h-screen bg-background">Loading companies...</div>;
  }

  return (
    <div className="p-3 sm:p-6 min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Companies Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} /> <span>Add Company</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {editingId ? 'Edit Company' : 'Add New Company'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-red-400 p-2 sm:p-0"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Company Basic Info */}
              <input
                type="text"
                name="name"
                placeholder="Company Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="gstNumber"
                placeholder="GST Number"
                value={formData.gstNumber}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />

              {/* Bank Details */}
              <input
                type="text"
                name="bankAccountHolder"
                placeholder="Bank Account Holder Name"
                value={formData.bankAccountHolder}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="bankAccountNumber"
                placeholder="Bank Account Number"
                value={formData.bankAccountNumber}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="ifscCode"
                placeholder="IFSC Code"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="upiId"
                placeholder="UPI ID"
                value={formData.upiId}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />

              {/* Incharge Details */}
              <input
                type="text"
                name="inchargeName"
                placeholder="Incharge Name"
                value={formData.inchargeName}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="tel"
                name="inchargePhone"
                placeholder="Incharge Phone"
                value={formData.inchargePhone}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="email"
                name="inchargeEmail"
                placeholder="Incharge Email"
                value={formData.inchargeEmail}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="signatureUrl"
                placeholder="Signature Image URL"
                value={formData.signatureUrl}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-black py-2 rounded-lg hover:bg-accent/80 flex items-center justify-center gap-2 font-semibold"
            >
              <Save size={20} />
              {editingId ? 'Update Company' : 'Add Company'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {companies.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No companies added yet. Click "Add Company" to get started.
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="bg-card rounded-lg shadow-md p-4 border border-border hover:border-accent/50 transition-all">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{company.name}</h3>
                  <p className="text-sm text-gray-400">{company.address}</p>
                  <p className="text-sm text-gray-400">
                    {company.city}, {company.state} {company.zipCode}
                  </p>
                  <p className="text-sm text-gray-400">GST: {company.gstNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300"><strong>Phone:</strong> {company.phone}</p>
                  <p className="text-sm text-gray-300"><strong>Email:</strong> {company.email}</p>
                  <p className="text-sm mt-2 text-gray-300"><strong>Incharge:</strong> {company.inchargeName}</p>
                  <p className="text-sm text-gray-300"><strong>Incharge Phone:</strong> {company.inchargePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300"><strong>Bank:</strong> {company.bankName}</p>
                  <p className="text-sm text-gray-300"><strong>Account:</strong> {company.bankAccountNumber}</p>
                  <p className="text-sm text-gray-300"><strong>IFSC:</strong> {company.ifscCode}</p>
                  <p className="text-sm text-gray-300"><strong>UPI:</strong> {company.upiId}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(company)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
