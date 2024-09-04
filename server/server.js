const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = [
    { email: 'user@example.com', password: bcrypt.hashSync('userpassword', 10), role: 'user', firstName: 'John' },
    { email: 'admin@example.com', password: bcrypt.hashSync('adminpassword', 10), role: 'admin', firstName: 'Admin' },
];

const availableTimes = {}; // Store times in memory for simplicity

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

app.post('/api/save-times', (req, res) => {
    const { date, times } = req.body;
    availableTimes[date] = times;
    res.send('Times saved');
});

app.get('/api/get-times', (req, res) => {
    const { date } = req.query;
    res.json({ times: availableTimes[date] || [] });
});

app.delete('/api/delete-times', (req, res) => {
    const { date, timesToDelete } = req.body;
    if (availableTimes[date]) {
        availableTimes[date] = availableTimes[date].filter(time => !timesToDelete.includes(time));
        res.send('Times deleted');
    } else {
        res.status(404).send('Date not found');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
