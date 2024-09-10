import React, { useState } from 'react';
import supabase from '../supabaseClient';

function SignUp({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            // Sign up the user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) {
                throw error;
            }

            const { user } = data;

            // If the user is created successfully, insert profile data into the profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id, // Set user ID as the primary key
                        first_name: firstName,
                        last_name: lastName,
                        email: user.email,
                        phone_number: phoneNumber
                    }
                ]);

            if (profileError) {
                throw profileError;
            }

            // Optionally set user information in state or local storage
            setUser(user);

            // Redirect or show a success message
            console.log('Sign up successful and profile created.');

        } catch (err) {
            console.log('Failed to sign up:', err.message);
            setError('Sign up failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
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
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default SignUp;
