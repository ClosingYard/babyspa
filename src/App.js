import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Here you would verify the token and fetch user details from the server
            // For simplicity, we'll assume the token is valid and set a dummy user role
            setUser({ role: 'user' }); // Replace this with actual user role retrieval
        } else {
            setUser(null); // Ensure user is null if no token is present
        }
    }, []);

    const PrivateRoute = ({ element }) => (
        user ? element : <Navigate to="/login" />
    );

    const AdminRoute = ({ element }) => (
        user && user.role === 'admin' ? element : <Navigate to="/dashboard" />
    );

    return (
        <Router>
            <Navbar user={user} setUser={setUser} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
