const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sequelize = require('./database');
const AvailableTime = require('./models/AvailableTime');
const Booking = require('./models/Booking');
const TimeTemplate = require('./models/TimeTemplate'); // Import the new model

const app = express();
app.use(express.json());
app.use(cors()); // This should allow requests from other origins

const users = [
    { email: 'user@example.com', password: bcrypt.hashSync('userpassword', 10), role: 'user', firstName: '' },
    { email: 'admin@example.com', password: bcrypt.hashSync('adminpassword', 10), role: 'admin', firstName: 'Admin' },
];

const SECRET_KEY = 'your_secret_key';

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ email: user.email, role: user.role, firstName: user.firstName }, SECRET_KEY);
        res.json({ user, token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Save available times route
app.post('/api/save-times', async (req, res) => {
    const { date, times } = req.body;
    try {
        await AvailableTime.destroy({ where: { date } });
        const entries = times.map(time => ({ date, time }));
        await AvailableTime.bulkCreate(entries);
        res.send('Times saved');
    } catch (error) {
        console.error('Error saving times:', error);
        res.status(500).send('Error saving times');
    }
});

// Book time route
app.post('/api/book-time', async (req, res) => {
    const { date, time, service, user } = req.body;

    if (!date || !time || !service || !user.name || !user.email || !user.phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const newBooking = await Booking.create({
            date,
            time,
            service,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone
        });

        res.status(200).json({ message: 'Booking successful', booking: newBooking });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get bookings route
app.get('/api/get-bookings', async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

// Get available times route
app.get('/api/get-times', async (req, res) => {
    const { date } = req.query;
    try {
        const times = await AvailableTime.findAll({ where: { date } });
        res.json({ times: times.map(t => t.time) });
    } catch (error) {
        console.error('Error fetching times:', error);
        res.status(500).send('Error fetching times');
    }
});

// Delete available times route
app.delete('/api/delete-times', async (req, res) => {
    const { date, timesToDelete } = req.body;
    try {
        await AvailableTime.destroy({ where: { date, time: timesToDelete } });
        res.send('Times deleted');
    } catch (error) {
        console.error('Error deleting times:', error);
        res.status(500).send('Error deleting times');
    }
});

// Delete booking route
app.delete('/api/delete-booking/:id', async (req, res) => {
    const { id } = req.params; // Ensure it's "id" and not "_id"
    
    if (!id) {
        return res.status(400).json({ error: 'Booking ID is required' });
    }
    
    try {
        const result = await Booking.destroy({
            where: { id } // Ensure it's "id" here as well
        });

        if (!result) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save time template route
app.post('/api/save-template', async (req, res) => {
    const { name, times } = req.body;
    try {
        await TimeTemplate.create({ name, times });
        res.status(201).send('Template saved');
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).send('Error saving template');
    }
});

// Get time templates route
app.get('/api/get-templates', async (req, res) => {
    try {
        const templates = await TimeTemplate.findAll();
        res.json(templates.map(t => ({ name: t.name, times: t.times })));
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).send('Error fetching templates');
    }
});

// Delete time template route
app.delete('/api/delete-template', async (req, res) => {
    const { name } = req.body;
    try {
        await TimeTemplate.destroy({ where: { name } });
        res.send('Template deleted');
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).send('Error deleting template');
    }
});

// Verify route
app.get('/api/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).send('Invalid token');
            const user = users.find(u => u.email === decoded.email);
            res.json({ user });
        });
    } else {
        res.status(401).send('No token provided');
    }
});

sequelize.sync().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
