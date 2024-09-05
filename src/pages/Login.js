import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';


function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const response = await axios.post(`${config.baseURL}/login`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            console.log('Logged in user:', user); // Log user object
            setUser(user); // Ensure user object includes firstName
        } catch (err) {
            console.log('Failed to login:', err.message);
            setError('Invalid email or password');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default Login;