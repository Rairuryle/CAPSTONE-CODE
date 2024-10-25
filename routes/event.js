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

    // Access activity names and dates correctly
    const activity_name = req.body['activity_name[]'] ? [].concat(req.body['activity_name[]']) : [];
    const activity_date = req.body['activity_date[]'] ? [].concat(req.body['activity_date[]']) : [];



    console.log('Request Body:', req.body); // Log the entire request body

    if (!event_name || !event_date_start || !event_date_end || !event_scope || !student_id) {
        return res.status(400).send('Please provide all required fields');
    }

    const event_days = getDaysDifference(event_date_start, event_date_end);

    const sqlEvent = `INSERT INTO event (event_name, event_date_start, event_date_end, event_days, event_scope)
                      VALUES (?, ?, ?, ?, ?)`;

    db.query(sqlEvent, [event_name, event_date_start, event_date_end, event_days, event_scope], (err, eventResult) => {
        if (err) {
            console.error('Error inserting event into database:', err);
            return res.status(500).send('Error adding event');
        }

        const eventId = eventResult.insertId;
        console.log('Event ID:', eventId);

        // Log activity data
        console.log('Activity Names:', activity_name);
        console.log('Activity Dates:', activity_date);

        // If activity_name and activity_date are provided, insert into activity table
        if (activity_name.length > 0 && activity_date.length > 0) {
            const activityQueries = activity_name.map((name, index) => {
                if (name && activity_date[index]) {
                    return {
                        query: 'INSERT INTO activity (activity_name, activity_date, event_id) VALUES (?, ?, ?)',
                        params: [name, activity_date[index], eventId],
                    };
                }
                return null;
            }).filter(query => query !== null);

            activityQueries.forEach(({ query, params }) => {
                db.query(query, params, (err) => {
                    if (err) {
                        console.error('Error inserting activity into database:', err);
                    } else {
                        console.log('Activity inserted successfully:', { name: params[0], date: params[1] });
                    }
                });
            });
        } else {
            console.log('No activities to insert.');
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
