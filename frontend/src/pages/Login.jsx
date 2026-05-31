import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Lock } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 absolute inset-0 z-50">
            <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-900/30 p-3 rounded-full text-blue-400 border border-blue-800/50">
                        <Lock size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-100 mb-8">Dhanvantri Portal</h2>
                
                {error && <div className="bg-rose-900/30 text-rose-400 border border-rose-800/50 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}