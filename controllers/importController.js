const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

function processImportedData(importedData, req, res) {
    const { admin_id } = req.body; // Get admin_id from the form submission

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

    const errors = [];

    // Iterate over the rows in the imported data
    importedData.forEach((row) => {
        // Filter only the necessary columns: 'ID Number', 'Attendance Day', 'AM IN', 'PM IN', 'PM OUT', 'Attendance Points'
        const filteredRow = {
            id_number: row['ID Number'],  // CSV -> id_number
            attendance_day: row['Attendance Day'],  // CSV -> attendance_day
            am_in: row['AM IN'],  // CSV -> am_in
            pm_in: row['PM IN'],  // CSV -> pm_in
            pm_out: row['PM OUT'],  // CSV -> pm_out
            attendance_points: row['Attendance Points']  // CSV -> attendance_points
        };

        const id_number = filteredRow.id_number;  // CSV -> id_number
        const attendance_day = filteredRow.attendance_day;  // CSV -> attendance_day
        console.log('Processing attendance for day:', attendance_day);

        // Ensure attendance_day is valid before processing the row
        if (!attendance_day || !id_number) {
            console.log(`Skipping row due to missing attendance_day or id_number:`, row);
            return; // Skip rows with missing attendance day or ID
        }

        // Find the attendance_id based on the attendance_day
        const attendance_id = req.body[`attendance_id_${attendance_day}`];
        console.log('Found attendance_id for day', attendance_day, ':', attendance_id);

        // Skip rows with missing attendance_id or essential values
        if (!attendance_id || !id_number || !attendance_day) {
            console.log(`Skipping row due to missing values: attendance_id: ${attendance_id}, id_number: ${id_number}, attendance_day: ${attendance_day}`);
            return; // Skip this iteration if any essential value is missing
        }

        const am_in = filteredRow.am_in;  // CSV -> am_in
        const pm_in = filteredRow.pm_in;  // CSV -> pm_in
        const pm_out = filteredRow.pm_out;  // CSV -> pm_out
        const attendance_points = filteredRow.attendance_points;  // CSV -> attendance_points

        // Convert checkbox states (TRUE/FALSE) to integers (5 or null)
        const amIn = (am_in === 'TRUE') ? 5 : null;
        const pmIn = (pm_in === 'TRUE') ? 5 : null;
        const pmOut = (pm_out === 'TRUE') ? 5 : null;

        // Calculate attendance points as the sum of AM IN, PM IN, and PM OUT
        const points = (amIn || 0) + (pmIn || 0) + (pmOut || 0); // Ensure null values are treated as 0

        // Log values before the query to check
        console.log('Prepared values for insert/update:', {
            attendance_id,
            id_number,
            amIn,
            pmIn,
            pmOut,
            points,
            admin_id
        });

        // First, check if the record exists
        const checkExistingQuery = `
            SELECT * FROM attendance_record
            WHERE attendance_id = ? AND id_number = ?
        `;

        db.query(checkExistingQuery, [attendance_id, id_number], (err, result) => {
            if (err) {
                errors.push(`Error checking attendance record for ID: ${id_number}, Error: ${err.message}`);
                console.log(`Error checking attendance record for ID: ${id_number}:`, err);
                return;
            }

            // If record exists, update it; otherwise, insert it
            if (result.length > 0) {
                // Record exists, update it
                console.log(`Updating attendance record for ID: ${id_number}`);
                db.query(attendanceUpdateQuery, [amIn, pmIn, pmOut, points, attendance_id, id_number], (err, updateResult) => {
                    if (err) {
                        errors.push(`Error updating attendance record for ID: ${id_number}, Error: ${err.message}`);
                        console.log(`Error updating attendance record for ID: ${id_number}:`, err);
                    } else {
                        console.log(`Attendance record updated for ID: ${id_number}`);
                    }
                });
            } else {
                // Record doesn't exist, insert it
                console.log(`Inserting new attendance record for ID: ${id_number}`);
                db.query(attendanceInsertQuery, [attendance_id, id_number, amIn, pmIn, pmOut, points, admin_id], (err, insertResult) => {
                    if (err) {
                        errors.push(`Error inserting attendance record for ID: ${id_number}, Error: ${err.message}`);
                        console.log(`Error inserting attendance record for ID: ${id_number}:`, err);
                    } else {
                        console.log(`Attendance record inserted for ID: ${id_number}`);
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


module.exports = { processImportedData };
