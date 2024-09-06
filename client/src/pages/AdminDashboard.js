import React, { useState, useEffect, useCallback } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import axios from 'axios';
import './Styling/adminDashboard.css';
import AvailableTimesForm from '../components/AvailableTimesForm';
import config from '../config';  // Importing baseURL from config

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showTimesForm, setShowTimesForm] = useState(false);

    const fetchTimes = useCallback(async () => {
        if (selectedDate) {
            try {
                const response = await axios.get(`${config.baseURL}/get-times`, {
                    params: { date: selectedDate.toDateString() }
                });
                setAvailableTimes(response.data.times || []);
            } catch (error) {
                console.error(`Failed to fetch times from ${config.baseURL}:`, error);
            }
        }
    }, [selectedDate]);
    

    useEffect(() => {
        console.log(`Fetching times from: ${config.baseURL}/get-times`);
        fetchTimes();
    }, [fetchTimes]);
    

    const fetchBookings = useCallback(async () => {
        try {
            const response = await axios.get(`${config.baseURL}/get-bookings`);
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleSaveTimes = async (times) => {
        if (selectedDate) {
            try {
                await axios.post(`${config.baseURL}/save-times`, {
                    date: selectedDate.toDateString(),
                    times
                });
                setAvailableTimes((prevTimes) => [...prevTimes, ...times]);
            } catch (error) {
                console.error('Failed to save times:', error);
            }
        }
    };

    const handleDeleteTimes = async (timesToDelete) => {
        if (selectedDate) {
            try {
                await axios.delete(`${config.baseURL}/delete-times`, {
                    data: {
                        date: selectedDate.toDateString(),
                        timesToDelete
                    }
                });
                setAvailableTimes((prevTimes) => prevTimes.filter(time => !timesToDelete.includes(time)));
            } catch (error) {
                console.error('Failed to delete times:', error);
            }
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!bookingId) {
            console.error('No booking ID provided');
            return;
        }

        try {
            await axios.delete(`${config.baseURL}/delete-booking/${bookingId}`);
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
            alert('Booking deleted successfully');
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking');
        }
    };

    return (
        <div className="admin-container">
            <h1 className="heading">Admin Dashboard</h1>
            <CalendarComponent setSelectedDate={setSelectedDate} />

            {selectedDate && (
                <div className="times-section">
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
                        />
                    )}
                </div>
            )}

            <div className="section">
                <h2 className="subHeading">All Bookings</h2>
                <BookingsTable bookings={bookings} onDeleteBooking={handleDeleteBooking} />
            </div>
        </div>
    );
};

const BookingsTable = ({ bookings, onDeleteBooking }) => (
    <div className="table-responsive">
        <table className="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Service</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>User Phone</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map((booking) => (
                    <tr key={booking.id}>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td>{booking.service}</td>
                        <td>{booking.userName}</td>
                        <td>{booking.userEmail}</td>
                        <td>{booking.userPhone}</td>
                        <td>
                            <button
                                className="delete-button"
                                onClick={() => onDeleteBooking(booking.id)}
                            >
                                Cancel Booking
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AdminDashboard;
