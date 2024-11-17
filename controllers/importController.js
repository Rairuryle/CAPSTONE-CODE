const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

function processImportedData(importedData, req, res) {
    const { admin_id } = req.body; // Get admin_id from the form submission

    // Queries for inserting or updating attendance records
    const attendanceInsertQuery = `
        INSERT INTO attendance_record 
        (attendance_id, id_number, am_in, pm_in, pm_out, attendance_points, admin_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const attendanceUpdateQuery = `
        UPDATE attendance_record
        SET am_in = ?, pm_in = ?, pm_out = ?, attendance_points = ?
        WHERE attendance_id = ? AND id_number = ?
    `;

    // Queries for inserting participation records
    const participationInsertQuery = `
        INSERT INTO participation_record 
        (activity_id, id_number, role_name, participation_record_points, admin_id) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const participationUpdateQuery = `
        UPDATE participation_record 
        SET activity_id = ?, role_name = ?, participation_record_points = ?, admin_id = ? 
        WHERE activity_id = ? AND id_number = ?
    `;


    // Define role points based on the role name
    const rolePoints = {
        "INDIV. Participant": 15,
        "PROG. Spectator": 10,
        "OTH. Spectator": 5,
        "TEAM Participant": 20,
        "RED Stamp": 5,
        "BLUE Stamp": 10,
        "VIOLET Stamp": 15
    };

    const errors = [];

    // Iterate over the rows in the imported data
    importedData.forEach((row) => {
        // Attendance Part (unchanged)
        const filteredAttendanceRow = {
            id_number: row['ID Number'],  // CSV -> id_number
            attendance_day: row['Attendance Day'],  // CSV -> attendance_day
            am_in: row['AM IN'],  // CSV -> am_in
            pm_in: row['PM IN'],  // CSV -> pm_in
            pm_out: row['PM OUT'],  // CSV -> pm_out
            attendance_points: row['Attendance Points']  // CSV -> attendance_points
        };

        const id_number = filteredAttendanceRow.id_number;  // CSV -> id_number
        const attendance_day = filteredAttendanceRow.attendance_day;  // CSV -> attendance_day
        console.log('Processing attendance for day:', attendance_day);

        if (!attendance_day || !id_number) {
            console.log(`Skipping row due to missing attendance_day or id_number:`, row);
            return; // Skip rows with missing attendance day or ID
        }

        // Find the attendance_id based on the attendance_day
        const attendance_id = req.body[`attendance_id_${attendance_day}`];
        console.log('Found attendance_id for day', attendance_day, ':', attendance_id);

        if (!attendance_id || !id_number || !attendance_day) {
            console.log(`Skipping row due to missing values: attendance_id: ${attendance_id}, id_number: ${id_number}, attendance_day: ${attendance_day}`);
            return; // Skip this iteration if any essential value is missing
        }

        const am_in = filteredAttendanceRow.am_in;  // CSV -> am_in
        const pm_in = filteredAttendanceRow.pm_in;  // CSV -> pm_in
        const pm_out = filteredAttendanceRow.pm_out;  // CSV -> pm_out
        const attendance_points = filteredAttendanceRow.attendance_points;  // CSV -> attendance_points

        // Convert checkbox states (TRUE/FALSE) to integers (5 or null)
        const amIn = (am_in === 'TRUE') ? 5 : null;
        const pmIn = (pm_in === 'TRUE') ? 5 : null;
        const pmOut = (pm_out === 'TRUE') ? 5 : null;

        // Calculate attendance points as the sum of AM IN, PM IN, and PM OUT
        const points = (amIn || 0) + (pmIn || 0) + (pmOut || 0); // Ensure null values are treated as 0

        // Check if the attendance record exists and insert or update it
        const checkExistingQuery = `
            SELECT * FROM attendance_record
            WHERE attendance_id = ? AND id_number = ?
        `;

        db.query(checkExistingQuery, [attendance_id, id_number], (err, result) => {
            if (err) {
                errors.push(`Error checking attendance record for ID: ${id_number}, Error: ${err.message}`);
                console.log(`Error checking attendance record for ${id_number}:`, err);
                return;
            }

            if (result.length > 0) {
                console.log(`Updating attendance record for ID: ${id_number}`);
                db.query(attendanceUpdateQuery, [amIn, pmIn, pmOut, points, attendance_id, id_number], (err, updateResult) => {
                    if (err) {
                        errors.push(`Error updating attendance record for ID: ${id_number}, Error: ${err.message}`);
                        console.log(`Error updating attendance record for ${id_number}:`, err);
                    } else {
                        console.log(`Attendance record updated for ID: ${id_number}`);
                    }
                });
            } else {
                console.log(`Inserting new attendance record for ID: ${id_number}`);
                db.query(attendanceInsertQuery, [attendance_id, id_number, amIn, pmIn, pmOut, points, admin_id], (err, insertResult) => {
                    if (err) {
                        errors.push(`Error inserting attendance record for ID: ${id_number}, Error: ${err.message}`);
                        console.log(`Error inserting attendance record for ${id_number}:`, err);
                    } else {
                        console.log(`Attendance record inserted for ID: ${id_number}`);
                    }
                });
            }
        });

        // Participation Records Part
        const headers = Object.keys(row);
        const startIndex = headers.indexOf('Activity Day');
        const endIndex = headers.indexOf('Participation Points');

        if (startIndex === -1 || endIndex === -1) {
            console.log('Skipping row: Missing Activity Day or Participation Points columns.');
            return;
        }

        const validActivityColumns = headers.slice(startIndex + 1, endIndex);

        console.log('validActivityColumns', validActivityColumns);

        const activity_day = row['Activity Day']; // Activity Day from CSV
        console.log('Activity Day:', activity_day);
        if (!activity_day || !id_number) return;

        validActivityColumns.forEach((activityName) => {
            const roleName = row[activityName]; // Role Name (e.g., "INDIV. Participant")
            console.log('Activity Name:', activityName, 'Role Name:', roleName);

            const participationPoints = rolePoints[roleName];
            console.log('Participation Points:', participationPoints);

            if (roleName && participationPoints !== undefined) {
                const activity_id = req.body[`activity_id_${activity_day}_${activityName}`]; // Dynamic activity_id
                console.log('Activity ID:', activity_id);

                if (!activity_id) {
                    errors.push(`Missing activity_id for Activity Day: ${activity_day}, Role: ${roleName}`);
                    return;
                }

                // Check if participation record already exists
                const checkExistingParticipationQuery = `
                    SELECT * FROM participation_record 
                    WHERE activity_id = ? AND id_number = ?
                `;

                db.query(checkExistingParticipationQuery, [activity_id, id_number, roleName], (err, result) => {
                    if (err) {
                        errors.push(`Error checking participation record for ID: ${id_number}, Activity: ${activityName}, Role: ${roleName}: ${err.message}`);
                        return;
                    }

                    if (result.length > 0) {
                        // Update existing participation record
                        console.log(`Updating participation record for ID: ${id_number}, Activity: ${activityName}, Role: ${roleName}`);
                        db.query(participationUpdateQuery, [activity_id, roleName, participationPoints, admin_id, activity_id, id_number, roleName], (err, updateResult) => {
                            if (err) {
                                errors.push(`Error updating participation record for ${id_number}, Activity: ${activityName}, Role: ${roleName}: ${err.message}`);
                                console.log(`Error updating participation record for ${id_number}:`, err);
                            } else {
                                console.log(`Participation record updated for ID: ${id_number}, Activity: ${activityName}, Role: ${roleName}`);
                            }
                        });
                    } else {
                        // Insert new participation record
                        console.log(`Inserting new participation record for ID: ${id_number}, Activity: ${activityName}, Role: ${roleName}`);
                        db.query(participationInsertQuery, [activity_id, id_number, roleName, participationPoints, admin_id], (err, insertResult) => {
                            if (err) {
                                errors.push(`Error inserting participation record for ${id_number}, Activity: ${activityName}, Role: ${roleName}: ${err.message}`);
                                console.log(`Error inserting participation record for ${id_number}:`, err);
                            } else {
                                console.log(`Participation record inserted for ID: ${id_number}, Activity: ${activityName}, Role: ${roleName}`);
                            }
                        });
                    }
                });
            }
        });
    });

    // Send response with errors or success message
    if (errors.length > 0) {
        res.status(500).json({ message: "Errors occurred during import", errors });
    } else {
        res.json({ message: "CSV data imported successfully" });
    }
}

