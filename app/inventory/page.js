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
    <div className="p-2 xs:p-3 sm:p-6 min-h-screen bg-background overflow-x-hidden w-full max-w-screen">
      <div className="flex flex-col xs:gap-3 sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground truncate">Inventory Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent text-black px-3 sm:px-4 py-2 rounded-lg hover:bg-accent/80 font-semibold text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} /> <span>Add Item</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="name"
                placeholder="Item Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <input
                type="text"
                name="category"
                placeholder="Category (e.g., Lighting, Equipment)"
                value={formData.category}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 sm:p-3 col-span-1 sm:col-span-2 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground text-sm sm:text-base"
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
                className="border border-border rounded-lg p-2 sm:p-3 bg-input text-foreground placeholder-gray-500 text-sm sm:text-base"
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
            <div key={item.id} className="bg-card rounded-lg shadow-md p-3 sm:p-4 border border-border hover:border-accent/50 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{item.category}</p>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{item.description}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Qty:</strong> {item.quantity} {item.unit}</p>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Price:</strong> ₹{Number(item.price).toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-300"><strong>Value:</strong> ₹{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
