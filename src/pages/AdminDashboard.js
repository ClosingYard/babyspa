import React, { useState, useEffect, useCallback } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import supabase from '../supabaseClient'; // Import Supabase client
import './Styling/adminDashboard.css';
import AvailableTimesForm from '../components/AvailableTimesForm';
import BookingsComponent from '../components/BookingsComponent';

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
    
    // Regex to match HH:MM:SS or HH:MM format
    const match = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.exec(time);

    if (!match) {
        console.error(`Invalid time format encountered: ${time}`);
        throw new Error(`Invalid time format: ${time}`);
    }

    // Returning HH:MM format only (ignoring seconds if present)
    return `${match[1]}:${match[2]}`;
};

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);

    
    const [showTimesForm, setShowTimesForm] = useState(false);

    const fetchTimes = useCallback(async () => {
        if (selectedDate) {
            try {
                const formattedDate = formatDate(selectedDate);
                console.log('Fetching times for date:', formattedDate);
                
                // Fetch both id and time
                const { data, error } = await supabase
                    .from('available_times')
                    .select('id, time') // Include id in the selection
                    .eq('date', formattedDate);
    
                if (error) throw error;
    
                console.log('Raw times data:', data); // Log raw data
    
                // Process the fetched times and format them
                const formattedTimes = data.map(entry => {
                    try {
                        console.log('Formatting time for entry:', entry); // Log entry before formatting
                        const formattedTime = formatTime(entry.time); // Format time
                        return {
                            ...entry,
                            time: formattedTime, // Apply the formatted time
                        };
                    } catch (e) {
                        console.error('Error formatting time:', e, entry.time);
                        return null; // Return null if there's an error
                    }
                }).filter(entry => entry !== null); // Remove entries with errors
    
                setAvailableTimes(formattedTimes || []);
            } catch (error) {
                console.error('Failed to fetch times:', error);
            }
        }
    }, [selectedDate]);
    
    
    
    
    
    
    

    useEffect(() => {
        fetchTimes();
    }, [fetchTimes]);

    // Fetch bookings from the database


    // Fetch bookings from the database
  
    const handleSaveTimes = async (times) => {
        if (selectedDate) {
            try {
                const formattedDate = formatDate(selectedDate);

                const validTimes = times.filter(time => {
                    try {
                        const formattedTime = formatTime(time.time);
                        return time.date === formattedDate && formattedTime;
                    } catch {
                        return false;
                    }
                });

                if (validTimes.length !== times.length) {
                    alert('Some time entries are invalid and will not be saved.');
                }

                console.log('Saving times:', validTimes);
                const { data: savedTimes, error: upsertError } = await supabase
                    .from('available_times')
                    .upsert(validTimes.map(time => ({ date: formattedDate, time: formatTime(time.time) })), { returning: 'representation' });

                if (upsertError) throw upsertError;

                console.log('Times saved successfully:', savedTimes);
                setAvailableTimes(savedTimes || []);
            } catch (error) {
                console.error('Failed to save times:', error);
            }
        }
    };
    const handleDeleteTime = async (id) => {
        console.log("Attempting to delete time with ID:", id); // Debug log
    
        if (typeof id !== 'number' || isNaN(id)) {
            console.error("Invalid ID:", id);
            return;
        }
    
        try {
            // Call Supabase to delete the time entry with the specific ID
            const { error } = await supabase
                .from('available_times')
                .delete()
                .eq('id', id);
    
            if (error) throw error;
    
            // Remove the deleted time from the local state
            setAvailableTimes((prevTimes) => prevTimes.filter(time => time.id !== id));
        } catch (error) {
            console.error("Error deleting time:", error);
        }
    };
    
    
    

    const handleDeleteTimes = async (timesToDelete) => {
        if (selectedDate) {
            try {
                const formattedDate = formatDate(selectedDate);
                console.log('Deleting times:', timesToDelete);
                const { error } = await supabase
                    .from('available_times')
                    .delete()
                    .in('id', timesToDelete.map(time => time.id))
                    .eq('date', formattedDate);

                if (error) throw error;

                setAvailableTimes((prevTimes) => prevTimes.filter(time => !timesToDelete.some(t => t.id === time.id)));
            } catch (error) {
                console.error('Failed to delete times:', error);
            }
        }
    };




    return (
        <div className="admin-container">
            <div className="calendar-and-times">
                    <div className="calendar-container left-side">
                    <CalendarComponent  style={{ width: '100%', height: '100%' }} className="CalendarComponent" setSelectedDate={setSelectedDate} />
                </div>
                <div className="calendar-section right-side">
                    <h2 className="subHeading">Available Times</h2>

                    <ul className="available-times-list">
    {availableTimes.map((timeEntry) => (
        <li key={timeEntry.id} className="available-time-item">
            {timeEntry.time}
            <button
                className="delete-button"
                onClick={() => handleDeleteTime(timeEntry.id)}
            >
                &times;
            </button>
        </li>
    ))}
</ul>

                </div>
            </div>

            <div className="times-section">
                {selectedDate && (
                    <div>
                        <button
                            className="subHeading-dropdown-toggle"
                            onClick={() => setShowTimesForm(!showTimesForm)}
                        >
                            <h2 className="subHeading">Manage Times for {selectedDate.toDateString()}</h2>
                        </button>

                        {showTimesForm && (
                            <AvailableTimesForm
                                onSaveTimes={handleSaveTimes}
                                onDeleteTimes={handleDeleteTimes}
                                availableTimes={availableTimes}
                                selectedDate={selectedDate}
                            />
                        )}
                    </div>
                )}
            </div>
            <BookingsComponent /> {/* Include the new BookingsComponent */}
        </div>
    );
};



export default AdminDashboard;