function processImportedStudentData(importedStudentData, req, res) {
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Format as 'YYYY-MM-DD HH:MM:SS'

    importedStudentData.forEach(student => {
        // Map CSV fields to the correct database columns
        const {
            'First Name': first_name,
            'Last Name': last_name,
            'ID Number': id_number,
            'Department': department_name,
            'Course': course_name,
            'ABO': abo_name,
            'Year Level': year_level
        } = student;

        // Default values for null or static fields
        const ibo_name = null;  // Set IBO name to null
        const exemption_status = 'Not Exempted';  // Default exemption status
        const active_status = 'Active';  // Default active status

        // First, check if the id_number already exists in the database
        const checkIdQuery = `SELECT COUNT(*) AS count FROM student WHERE id_number = ?`;

        db.query(checkIdQuery, [id_number], (err, result) => {
            if (err) {
                console.error('Error checking student ID:', err);
                return res.status(500).json({ success: false, message: 'Error checking student data.' });
            }

            if (result[0].count > 0) {
                // If the ID exists, skip the insertion for this student
                console.log(`ID Number ${id_number} already exists. Skipping insertion.`);
                return;  // Skip the insertion
            }

            // If the ID does not exist, insert the new student data
            const studentInsertQuery = `
                INSERT INTO student 
                (id_number, last_name, first_name, department_name, course_name, abo_name, ibo_name, year_level, exemption_status, active_status, date_added) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const studentValues = [
                id_number,
                last_name,
                first_name,
                department_name,
                course_name,
                abo_name,
                ibo_name,
                year_level,
                exemption_status,
                active_status,
                currentDateTime
            ];

            // Insert the student data into the database
            db.query(studentInsertQuery, studentValues, (err, result) => {
                if (err) {
                    console.error('Error inserting student:', err);
                    return res.status(500).json({ success: false, message: 'Error inserting student data.' });
                }
                console.log('Inserted student with ID:', result.insertId);  // Log the inserted student's ID
            });
        });
    });

    res.status(200).json({ success: true, message: 'Student data successfully imported.' });
}

module.exports = { 
    processImportedData, 
    processImportedStudentData 
};