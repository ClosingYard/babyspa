import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar'; // Make sure this package is installed
import './Styling/dashboardStyle.css'; // Adjust the path to your custom CSS file

const Dashboard = ({ user }) => {
    // State variables
    const [date, setDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [service, setService] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [bookingId, setBookingId] = useState(null);

    // Fetch available times whenever the date changes
    useEffect(() => {
        const fetchAvailableTimes = async () => {
            try {
                const res = await axios.get('http://192.168.1.96:5000/api/get-times', {
                    params: { date: date.toDateString() }
                });
                setAvailableTimes(res.data.times || []);
            } catch (error) {
                console.error('Error fetching available times:', error);
            }
        };

        fetchAvailableTimes();
    }, [date]);

    const handleBooking = async () => {
        if (!selectedTime || !service || !userName || !userEmail || !userPhone) {
            alert('Please fill in all fields before booking.');
            return;
        }
    
        try {
            const response = await axios.post('http://192.168.1.96:5000/api/book-time', {
                date: date.toDateString(),
                time: selectedTime,
                service,
                user: {
                    name: userName,
                    email: userEmail,
                    phone: userPhone
                }
            });
    
            if (response.status === 200) {
                setBookingId(response.data.bookingId); // Save the booking ID
                alert('Booking successful');
                setSelectedTime('');
                setService('');
                setUserName('');
                setUserEmail('');
                setUserPhone('');
            } else {
                alert('Failed to book time. Please try again.');
            }
        } catch (error) {
            console.error('Error making booking:', error.response || error.message);
            alert('Error making booking. Please try again later.');
        }
    };
    
    const handleDeleteBooking = async () => {
        if (!bookingId) {
            alert('No booking ID available.');
            return;
        }
    
        try {
            const response = await axios.delete(`http://localhost:5000/api/book-time/${bookingId}`);
    
            if (response.status === 200) {
                alert('Booking deleted successfully');
                setBookingId(null); // Clear booking ID
            } else {
                alert('Failed to delete booking. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting booking:', error.response || error.message);
            alert('Error deleting booking. Please try again later.');
        }
    };
    

    return (
        <div>
            <h1>Dashboard</h1>
            <Calendar onChange={setDate} value={date} />
            <div>
                <h2>Available Times for {date.toDateString()}</h2>
                {availableTimes.length > 0 ? (
                    <ul>
                        {availableTimes.map((time, index) => (
                            <li key={index}>
                                <button onClick={() => setSelectedTime(time)}>{time}</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No available times for the selected date.</p>
                )}
            </div>
            {selectedTime && (
                <div>
                    <h3>Book a Reservation for {selectedTime} on {date.toDateString()}</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleBooking();
                    }}>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                        <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                        <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                        <input
                            type="text"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            placeholder="Enter service"
                            required
                        />
                        <button type="submit">Book Time</button>
                    </form>
                    {bookingId && (
                        <button onClick={handleDeleteBooking}>Cancel Booking</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
