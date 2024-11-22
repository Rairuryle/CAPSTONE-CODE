const express = require('express');
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const session = require('express-session');
const authMiddleware = require('./middleware/authMiddleware');
const bodyParser = require('body-parser'); // Parsing form data
dotenv.config({ path: './.env' });

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const processImportedData = require('./controllers/importController');


const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// parse JSON bodies (as sent by API clients)
app.use(express.json());

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        or: function () {
            for (let i = 0; i < arguments.length - 1; i++) {
                if (arguments[i]) {
                    return true;
                }
            }
            return false;
        },
        and: function (a, b) {
            return a && b;
        },
        indexIsEven: function (index) {
            return index % 2 === 0;
        },
        indexIsOdd: function (index) {
            return index % 2 !== 0;
        },
        json: (context) => {
            return JSON.stringify(context);
        },
        formatDate: function (date) {
            const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
            return new Date(date).toLocaleDateString('en-US', options);
        },
        calculateDays: function (startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        },
        range: function (from, to) {
            const result = [];
            for (let i = from; i <= to; i++) {
                result.push(i);
            }
            return result;
        },
        sum: function (a, b) {
            return (a || 0) + (b || 0);
        }
    }
}));

app.set('view engine', 'hbs');

// Configure express-session
app.use(session({
    secret: 'kakaka',
    resave: true,
    saveUninitialized: true
}));

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL Connected");
    }
});

// Define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', authMiddleware);
app.use('/student', require('./routes/student'));
app.use('/event', require('./routes/event'));
app.use('/import', require('./routes/import')); // Import routes

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log("Server started on Port 3000");
});
