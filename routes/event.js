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
    const { event_name, event_date_start, event_date_end, event_scope, student_id, to_verify, academic_year, semester } = req.body;

    const activity_name = req.body['activity_name[]'] ? [].concat(req.body['activity_name[]']) : [];
    const activity_date = req.body['activity_date[]'] ? [].concat(req.body['activity_date[]']) : [];

    if (!event_name || !event_date_start || !event_date_end || !event_scope || !student_id || !to_verify || !academic_year || !semester) {
        return res.status(400).send('Please provide all required fields');
    }

    const event_days = getDaysDifference(event_date_start, event_date_end);

    const sqlEvent = `INSERT INTO event (event_name, event_date_start, event_date_end, event_days, event_scope, to_verify, academic_year, semester)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sqlEvent, [event_name, event_date_start, event_date_end, event_days, event_scope, to_verify, academic_year, semester], (err, eventResult) => {
        if (err) {
            console.error('Error inserting event into database:', err);
            return res.status(500).send('Error adding event');
        }

        const eventId = eventResult.insertId;

        // Add attendance records for each day within event date range
        let currentDate = new Date(event_date_start);
        const endDate = new Date(event_date_end);
        const attendanceQueries = [];

        // Initialize attendance day counter
        let attendanceDayCounter = 1;

        while (currentDate <= endDate) {
            const attendanceDate = new Date(currentDate).toISOString().split('T')[0]; // Format as YYYY-MM-DD
            const sqlAttendance = 'INSERT INTO attendance (attendance_date, event_id, attendance_day) VALUES (?, ?, ?)';
            attendanceQueries.push(db.query(sqlAttendance, [attendanceDate, eventId, attendanceDayCounter]));
            attendanceDayCounter++; // Increment the attendance day
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        // Insert activities if provided
        if (activity_name.length > 0 && activity_date.length > 0) {
            const activityQueries = activity_name.map((name, index) => {
                if (name && activity_date[index]) {
                    const activityDate = new Date(activity_date[index]);
                    const startDate = new Date(event_date_start);
                    const dayDifference = Math.ceil((activityDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to make it 1-based index

                    return {
                        query: 'INSERT INTO activity (activity_name, activity_date, event_id, activity_day) VALUES (?, ?, ?, ?)',
                        params: [name, activity_date[index], eventId, dayDifference],
                    };
                }
                return null;
            }).filter(query => query !== null);

            activityQueries.forEach(({ query, params }) => {
                db.query(query, params, (err) => {
                    if (err) {
                        console.error('Error inserting activity into database:', err);
                    } else {
                        console.log('Activity inserted successfully:', { name: params[0], date: params[1], day: params[3] });
                    }
                });
            });
        }

        req.session.eventData = {
            event_name,
            event_date_start,
            event_date_end,
            event_days,
            event_scope,
            to_verify,
            academic_year,
            semester
        };

        req.session.studentId = student_id;

        res.redirect(`/spr-edit?id=${student_id}`);
    });
});


router.post('/academic_year', async (req, res) => {
    const { academic_year } = req.body; //

    if (!academic_year) {
        return res.status(400).json({ error: 'Academic year is required.' });
    }

    try {
        await db.query('INSERT INTO academic_year (academic_year) VALUES (?)', [academic_year]);

        res.status(201).json({ message: 'Academic year added successfully' });
    } catch (error) {
        console.error('Error adding academic year:', error);
        res.status(500).json({ error: 'An error occurred while adding the academic year.' });
    }
});

module.exports = router;