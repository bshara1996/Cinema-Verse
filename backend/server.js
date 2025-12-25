const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/config');
const movieRoutes = require('./routes/movieRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', movieRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'YTS Wrapper API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
