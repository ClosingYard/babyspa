import React, { useState, useEffect } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import axios from 'axios';

import './Styling/adminDashboard.css'
import AvailableTimesForm from '../components/AvailableTimesForm';
const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showTimesForm, setShowTimesForm] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            const fetchTimes = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/get-times', {
                        params: { date: selectedDate.toDateString() }
                    });
                    setAvailableTimes(response.data.times || []);
                } catch (error) {
                    console.error('Failed to fetch times:', error);
                }
            };

            fetchTimes();
        }
    }, [selectedDate]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/get-bookings');
                setBookings(response.data || []);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();
    }, []);

    const handleSaveTimes = async (times) => {
        if (selectedDate) {
            try {
                await axios.post('http://localhost:5000/api/save-times', {
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
                await axios.delete('http://localhost:5000/api/delete-times', {
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
            await axios.delete(`http://localhost:5000/api/delete-booking/${bookingId}`);
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
            alert('Booking deleted successfully');
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking');
        }
    };

    return (
        <div className="container">
            <h1 className="heading">Admin Dashboard</h1>
            <CalendarComponent setSelectedDate={setSelectedDate} />

            {selectedDate && (
                <div className="section">
                    <h2 className="subHeading">Manage Times for {selectedDate.toDateString()}</h2>
                    <button className="dropdown-toggle" onClick={() => setShowTimesForm(!showTimesForm)}>
                        {showTimesForm ? 'Hide Form' : 'Show Form'}
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
    <table className="table">
        <thead>
            <tr>
                <th className="th">Date</th>
                <th className="th">Time</th>
                <th className="th">Service</th>
                <th className="th">User Name</th>
                <th className="th">User Email</th>
                <th className="th">User Phone</th>
                <th className="th">Actions</th>
            </tr>
        </thead>
        <tbody>
            {bookings.map((booking) => (
                <tr key={booking.id} className="tr">
                    <td className="td">{booking.date}</td>
                    <td className="td">{booking.time}</td>
                    <td className="td">{booking.service}</td>
                    <td className="td">{booking.userName}</td>
                    <td className="td">{booking.userEmail}</td>
                    <td className="td">{booking.userPhone}</td>
                    <td className="td">
                        <button className="delete-button" onClick={() => onDeleteBooking(booking.id)}>
                            Cancel Booking
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default AdminDashboard;
