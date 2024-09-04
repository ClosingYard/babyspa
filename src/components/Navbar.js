import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
    console.log('Navbar user:', user); // Log user object to check

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <nav>
            <ul className="left-nav">
                <li><Link to="/">Home</Link></li>
            </ul>
            <ul className="right-nav">
                {user ? (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        {user.role === 'admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
                        <li>Hello, {user.firstName}</li> {/* Display user's first name */}
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
