import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient'; // Import Supabase client
import './AdminBookingsComponent.css'; // Import CSS file

const AdminBookingsComponent = () => {
    const [bookings, setBookings] = useState([]);
    const [filterType, setFilterType] = useState('upcoming'); // Filter type (upcoming, all, etc.)
    const [nameFilter, setNameFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [dateRange, setDateRange] = useState('day'); // day, week, month

    const getFilteredBookings = (data) => {
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        return data.filter(booking => {
            const bookingDate = new Date(booking.date);
            const bookingDateISO = bookingDate.toISOString().split('T')[0];

            const isDateInRange = (date) => {
                switch (dateRange) {
                    case 'week':
                        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                        return date >= startOfWeek.toISOString().split('T')[0];
                    case 'month':
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        return date >= startOfMonth.toISOString().split('T')[0];
                    case 'day':
                    default:
                        return date === todayISO;
                }
            };

            const isUpcoming = filterType === 'upcoming' ? isDateInRange(bookingDateISO) : true;

            return isUpcoming &&
                (nameFilter === '' || (booking.user_name || '').toLowerCase().includes(nameFilter.toLowerCase())) &&
                (serviceFilter === '' || (booking.service || '').toLowerCase().includes(serviceFilter.toLowerCase())) &&
                (phoneFilter === '' || (booking.user_phone || '').toLowerCase().includes(phoneFilter.toLowerCase())) &&
                (emailFilter === '' || (booking.user_email || '').toLowerCase().includes(emailFilter.toLowerCase()));
        });
    };

    const fetchBookings = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*');

            if (error) throw error;

            console.log('Fetched bookings:', data); // Verify the data structure

            // Apply filter
            const filteredBookings = getFilteredBookings(data || []);
            setBookings(filteredBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }, [filterType, nameFilter, serviceFilter, phoneFilter, emailFilter, dateRange]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleDeleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                const { error } = await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setBookings(prevBookings => 
                    prevBookings.filter(booking => booking.id !== id)
                );

                console.log('Booking deleted successfully');
            } catch (error) {
                console.error('Error deleting booking:', error);
            }
        }
    };

    return (
        <div className="section">
            <div className="header">
                <h2 className="subHeading">All Bookings</h2>
                <button className="refresh-button" onClick={fetchBookings}>
                    Refresh
                </button>
            </div>
            <div className="filters">
                <button
                    className={`filter-button ${filterType === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilterType('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    All
                </button>
                <select
                    className="filter-select"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
                <input
                    type="text"
                    placeholder="Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Service"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="filter-input"
                />
            </div>
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
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="7">No bookings available</td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.date || 'N/A'}</td>
                                    <td>{booking.time || 'N/A'}</td>
                                    <td>{booking.service || 'N/A'}</td>
                                    <td>{booking.user_name || 'N/A'}</td>
                                    <td>{booking.user_email || 'N/A'}</td>
                                    <td>{booking.user_phone || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteBooking(booking.id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBookingsComponent;
