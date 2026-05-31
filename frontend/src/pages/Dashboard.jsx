import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_medicines: 0,
        low_stock_count: 0,
        inventory_value: 0,
        low_stock_items: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('pharmacy/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="text-blue-400 flex justify-center mt-20 animate-pulse text-xl">Loading System Data...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            
            <div className="flex items-center text-slate-100 mb-8 pb-4 border-b border-slate-800">
                <LayoutDashboard className="mr-3 text-blue-500" size={32} />
                <h2 className="text-3xl font-bold">Command Center</h2>
            </div>

            {/* --- TOP METRICS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Medicines */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center">
                    <div className="p-4 bg-blue-900/30 rounded-lg text-blue-400 mr-4">
                        <Package size={28} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Medicine Lines</p>
                        <h3 className="text-3xl font-bold text-slate-100">{stats.total_medicines}</h3>
                    </div>
                </div>

                {/* Inventory Value */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center">
                    <div className="p-4 bg-emerald-900/30 rounded-lg text-emerald-400 mr-4">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Capital Value</p>
                        <h3 className="text-3xl font-bold text-slate-100">${stats.inventory_value.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center">
                    <div className="p-4 bg-rose-900/30 rounded-lg text-rose-400 mr-4">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Low Stock Alerts</p>
                        <h3 className="text-3xl font-bold text-rose-400">{stats.low_stock_count}</h3>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                
                {/* Critical Alerts Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center border-b border-slate-800 pb-4">
                        <AlertCircle className="mr-2 text-rose-500" size={20} /> 
                        Critical Stock Status
                    </h3>
                    
                    {stats.low_stock_items.length === 0 ? (
                        <div className="text-emerald-400 bg-emerald-900/20 p-4 rounded-lg text-center border border-emerald-900/50">
                            All inventory levels are healthy.
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {stats.low_stock_items.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-rose-900/30">
                                    <span className="text-slate-300 font-medium">{item.medicine_name}</span>
                                    <span className="bg-rose-950 text-rose-400 px-3 py-1 rounded-full text-sm font-bold border border-rose-900">
                                        Only {item.stock_quantity} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* System Status Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center border-b border-slate-800 pb-4">
                        <TrendingUp className="mr-2 text-blue-500" size={20} /> 
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between">
                            <span className="text-slate-400">Database Connection</span>
                            <span className="text-emerald-400 font-semibold flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Online</span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between">
                            <span className="text-slate-400">AI Vision Processing</span>
                            <span className="text-emerald-400 font-semibold flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}