import React, { useState, useEffect, useCallback } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import supabase from '../supabaseClient';
import './Styling/adminDashboard.css';
import AvailableTimesForm from '../components/AvailableTimesForm';
import AdminBookingsComponent from '../components/AdminBookingsComponent';

// Utility functions
const formatDate = (date) => {
    if (!(date instanceof Date)) throw new Error('Invalid date');
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Utility function to format time only within this component
const formatTime = (time) => {
    console.log("Received time for formatting:", time); // Log the input

    if (typeof time !== 'string') {
        console.error(`Expected a string but received: ${typeof time}`, time);
        throw new Error('Time must be a string');
    }

    // Trim any extra spaces or hidden characters
    time = time.trim();
    
    // Regex to match HH:MM:SS format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

    if (timeRegex.test(time)) {
        const date = new Date(`1970-01-01T${time}Z`);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If not valid time, return an empty string or handle accordingly
    console.warn(`Invalid time format: ${time}`);
    return '';
};

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);

    const fetchAvailableTimes = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('available_times')
                .select('*')
                .eq('date', formatDate(selectedDate));

            if (error) throw error;

            setAvailableTimes(data || []);
        } catch (error) {
            console.error('Error fetching available times:', error);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchAvailableTimes();
    }, [fetchAvailableTimes]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="admin-dashboard">
            <div className="calendar-section">
                <CalendarComponent onDateChange={handleDateChange} />
            </div>
            <div className="available-times-section">
                <AvailableTimesForm
                    onSaveTimes={fetchAvailableTimes}
                    availableTimes={availableTimes}
                    selectedDate={selectedDate}
                />
            </div>
            <div className="bookings-section">
                <AdminBookingsComponent />
            </div>
        </div>
    );
};

export default AdminDashboard;
