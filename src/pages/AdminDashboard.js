import React, { useState, useEffect } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import axios from 'axios';

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookings, setBookings] = useState([]);


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
                // Update the available times state to include the newly saved times
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
                // Update the available times state to remove the deleted times
                setAvailableTimes((prevTimes) => prevTimes.filter(time => !timesToDelete.includes(time)));
            } catch (error) {
                console.error('Failed to delete times:', error);
            }
        }
    };
    const handleDelete = async (bookingId) => {
        if (!bookingId) {
            console.error('No booking ID provided');
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/delete-booking/${bookingId}`);
            setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
            alert('Booking deleted successfully');
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking');
        }
    };
    
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <CalendarComponent setSelectedDate={setSelectedDate} />
            {selectedDate && (
                <div>
                    <h2>Set Available Times for {selectedDate.toDateString()}</h2>
                    <AvailableTimesForm onSaveTimes={handleSaveTimes} onDeleteTimes={handleDeleteTimes} />
                    <div>
                        <h3>Existing Times</h3>
                        <ul>
                            {availableTimes.map((time, index) => (
                                <li key={index}>
                                    {time}
                                    <button onClick={() => handleDeleteTimes([time])}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <div>
            <h2>All Bookings</h2>
                <table>
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
                            <tr key={booking._id}>
                                <td>{booking.date}</td>
                                <td>{booking.time}</td>
                                <td>{booking.service}</td>
                                <td>{booking.userName}</td>
                                <td>{booking.userEmail}</td>
                                <td>{booking.userPhone}</td>
                                <td>
                                    <button onClick={() => handleDelete(booking._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AvailableTimesForm = ({ onSaveTimes, onDeleteTimes }) => {
    const [times, setTimes] = useState([]);
    const [timeToDelete, setTimeToDelete] = useState('');

    const handleAddTime = () => {
        const time = prompt('Enter available time (e.g., 09:00 AM)');
        if (time) {
            setTimes([...times, time]);
        }
    };

    const handleDeleteTimes = () => {
        if (timeToDelete) {
            onDeleteTimes([timeToDelete]);
            setTimeToDelete('');
        }
    };

    const handleSave = () => {
        onSaveTimes(times);
        setTimes([]); // Clear the times input after saving
    };

    return (
        <div>
            <button onClick={handleAddTime}>Add Time</button>
            <button onClick={handleSave}>Save Times</button>
            <input
                type="text"
                value={timeToDelete}
                onChange={(e) => setTimeToDelete(e.target.value)}
                placeholder="Time to delete"
            />
            <button onClick={handleDeleteTimes}>Delete Time</button>
            <div>
                <h4>Times to Save</h4>
                <ul>
                    {times.map((time, index) => (
                        <li key={index}>{time}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
