import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import supabase from '../supabaseClient';

function Navbar({ user, setUser }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                // Fetch the user's role from the 'roles' table
                const { data, error } = await supabase
                    .from('roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user role:', error);
                } else {
                    setUserRole(data.role);
                }
            }
        };

        fetchUserRole();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut(); // Logout using Supabase
        setUser(null);
        setUserRole(null); // Clear user role on logout
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav>
            <div className="nav-container">
                <div className="logo">
                    <Link to="/">Home</Link>
                </div>
                <div className='profile-link'>
                    {user && <span className="hello-text">Hello, {user.email}</span>}
                </div>
                <button className="mobile-menu-button" onClick={toggleMobileMenu}>
                    ☰
                </button>
                <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    {user ? (
                        <>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            {userRole === 'admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
                            <li className='invisible-for-mobile'>Hello, {user.email}</li>
                            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/signup">Sign Up</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
