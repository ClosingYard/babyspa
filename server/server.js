const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sequelize = require('./database');
const AvailableTime = require('./models/AvailableTime');
const Booking = require('./models/booking')

const app = express();
app.use(express.json());
app.use(cors());

const users = [
    { email: 'user@example.com', password: bcrypt.hashSync('userpassword', 10), role: 'user', firstName: 'John' },
    { email: 'admin@example.com', password: bcrypt.hashSync('adminpassword', 10), role: 'admin', firstName: 'Admin' },
];

const SECRET_KEY = 'your_secret_key';


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


app.get('/api/get-bookings', async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});


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
