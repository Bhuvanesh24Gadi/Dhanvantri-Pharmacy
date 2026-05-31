import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import PrescriptionDigitizer from './pages/PrescriptionDigitizer';
import Login from './pages/Login';
import AIScanner from './pages/AIScanner';
import PointOfSale from './pages/PointOfSale';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'ml-64 p-8' : ''}`}>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />
          
          {/* PROTECTED ROUTES */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute><Inventory /></ProtectedRoute>
          } />
          <Route path="/scanner" element={<ProtectedRoute><AIScanner /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><PointOfSale /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;