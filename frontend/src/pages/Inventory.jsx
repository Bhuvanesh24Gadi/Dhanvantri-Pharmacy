import { useState, useEffect } from 'react';
import api from '../services/api';
import AddMedicineModal from '../components/AddMedicineModal';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the popup

  // We put this in a separate function so the Modal can trigger it to refresh the table
  const fetchMedicines = () => {
    setLoading(true);
    api.get('api/pharmacy/medicines/')
      .then(response => {
        setMedicines(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to load inventory. Is the Django server running?");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-100">Medicine Inventory</h2>
        
        {/* Opens the Modal when clicked */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition">
          + Add Medicine
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading database...</p>
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium uppercase text-xs tracking-wider">Name</th>
                <th className="p-4 font-medium uppercase text-xs tracking-wider">Category</th>
                <th className="p-4 font-medium uppercase text-xs tracking-wider">Stock</th>
                <th className="p-4 font-medium uppercase text-xs tracking-wider">Price</th>
                <th className="p-4 font-medium uppercase text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">
                    No medicines found in the database.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => (
                  <tr key={med.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                    
                    {/* Using the new Enterprise variables! */}
                    <td className="p-4 font-medium text-slate-200">{med.medicine_name}</td>
                    <td className="p-4 text-slate-400">{med.category_name || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{med.stock_quantity}</td>
                    <td className="p-4 text-slate-400">${med.unit_price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        med.stock_quantity > 10 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-rose-900/30 text-rose-400 border border-rose-800/50'
                      }`}>
                        {med.stock_quantity > 10 ? 'Optimal' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* THE MODAL COMPONENT */}
      <AddMedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onMedicineAdded={() => {
            fetchMedicines(); // Refresh table immediately after saving
        }} 
      />
    </div>
  );
}