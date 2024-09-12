require('dotenv').config();
const express = require("express");
var cors = require("cors");
const pool = require('./config/connection');
const logger = require("./common/logger");
const {getCurrentDateTime} = require("./common/timdate")
const userRoute = require("./routes/users");
const todoRoute = require("./routes/todos");



const app = express();
const api = process.env.API_URL;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(`${api}/user`, userRoute);
app.use(`${api}/todo`, todoRoute);


app.get('/checkdb', async (req, res) => {
    const currentTime = getCurrentDateTime();
    try {
        const [rows, fields] = await pool.query('SELECT 1');
        logger.info(`Get Hit on /checkdb - ${currentTime}`);
        res.status(200).json({ message: 'Database connection is active.' });
    } catch (error) {
        logger.error('Error checking database connection: ', currentTime , error);
        res.status(500).json({ error: 'Database connection is not available.' });
    }
});

// Function to check the database connection
const checkDatabaseConnection = async () => {
    try {
        const [rows, fields] = await pool.query('SELECT 1');
        console.log('Database connected with', process.env.NODE_ENV);
        return true;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return false;
    }
};

// Function to start the server with retry logic for database connection
const startServer = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        const dbConnected = await checkDatabaseConnection();
        if (dbConnected) {
            const port = process.env.PORT || 3000;
            app.listen(port, () => console.log(`Listening on port ${port}`));
            return;
        } else {
            console.log(`Retrying to connect to the database... (${retries - 1} retries left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    console.error('Failed to connect to the database after multiple attempts.');
    process.exit(1); // Exit the application if unable to connect to the database
};

// Start the server
startServer();