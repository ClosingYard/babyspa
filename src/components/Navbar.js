import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null); // Ensure setUser is available here
    };

    return (
        <nav>
            <ul className="left-nav">
                <li><Link to="/">Home</Link></li>
            </ul>
            <ul className="right-nav">
                {user ? (
                    <>
                        {user.role === 'admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
                        {user.role === 'user' && <li><Link to="/user">Dashboard</Link></li>}
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
