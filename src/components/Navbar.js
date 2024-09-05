import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
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
                <div className='profile-link'>                {user && <span className="hello-text">Hello, {user.firstName}</span>}</div>
                <button className="mobile-menu-button" onClick={toggleMobileMenu}>
                    ☰
                </button>
                <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    {user ? (
                        <>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            {user.role === 'admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
                            <li className='invisible-for-mobile'>Hello, {user.firstName}</li> {/* Display user's first name */}
                            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                        </>
                    ) : (
                        <li><Link to="/login">Login</Link></li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
