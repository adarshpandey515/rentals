'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/lib/firebaseService';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    price: '',
    unit: 'piece',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
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
      description: '',
      category: '',
      quantity: '',
      price: '',
      unit: 'piece',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateItem(editingId, formData);
        toast.success('Item updated successfully');
      } else {
        await inventoryService.addItem(formData);
        toast.success('Item added successfully');
      }
      await fetchItems();
      resetForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update item' : 'Failed to add item');
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(id);
        toast.success('Item deleted successfully');
        await fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-foreground min-h-screen bg-background">Loading inventory items...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold"
          >
            <Plus size={20} /> Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Edit Item' : 'Add New Item'}
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
                placeholder="Item Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="text"
                name="category"
                placeholder="Category (e.g., Lighting, Equipment)"
                value={formData.category}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 col-span-2 bg-input text-foreground placeholder-gray-500"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 bg-input text-foreground"
              >
                <option value="piece">Piece</option>
                <option value="meter">Meter</option>
                <option value="kg">KG</option>
                <option value="liter">Liter</option>
              </select>
              <input
                type="number"
                name="price"
                placeholder="Price per Unit"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                className="border border-border rounded-lg p-2 bg-input text-foreground placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-black py-2 rounded-lg hover:bg-accent/80 flex items-center justify-center gap-2 font-semibold"
            >
              <Save size={20} />
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No items in inventory. Click "Add Item" to get started.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-card rounded-lg shadow-md p-4 border border-border hover:border-accent/50 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300"><strong>Quantity:</strong> {item.quantity} {item.unit}</p>
                  <p className="text-sm text-gray-300"><strong>Price per Unit:</strong> ₹{Number(item.price).toFixed(2)}</p>
                  <p className="text-sm text-gray-300"><strong>Total Value:</strong> ₹{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
