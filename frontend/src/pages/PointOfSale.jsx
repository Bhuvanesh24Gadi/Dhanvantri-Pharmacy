import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Receipt, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function PointOfSale() {
    const [medicines, setMedicines] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form inputs
    const [selectedMedId, setSelectedMedId] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Fetch available inventory on load
    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('api/pharmacy/medicines/');
            setMedicines(res.data);
        } catch (error) {
            console.error("Failed to fetch medicines", error);
        }
    };

    // --- Cart Logic ---
    const addToCart = () => {
        if (!selectedMedId || quantity <= 0) return;

        const medicine = medicines.find(m => m.id.toString() === selectedMedId);
        if (!medicine) return;

        // Check if we have enough stock!
        if (quantity > medicine.stock_quantity) {
            alert(`Not enough stock! Only ${medicine.stock_quantity} remaining.`);
            return;
        }

        // Check if already in cart, if so, update quantity
        const existingItem = cart.find(item => item.id === medicine.id);
        if (existingItem) {
            const newQuantity = existingItem.cartQuantity + parseInt(quantity);
            if (newQuantity > medicine.stock_quantity) {
                alert(`Cannot exceed available stock of ${medicine.stock_quantity}`);
                return;
            }
            setCart(cart.map(item => 
                item.id === medicine.id ? { ...item, cartQuantity: newQuantity } : item
            ));
        } else {
            // Add new item to cart
            setCart([...cart, { ...medicine, cartQuantity: parseInt(quantity) }]);
        }

        // Reset form
        setSelectedMedId('');
        setQuantity(1);
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Calculate total on the fly
    const cartTotal = cart.reduce((total, item) => total + (item.unit_price * item.cartQuantity), 0);

    // --- Submit to Django ---
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        setSuccessMsg('');

        // Build the complex Enterprise Payload exactly how Django wants it
        const payload = {
            customer_name: customerName || "Walk-in Customer",
            items: cart.map(item => ({
                medicine: item.id,               // MUST BE 'medicine'
                quantity_sold: item.cartQuantity, // MUST BE 'quantity_sold'
                unit_sale_price: item.unit_price || item.price || 10.00
            }))
        };

        // 🚨 DEBUG TRAP: Print the payload to the console before sending!
        console.log("SENDING THIS PAYLOAD:", JSON.stringify(payload, null, 2));

        try {
            await api.post('api/pharmacy/sales/', payload);
            
            setSuccessMsg('Transaction Successful! Stock deducted.');
            setCart([]);
            setCustomerName('');
            fetchInventory(); 
            
            setTimeout(() => setSuccessMsg(''), 4000); 
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Checkout failed. Check the console and ensure your Django Sales View is configured.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: The Selection Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center text-blue-400 mb-6 pb-4 border-b border-slate-800">
                        <ShoppingCart className="mr-3" size={28} />
                        <h2 className="text-xl font-bold text-slate-100">Point of Sale</h2>
                    </div>

                    {successMsg && (
                        <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-lg flex items-center mb-6">
                            <CheckCircle className="mr-2" size={20} />
                            {successMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Select Medicine</label>
                            <select 
                                value={selectedMedId} 
                                onChange={(e) => setSelectedMedId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
                            >
                                <option value="">-- Choose Item --</option>
                                {medicines.map(med => (
                                    <option key={med.id} value={med.id} disabled={med.stock_quantity === 0}>
                                        {med.medicine_name} ({med.stock_quantity} in stock) - ${med.unit_price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Qty</label>
                            <input 
                                type="number" 
                                min="1" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none" 
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={addToCart}
                                disabled={!selectedMedId}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium p-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                <Plus size={20} className="mr-1" /> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: The Receipt / Cart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col h-full min-h-[500px]">
                <div className="flex items-center text-slate-300 mb-6 pb-4 border-b border-slate-800">
                    <Receipt className="mr-3" size={24} />
                    <h3 className="text-lg font-bold">Current Order</h3>
                </div>

                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Customer Name (Optional)" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none" 
                    />
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                    {cart.length === 0 ? (
                        <p className="text-slate-500 text-center text-sm italic mt-10">Cart is empty</p>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <div>
                                    <p className="text-slate-200 font-medium text-sm">{item.medicine_name}</p>
                                    <p className="text-slate-500 text-xs">{item.cartQuantity} x ${item.unit_price}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-300 font-semibold">${(item.cartQuantity * item.unit_price).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-slate-800 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-400 font-medium">Total Due:</span>
                        <span className="text-3xl font-bold text-emerald-400">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Complete Dispense'}
                    </button>
                </div>
            </div>

        </div>
    );
}