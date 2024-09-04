import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar'; // Install this package for calendar UI

const Dashboard = ({ user }) => {
    const [date, setDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [service, setService] = useState('');

    useEffect(() => {
        const fetchAvailableTimes = async () => {
            const res = await axios.get('http://localhost:5000/api/get-times', { params: { date: date.toISOString().split('T')[0] } });
            setAvailableTimes(res.data.times);
        };

        fetchAvailableTimes();
    }, [date]);

    const handleBooking = async () => {
        try {
            await axios.post('/api/book-time', {
                date: date.toISOString().split('T')[0],
                time: selectedTime,
                service,
                user
            });
            alert('Booking successful');
        } catch (error) {
            console.error('Error making booking:', error);
            alert('Error making booking');
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <Calendar
                onChange={setDate}
                value={date}
            />
            <div>
                <h2>Available Times</h2>
                <ul>
                    {availableTimes.map((time, index) => (
                        <li key={index}>
                            <button onClick={() => setSelectedTime(time)}>{time}</button>
                        </li>
                    ))}
                </ul>
                <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="Enter service"
                />
                <button onClick={handleBooking}>Book Time</button>
            </div>
        </div>
    );
};

export default Dashboard;
