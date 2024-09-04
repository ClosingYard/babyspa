const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = [
    { email: 'user@example.com', password: bcrypt.hashSync('userpassword', 10), role: 'user' },
    { email: 'admin@example.com', password: bcrypt.hashSync('adminpassword', 10), role: 'admin' },
];

const SECRET_KEY = 'your_secret_key';

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY);
        res.json({ user, token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
