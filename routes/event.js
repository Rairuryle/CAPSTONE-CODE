const express = require('express');
const mysql = require('mysql');
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
    const { event_name, event_date_start, event_date_end, event_scope, id_number, to_verify, academic_year, semester } = req.body;

    const activity_name = req.body['activity_name[]'] ? [].concat(req.body['activity_name[]']) : [];
    const activity_date = req.body['activity_date[]'] ? [].concat(req.body['activity_date[]']) : [];

    if (!event_name || !event_date_start || !event_date_end || !event_scope || !id_number || !to_verify || !academic_year || !semester) {
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

        req.session.studentId = id_number;

        res.redirect(`/spr-edit?id=${id_number}`);
    });
});

router.post('/add-activity', (req, res) => {
    const { event_id, id_number, event_date_start } = req.body;
    const activity_name = req.body['activity_name[]'] ? [].concat(req.body['activity_name[]']) : [];
    const activity_date = req.body['activity_date[]'] ? [].concat(req.body['activity_date[]']) : [];

    if (!event_id || activity_name.length === 0 || activity_date.length === 0) {
        return res.status(400).send('Please provide all required fields');
    }

    // Convert event_date_start to a valid Date object
    let startDate = new Date(event_date_start);

    // Check if the initial parsing was successful
    if (isNaN(startDate.getTime())) {
        // Try to parse in case the date is in MM/DD/YYYY format
        const parts = event_date_start.split('/');
        if (parts.length === 3) {
            // Assume MM/DD/YYYY format
            startDate = new Date(parts[2], parts[0] - 1, parts[1]); // Year, Month, Day
        }
    }

    // Validate the parsed date
    if (isNaN(startDate.getTime())) {
        return res.status(400).send('Invalid event start date');
    }

    // Prepare and execute activity insertion
    const activityQueries = activity_name.map((name, index) => {
        if (name && activity_date[index]) {
            const activityDate = new Date(activity_date[index]);
            const dayDifference = Math.ceil((activityDate - startDate) / (1000 * 60 * 60 * 24));

            console.log('Activity Date:', activityDate);
            console.log('Start Date:', startDate);
            console.log('Day difference:', dayDifference);

            return new Promise((resolve, reject) => {
                const sqlActivity = 'INSERT INTO activity (activity_name, activity_date, event_id, activity_day) VALUES (?, ?, ?, ?)';
                db.query(sqlActivity, [name, activityDate.toISOString().split('T')[0], event_id, dayDifference], (err) => {
                    if (err) {
                        console.error('Error inserting activity into database:', err);
                        return reject(err);
                    }
                    console.log('Activity inserted successfully:', { name, date: activityDate });
                    resolve();
                });
            });
        }
        return Promise.resolve(); // Skip if name or date is missing
    }).filter(query => query !== null);

    Promise.all(activityQueries)
        .then(() => {
            res.redirect(`/spr-edit?id=${id_number}`);
        })
        .catch(err => {
            console.error('Error adding activities:', err);
            res.status(500).send('Error adding activities');
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

// Route to assign a role to an activity
router.put('/assign-role', (req, res) => {
    const { activity_id, role_name, id_number, points } = req.body;

    // Check if id_number exists in the student table
    const checkStudentQuery = `SELECT * FROM student WHERE id_number = ?`;
    db.query(checkStudentQuery, [id_number], (error, results) => {
        if (error) {
            console.error('Error checking student:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        // Check if a participation record already exists for this activity and id_number
        const checkExistenceQuery = `
            SELECT COUNT(*) AS count 
            FROM participation_record 
            WHERE activity_id = ? AND id_number = ?`;

        db.query(checkExistenceQuery, [activity_id, id_number], (error, existenceResults) => {
            if (error) {
                console.error('Error checking participation record existence:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            // Determine whether to insert or update
            if (existenceResults[0].count > 0) {
                // Update existing record
                const updateQuery = `
                    UPDATE participation_record 
                    SET participation_record_points = ?, role_name = ?
                    WHERE activity_id = ? AND id_number = ?`;

                db.query(updateQuery, [points, role_name, activity_id, id_number], (error, updateResults) => {
                    if (error) {
                        console.error('Error updating participation record:', error);
                        return res.status(500).json({ error: 'Failed to update participation record' });
                    }
                    res.status(200).json({ message: 'Participation record updated successfully', updateResults });
                });

            } else {
                // Insert new record
                const insertQuery = `
                    INSERT INTO participation_record (participation_record_points, id_number, activity_id, role_name)
                    VALUES (?, ?, ?, ?)`;

                db.query(insertQuery, [points, id_number, activity_id, role_name], (error, insertResults) => {
                    if (error) {
                        console.error('Error saving participation record:', error);
                        return res.status(500).json({ error: 'Failed to create participation record' });
                    }
                    res.status(201).json({ message: 'Participation record created successfully', insertResults });
                });
            }
        });
    });
});


module.exports = router;