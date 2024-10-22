const express = require('express');
const mysql = require('mysql');
const { getUrlFlags, isLeadingOrgs, isMainOrgs, isExtraOrgs, otherCombinations } = require('./utils');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const getDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.max(1, diffInDays + 1); // At least 1 day, inclusive of both start and end dates
};

router.post('/add-event', (req, res) => {
    const { event_name, event_date_start, event_date_end, event_scope, student_id } = req.body;

    if (!event_name || !event_date_start || !event_date_end || !event_scope || !student_id) {
        return res.status(400).send('Please provide all required fields');
    }

    const event_days = getDaysDifference(event_date_start, event_date_end);

    const sql = `INSERT INTO event (event_name, event_date_start, event_date_end, event_days, event_scope)
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [event_name, event_date_start, event_date_end, event_days, event_scope], (err, result) => {
        if (err) {
            console.error('Error inserting event into database:', err);
            return res.status(500).send('Error adding event');
        }

        req.session.eventData = {
            event_name,
            event_date_start,
            event_date_end,
            event_days,
            event_scope
        };

        req.session.studentId = student_id;

        console.log('Event added:', req.session.eventData);
        res.redirect(`/spr-edit?id=${student_id}`);
    });
});

module.exports = router;
