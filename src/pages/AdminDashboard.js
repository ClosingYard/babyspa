import React, { useState, useEffect } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import axios from 'axios';

const AdminDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);

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

    const handleSaveTimes = async (times) => {
        if (selectedDate) {
            try {
                await axios.post('http://localhost:5000/api/save-times', {
                    date: selectedDate.toDateString(),
                    times
                });
                setAvailableTimes(times);
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
                setAvailableTimes(availableTimes.filter(time => !timesToDelete.includes(time)));
            } catch (error) {
                console.error('Failed to delete times:', error);
            }
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
        </div>
    );
};

// Existing `AdminDashboard` and `AvailableTimesForm` components

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
        </div>
    );
};

export default AdminDashboard;

