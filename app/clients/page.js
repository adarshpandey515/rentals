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
    <div className="p-6 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Clients Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold"
          >
            <Plus size={20} /> Add Client
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Client Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground"
              >
                <option value="">-- Select Company (Optional) --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
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
              <input
                type="text"
                name="contactPerson"
                placeholder="Contact Person Name"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="tel"
                name="contactPersonPhone"
                placeholder="Contact Person Phone"
                value={formData.contactPersonPhone}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
            </div>

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
            <div key={client.id} className="bg-card rounded-lg shadow-md p-4 border border-border hover:border-accent/50 transition-all">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{client.name}</h3>
                  <p className="text-sm text-gray-400">{client.address}</p>
                  <p className="text-sm text-gray-400">
                    {client.city}, {client.state} {client.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300"><strong>GST:</strong> {client.gstNumber}</p>
                  <p className="text-sm text-gray-300"><strong>Phone:</strong> {client.phone}</p>
                  <p className="text-sm text-gray-300"><strong>Email:</strong> {client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300"><strong>Contact Person:</strong> {client.contactPerson}</p>
                  <p className="text-sm text-gray-300"><strong>Contact Phone:</strong> {client.contactPersonPhone}</p>
                </div>
                {company && (
                  <div className="bg-input rounded p-2">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Belongs to</p>
                    <p className="text-sm text-accent font-bold">{company.name}</p>
                    <p className="text-xs text-gray-400">{company.city}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(client)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete
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
