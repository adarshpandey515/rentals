'use client';

import { useState, useEffect } from 'react';
import { clientService, companyService } from '@/lib/firebaseService';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Copy } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    contactPerson: '',
    contactPersonPhone: '',
    companyId: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [clientsData, companiesData] = await Promise.all([
        clientService.getAllClients(),
        companyService.getAllCompanies(),
      ]);
      setClients(clientsData);
      setCompanies(companiesData);
    } catch (error) {
      toast.error('Failed to fetch data');
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

    // Auto-fill from company if company is selected
    if (name === 'companyId' && value) {
      const company = companies.find(c => c.id === value);
      if (company) {
        setFormData((prev) => ({
          ...prev,
          companyId: value,
          address: company.address || prev.address,
          city: company.city || prev.city,
          state: company.state || prev.state,
          zipCode: company.zipCode || prev.zipCode,
          phone: company.phone || prev.phone,
          email: company.email || prev.email,
        }));
        toast.success('Company details auto-filled');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyId: '',
      contactPerson: '',
      contactPersonPhone: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientService.updateClient(editingId, formData);
        toast.success('Client updated successfully');
      } else {
        await clientService.addClient(formData);
        toast.success('Client added successfully');
      }
      await fetchAllData();
      resetForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update client' : 'Failed to add client');
    }
  };

  const handleEdit = (client) => {
    setFormData(client);
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(id);
        toast.success('Client deleted successfully');
        await fetchAllData();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading clients...</div>;
  }

  return (
    <div className="p-2 xs:p-3 sm:p-6 min-h-screen bg-background overflow-x-hidden w-full max-w-screen">
      <div className="flex flex-col xs:gap-3 sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4 xs:pt-6 sm:pt-0">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground truncate">Clients Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} /> <span>Add Client</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {editingId ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-red-400 p-2 sm:p-0"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="name"
                placeholder="Client Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground text-sm sm:text-base border-accent/50"
              >
                <option value="">-- Select Company (Required) --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="contactPerson"
                placeholder="Contact Person Name"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <input
                type="tel"
                name="contactPersonPhone"
                placeholder="Contact Person Phone"
                value={formData.contactPersonPhone}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
            </div>

            {/* Company Details Display */}
            {formData.companyId && (
              <div className="bg-input/50 border border-border rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-accent">Company Details (Auto-filled from selected company)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">GST Number</label>
                    <p className="text-sm text-foreground font-medium">{formData.gstNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Address</label>
                    <p className="text-sm text-foreground font-medium">{formData.address || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">City</label>
                    <p className="text-sm text-foreground font-medium">{formData.city || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">State</label>
                    <p className="text-sm text-foreground font-medium">{formData.state || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Zip Code</label>
                    <p className="text-sm text-foreground font-medium">{formData.zipCode || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Phone</label>
                    <p className="text-sm text-foreground font-medium">{formData.phone || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Email</label>
                    <p className="text-sm text-foreground font-medium">{formData.email || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-accent text-black py-2 rounded-lg hover:bg-accent/80 flex items-center justify-center gap-2 font-semibold"
            >
              <Save size={20} />
              {editingId ? 'Update Client' : 'Add Client'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {clients.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No clients added yet. Click "Add Client" to get started.
          </div>
        ) : (
          clients.map((client) => {
            const company = client.companyId ? companies.find(c => c.id === client.companyId) : null;
            return (
            <div key={client.id} className="bg-card rounded-lg shadow-md p-3 sm:p-4 border border-border hover:border-accent/50 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{client.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{client.address}</p>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">
                    {client.city}, {client.state} {client.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>GST:</strong> {client.gstNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Ph:</strong> {client.phone}</p>
                  <p className="text-xs sm:text-sm text-gray-300 truncate"><strong>Email:</strong> {client.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Contact:</strong> {client.contactPerson}</p>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Ph:</strong> {client.contactPersonPhone}</p>
                  {company && (
                    <p className="text-xs sm:text-sm text-accent font-bold truncate">{company.name}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEdit(client)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                >
                  <Trash2 size={14} /> Delete
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
