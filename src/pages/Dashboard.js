import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // For the calendar
import 'react-calendar/dist/Calendar.css'; // Default styling
import './Styling/dashboardStyle.css'; // Custom styling
import supabase from '../supabaseClient'; // Import your Supabase client

const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [service, setService] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle date change
    const handleDateChange = (newDate) => {
        setDate(newDate);
        fetchAvailableTimes(newDate);
    };

    // Fetch available times from Supabase
    const fetchAvailableTimes = async (selectedDate) => {
        try {
            // Convert selectedDate to UTC to avoid timezone issues
            const utcDate = new Date(Date.UTC(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
            ));

            const formattedDate = utcDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD in UTC
            const { data, error } = await supabase
                .from('available_times')
                .select('time')
                .eq('date', formattedDate);

            if (error) {
                console.error('Error fetching available times:', error.message);
            } else {
                setAvailableTimes(data || []);
            }
        } catch (err) {
            console.error('Error during fetchAvailableTimes:', err);
        }
    };

    // Handle time selection
    const handleTimeClick = (time) => {
        setSelectedTime(time);
    };

    // Handle booking submission
    const handleBooking = async (e) => {
        e.preventDefault();

        if (!selectedTime || !service || !userName || !userEmail || !userPhone) {
            setError('Please fill out all fields.');
            return;
        }

        try {
            // Convert date to UTC format
            const utcDate = new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )).toISOString().split('T')[0]; // Date in YYYY-MM-DD format

            // Convert selected time to UTC
            const utcTime = new Date(`1970-01-01T${selectedTime}Z`).toISOString().split('T')[1].split('.')[0]; // Time in HH:MM:SS format

            const { data, error } = await supabase
                .from('bookings')
                .insert([{
                    date: utcDate, // Send date in YYYY-MM-DD format
                    time: utcTime, // Send time in HH:MM:SS format
                    service,
                    user_name: userName,
                    user_email: userEmail,
                    user_phone: userPhone,
                }]);

            if (error) {
                console.error('Error creating booking:', error.message);
                setError('Failed to create booking.');
            } else {
                setSuccess('Booking created successfully!');
                setError('');
                // Optionally clear the form
                setSelectedTime('');
                setService('');
                setUserName('');
                setUserEmail('');
                setUserPhone('');
            }
        } catch (err) {
            console.error('Error during booking submission:', err);
            setError('Failed to create booking.');
        }
    };

    useEffect(() => {
        fetchAvailableTimes(date); // Fetch available times for the initial date
    }, [date]);

    return (
        <div className="dashboard">
            <Calendar
                onChange={handleDateChange}
                value={date}
                className="calendar"
            />
            <div className="available-times">
                <h2>Available Times for {date.toDateString()}</h2>
                <ul>
                    {availableTimes.length > 0 ? (
                        availableTimes.map((time, index) => (
                            <li
                                key={index}
                                onClick={() => handleTimeClick(time.time)}
                                className={`time-slot ${selectedTime === time.time ? 'selected' : ''}`}
                            >
                                {time.time}
                            </li>
                        ))
                    ) : (
                        <li>No available times</li>
                    )}
                </ul>
            </div>
            {selectedTime && (
                <form onSubmit={handleBooking} className="booking-form">
                    <h2>Create Booking</h2>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <div className="form-group">
                        <label>Service:</label>
                        <input
                            type="text"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Name:</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Email:</label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Phone:</label>
                        <input
                            type="text"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                        />
                    </div>
                    <button type="submit">Book Now</button>
                </form>
            )}
        </div>
    );
};

export default Dashboard;
