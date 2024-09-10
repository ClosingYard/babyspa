import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarComponent = ({ setSelectedDate }) => {
    const [date, setDate] = useState(new Date());

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setSelectedDate(newDate);
    };

    return (
        <div>
            <Calendar
                onChange={handleDateChange}
                value={date}
            />
        </div>
    );
};

export default CalendarComponent;
