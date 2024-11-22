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

        let attendanceDayCounter = 1;

        while (currentDate <= endDate) {
            const attendanceDate = new Date(currentDate).toISOString().split('T')[0]; // Format as YYYY-MM-DD
            const sqlAttendance = 'INSERT INTO attendance (attendance_date, event_id, attendance_day) VALUES (?, ?, ?)';
            attendanceQueries.push(db.query(sqlAttendance, [attendanceDate, eventId, attendanceDayCounter]));

            // Insert "Midas Touch Avenue" activity only if the event_scope is INSTITUTIONAL
            if (event_scope === 'INSTITUTIONAL') {
                const sqlActivityMidas = 'INSERT INTO activity (activity_name, activity_date, event_id, activity_day) VALUES (?, ?, ?, ?)';
                db.query(sqlActivityMidas, ['Midas Touch Avenue', attendanceDate, eventId, attendanceDayCounter], (err) => {
                    if (err) {
                        console.error('Error inserting Midas Touch Avenue activity:', err);
                    } else {
                        console.log(`Midas Touch Avenue activity inserted for date: ${attendanceDate}`);
                    }
                });
            }

            attendanceDayCounter++; // Increment the attendance day
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        // Insert activities if provided
        if (activity_name.length > 0 && activity_date.length > 0) {
            const activityQueries = activity_name.map((name, index) => {
                if (name && activity_date[index]) {
                    const activityDate = new Date(activity_date[index]);
                    const startDate = new Date(event_date_start);
                    const dayDifference = Math.ceil((activityDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

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



// add activity
router.post('/add-activity', (req, res) => {
    const { event_id, student_id, event_date_start } = req.body;
    const activity_name = req.body['activity_name[]'] ? [].concat(req.body['activity_name[]']) : [];
    const activity_date = req.body['activity_date[]'] ? [].concat(req.body['activity_date[]']) : [];

    if (!event_id || activity_name.length === 0 || activity_date.length === 0) {
        return res.status(400).send('Please provide all required fields');
    }

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

    if (isNaN(startDate.getTime())) {
        return res.status(400).send('Invalid event start date');
    }

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
            res.redirect(`/spr-edit?id=${student_id}`);
        })
        .catch(err => {
            console.error('Error adding activities:', err);
            res.status(500).send('Error adding activities');
        });
});

// academic year
router.post('/academic_year', async (req, res) => {
    const { academic_year } = req.body;

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


// assign role
router.put('/assign-role', (req, res) => {
    const { activity_id, role_name, id_number, points, admin_id } = req.body;

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
                const updateQuery = `
                    UPDATE participation_record 
                    SET participation_record_points = ?, role_name = ?, admin_id = ?
                    WHERE activity_id = ? AND id_number = ?`;

                db.query(updateQuery, [points, role_name, admin_id, activity_id, id_number], (error, updateResults) => {
                    if (error) {
                        console.error('Error updating participation record:', error);
                        return res.status(500).json({ error: 'Failed to update participation record' });
                    }
                    res.status(200).json({ message: 'Participation record updated successfully', updateResults });
                });

            } else {
                const insertQuery = `
                    INSERT INTO participation_record (participation_record_points, id_number, activity_id, role_name, admin_id)
                    VALUES (?, ?, ?, ?, ?)`;

                db.query(insertQuery, [points, id_number, activity_id, role_name, admin_id], (error, insertResults) => {
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

router.post('/record-attendance', (req, res) => {
    const { attendance_points, am_in, pm_in, pm_out, attendance_id, id_number, admin_id } = req.body;

    // If all attendance statuses are null, skip the update/insert and return
    if (am_in === null && pm_in === null && pm_out === null) {
        return res.status(400).json({ success: false, message: 'All attendance statuses are null, use delete endpoint' });
    }

    const selectQuery = 'SELECT * FROM attendance_record WHERE attendance_id = ? AND id_number = ?';
    db.query(selectQuery, [attendance_id, id_number], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        if (results.length > 0) {
            const updateQuery = `
                UPDATE attendance_record 
                SET attendance_points = ?, am_in = ?, pm_in = ?, pm_out = ?, admin_id = ?
                WHERE attendance_id = ? AND id_number = ?`;

            const updateValues = [attendance_points, am_in, pm_in, pm_out, admin_id, attendance_id, id_number];
            db.query(updateQuery, updateValues, (err, results) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: 'Attendance record updated successfully' });
            });
        } else {
            const insertQuery = `
                INSERT INTO attendance_record (attendance_points, am_in, pm_in, pm_out, attendance_id, id_number, admin_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const insertValues = [attendance_points, am_in, pm_in, pm_out, attendance_id, id_number, admin_id];
            db.query(insertQuery, insertValues, (err, results) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: 'Attendance record inserted successfully', attendance_id: results.insertId });
            });
        }
    });
});

// delete the attendance record if all checkboxes are unchecked
router.post('/delete-attendance', (req, res) => {
    const { attendance_id, id_number } = req.body;

    const deleteQuery = 'DELETE FROM attendance_record WHERE attendance_id = ? AND id_number = ?';
    db.query(deleteQuery, [attendance_id, id_number], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Attendance record deleted successfully' });
    });
});


// update event
router.post('/update-event', (req, res) => {
    const { event_id, event_name, event_date_start, event_date_end } = req.body;

    if (!event_name || !event_date_start || !event_date_end) {
        return res.status(400).send('Please provide all required fields');
    }

    const event_days = getDaysDifference(event_date_start, event_date_end);

    const updateEventQuery = `
        UPDATE event
        SET event_name = ?, event_date_start = ?, event_date_end = ?, event_days = ?
        WHERE event_id = ?
    `;

    db.query(updateEventQuery, [event_name, event_date_start, event_date_end, event_days, event_id], (err) => {
        if (err) {
            console.error('Error updating event in database:', err);
            return res.status(500).send('Error updating event');
        }

        const deleteAttendanceQuery = `
            DELETE FROM attendance 
            WHERE event_id = ? 
            AND (attendance_date < ? OR attendance_date > ?)
        `;

        db.query(deleteAttendanceQuery, [event_id, event_date_start, event_date_end], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting out-of-range attendance records:', deleteErr);
                return res.status(500).send('Error managing attendance records');
            }

            const deleteActivityQuery = `
                DELETE FROM activity 
                WHERE event_id = ? 
                AND (activity_date < ? OR activity_date > ?)
            `;

            db.query(deleteActivityQuery, [event_id, event_date_start, event_date_end], (activityErr) => {
                if (activityErr) {
                    console.error('Error deleting out-of-range activities:', activityErr);
                    return res.status(500).send('Error managing activities');
                }

                // Update activity_day dynamically based on the new event_date_start
                const updateActivityDayQuery = `
                    UPDATE activity
                    SET activity_day = DATEDIFF(activity_date, ?) + 1
                    WHERE event_id = ? 
                    AND activity_date BETWEEN ? AND ?
                `;

                db.query(updateActivityDayQuery, [event_date_start, event_id, event_date_start, event_date_end], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating activity_day for activities:', updateErr);
                        return res.status(500).send('Error updating activity_day');
                    }

                    // update the attendance_day for all attendance records within the new date range
                    const updateAttendanceDayQuery = `
                        UPDATE attendance
                        SET attendance_day = DATEDIFF(attendance_date, ?) + 1
                        WHERE event_id = ? 
                        AND attendance_date BETWEEN ? AND ?
                    `;

                    db.query(updateAttendanceDayQuery, [event_date_start, event_id, event_date_start, event_date_end], (attendanceUpdateErr) => {
                        if (attendanceUpdateErr) {
                            console.error('Error updating attendance_day for attendance records:', attendanceUpdateErr);
                            return res.status(500).send('Error updating attendance_day');
                        }

                        let currentDate = new Date(event_date_start);
                        const endDate = new Date(event_date_end);

                        // Insert new attendance records for all the dates in the new event date range
                        const insertAttendance = (attendanceDate, attendanceDay) => {
                            return new Promise((resolve, reject) => {
                                const checkAttendanceQuery = `
                                    SELECT 1 FROM attendance
                                    WHERE event_id = ? AND attendance_date = ? 
                                `;

                                db.query(checkAttendanceQuery, [event_id, attendanceDate], (checkErr, results) => {
                                    if (checkErr) {
                                        console.error('Error checking for existing attendance record:', checkErr);
                                        return reject('Error checking attendance records');
                                    }

                                    if (results.length === 0) {  // No existing record, insert new
                                        const sqlAttendance = `
                                            INSERT INTO attendance (attendance_date, event_id, attendance_day) 
                                            VALUES (?, ?, ?)
                                        `;

                                        db.query(sqlAttendance, [attendanceDate, event_id, attendanceDay], (insertErr) => {
                                            if (insertErr) {
                                                console.error('Error inserting attendance record:', insertErr);
                                                return reject('Error inserting attendance record');
                                            }
                                            resolve();
                                        });
                                    } else {
                                        resolve();  // No insertion needed, resolve immediately
                                    }
                                });
                            });
                        };

                        const attendancePromises = [];
                        let attendanceDayCounter = 1;

                        // Store all attendance dates to sort them before inserting
                        const attendanceDates = [];

                        while (currentDate <= endDate) {
                            const attendanceDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

                            // Recalculate attendance_day based on the new event_date_start
                            const diffTime = currentDate - new Date(event_date_start);
                            const attendanceDay = Math.floor(diffTime / (1000 * 3600 * 24)) + 1;

                            attendanceDates.push({ attendanceDate, attendanceDay });
                            currentDate.setDate(currentDate.getDate() + 1);
                        }

                        // Sort the attendance dates in chronological order
                        attendanceDates.sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate));

                        attendanceDates.forEach(item => {
                            attendancePromises.push(insertAttendance(item.attendanceDate, item.attendanceDay));
                        });

                        // Wait for all attendance records to be inserted before responding
                        Promise.all(attendancePromises)
                            .then(() => {
                                res.json({ success: true, message: 'Event, attendance, and activities updated successfully' });
                            })
                            .catch(err => {
                                console.error('Error inserting attendance records:', err);
                                res.status(500).send('Error inserting attendance records');
                            });
                    });
                });
            });
        });
    });
});

router.post('/delete-event', (req, res) => {
    const { event_id } = req.body;
    console.log('Deleting event with ID:', event_id);

    const deleteQuery = 'DELETE FROM event WHERE event_id = ?';

    db.query(deleteQuery, [event_id], (error, result) => {
        if (error) {
            console.error('Error deleting event:', error);
            res.json({ success: false, message: 'Error deleting event.' });
            return;
        }

        const affectedRows = result.affectedRows;
        console.log('Delete query affected rows:', affectedRows);

        if (affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Event not found or failed to delete.' });
        }
    });
});

router.post('/update-activity', (req, res) => {
    const { activity_id, activity_name, activity_date, activity_day } = req.body;
    console.log('Updating activity:', req.body);

    if (!activity_id || !activity_name || !activity_date || !activity_day) {
        return res.status(400).json({ success: false, message: 'Activity ID, name, date, and day are required.' });
    }

    const query = `
        UPDATE activity 
        SET activity_name = ?, activity_date = ?, activity_day = ? 
        WHERE activity_id = ?
    `;

    db.query(query, [activity_name, activity_date, activity_day, activity_id], (err, result) => {
        if (err) {
            console.error('Error updating activity:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        res.json({ success: true, message: 'Activity updated successfully!' });
    });
});

router.post('/delete-activity', (req, res) => {
    const { activity_id } = req.body;
    console.log('Deleting activity with ID:', activity_id);

    const deleteQuery = 'DELETE FROM activity WHERE activity_id = ?';

    db.query(deleteQuery, [activity_id], (error, result) => {
        if (error) {
            console.error('Error deleting activity:', error);
            res.json({ success: false, message: 'Error deleting activity.' });
            return;
        }

        const affectedRows = result.affectedRows;
        console.log('Delete query affected rows:', affectedRows);

        if (affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Activity not found or failed to delete.' });
        }
    });
});

module.exports = router;
