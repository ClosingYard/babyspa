import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const AdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // Get the current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (user) {
                    // Query to check if user is an admin
                    const { data, error } = await supabase
                        .from('roles')
                        .select('role')
                        .eq('user_id', user.id)
                        .single();

                    if (error) {
                        console.error('Error checking role:', error);
                        setIsAdmin(false);
                    } else {
                        setIsAdmin(data.role === 'admin');
                    }
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Error in checkAdmin:', error);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    if (isAdmin === null) return <div>Loading...</div>; // or a spinner

    return isAdmin ? children : <Navigate to="/dashboard" />;
};

export default AdminRoute;
