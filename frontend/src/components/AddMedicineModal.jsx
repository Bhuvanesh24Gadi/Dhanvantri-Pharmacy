import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api'; // Your secure interceptor!

export default function AddMedicineModal({ isOpen, onClose, onMedicineAdded }) {
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        medicine_name: '',
        batch_no: '',
        dosage: '',
        expiry_date: '',
        unit_cost: '',
        unit_price: '',
        stock_quantity: '',
        category: '',
        manufacturer: ''
    });

    // Fetch the dropdown data from Django when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchDropdownData();
        }
    }, [isOpen]);

    const fetchDropdownData = async () => {
        try {
            const [catRes, mfgRes] = await Promise.all([
                api.get('pharmacy/categories/'),
                api.get('pharmacy/manufacturers/')
            ]);
            setCategories(catRes.data);
            setManufacturers(mfgRes.data);
        } catch (error) {
            console.error("Failed to fetch dropdown data:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send the data to your new Enterprise API
            await api.post('pharmacy/medicines/', formData);
            onMedicineAdded(); // Tell the parent page to refresh the table
            onClose();         // Close the modal
        } catch (error) {
            console.error("Error adding medicine:", error);
            alert("Failed to add medicine. Check console.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100">Add New Medicine</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Medicine Name</label>
                            <input required type="text" name="medicine_name" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Batch Number</label>
                            <input required type="text" name="batch_no" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Dosage (e.g., 500mg)</label>
                            <input required type="text" name="dosage" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date</label>
                            <input required type="date" name="expiry_date" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Unit Cost ($)</label>
                            <input required type="number" step="0.01" name="unit_cost" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Selling Price ($)</label>
                            <input required type="number" step="0.01" name="unit_price" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Initial Stock</label>
                            <input required type="number" name="stock_quantity" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                            <select required name="category" onChange={handleChange} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 outline-none">
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}