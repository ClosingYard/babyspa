import React, { useState } from 'react';
import supabase from '../supabaseClient'; // Import your Supabase client

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
    
        try {
            // Sign in the user with Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
    
            if (error) {
                throw error;
            }
    
            const user = data.user;
            const session = data.session;
    
            if (stayLoggedIn) {
                // Store token in localStorage for "Stay Logged In"
                localStorage.setItem('token', session.access_token);
            } else {
                // Store token in sessionStorage for temporary session
                sessionStorage.setItem('token', session.access_token);
            }
    
            // Set user in the state
            setUser(user);
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
                <div>
    <input
        type="checkbox"
        id="stayLoggedIn"
        checked={stayLoggedIn}
        onChange={(e) => setStayLoggedIn(e.target.checked)}
    />
    <label htmlFor="stayLoggedIn">Stay Logged In</label>
</div>

                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default Login;
