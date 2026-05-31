import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-8 text-center text-slate-500">Checking credentials...</div>;
    
    // Kick them back to login if they aren't authenticated
    if (!user) return <Navigate to="/login" />;
    
    return children;
}