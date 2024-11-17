const express = require('express');
const mysql = require("mysql");
const { isMainOrgs, isExtraOrgs } = require('../utils/utilsOrg');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

function getFlags(organization) {
    const { isSAO, isUSGorSAO, isCollegeOrSAO } = isMainOrgs(organization);
    const { isCSOorSAO, isCSOorIBOorSAO, isExtraOrgsTrue } = isExtraOrgs(organization);

    return {
        isSAO,
        isUSGorSAO,
        isCollegeOrSAO,
        isCSOorIBOorSAO,
        isExtraOrgsTrue,
        isCAS: ["JSWAP", "LABELS", "LSUPS", "POLISAYS"].includes(organization) || isCSOorSAO,
        isCBA: ["JFINEX", "JMEX", "JPIA"].includes(organization) || isCSOorSAO,
        isCCSEA: ["ALGES", "ICpEP", "IIEE", "JIECEP", "LISSA", "PICE", "SOURCE", "UAPSA"].includes(organization) || isCSOorSAO,
        isCTE: ["ECC", "GENTLE", "GEM-O", "LapitBayan", "LME", "SPEM", "SSS"].includes(organization) || isCSOorSAO,
        isCTHM: ["FHARO", "FTL", "SOTE"].includes(organization) || isCSOorSAO,
        isCASCollege: ["CAS"].includes(organization) || isSAO,
        isCBACollege: ["CBA"].includes(organization) || isSAO,
        isCCSEACollege: ["CCSEA"].includes(organization) || isSAO,
        isCTECollege: ["CTE"].includes(organization) || isSAO,
        isCTHMCollege: ["CTHM"].includes(organization) || isSAO,
        isCollegeOrSAORegister: ["CAS", "CBA", "CCSEA", "CTE", "CTHM"].includes(organization) || isSAO
    };
}

router.post('/add-student', (req, res) => {
    const {
        firstNameStudent,
        lastNameStudent,
        IDNumberStudent,
        departmentStudent,
        courseStudent,
        ABOStudent,
        yearStudent,
        exemptionStatusStudent,
        activeStatusStudent,
    } = req.body;

    const organization = req.session.adminData.organization;

    const flags = getFlags(organization);
    console.log("Flags:", flags);

    db.query('SELECT id_number FROM student WHERE id_number = ?', [IDNumberStudent], async (error, results) => {
        if (error) {
            console.log(error);
            return res.render('add-student', {
                message: 'An error occurred',
                adminData: req.session.adminData,
                organization,
                ...flags
            });
        }

        if (results.length === 0) {
            db.query('INSERT INTO student SET ?', {
                id_number: IDNumberStudent,
                last_name: lastNameStudent,
                first_name: firstNameStudent,
                department_name: departmentStudent,
                course_name: courseStudent,
                abo_name: ABOStudent,
                year_level: yearStudent,
                exemption_status: exemptionStatusStudent,
                active_status: activeStatusStudent
            }, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.render('add-student', {
                        message: 'An error occurred',
                        adminData: req.session.adminData,
                        organization,
                        ...flags
                    });
                } else {
                    console.log(results);
                    // Pass the student ID to the success page
                    res.redirect(`/add-student-successful?addedStudentID=${IDNumberStudent}`);
                }
            });
        } else {
            return res.render('add-student', {
                message: 'That ID Number is already in use',
                adminData: req.session.adminData,
                organization,
                ...flags
            });
        }
    });
});


const connection = require('../db');

// Route to get students
router.get('/students', (req, res) => {
    const yourQuery = 'SELECT id_number, last_name, first_name FROM student';

    connection.query(yourQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/add-students-to-ibo', (req, res) => {
    const { students, ibo_name } = req.body;
    console.log('Students:', students);
    console.log('IBO Name:', ibo_name);

    // Validate students array
    if (!students || !Array.isArray(students) || !students.length) {
        return res.status(400).json({ success: false, message: 'Students array is missing or empty' });
    }

    if (!ibo_name) {
        return res.status(400).json({ success: false, message: 'IBO name is missing' });
    }

    const placeholders = students.map(() => '?').join(',');
    const query = `UPDATE student SET ibo_name = ? WHERE id_number IN (${placeholders})`;

    // Prepare the parameters for the query
    const parameters = [ibo_name, ...students];
    console.log('SQL Query:', query);
    console.log('Parameters:', parameters);

    db.query(query, parameters, (error, results) => {
        if (error) {
            console.error('Error updating students:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Students added to IBO successfully' });
    });
});

// Search route to find a student
router.get('/search', (req, res) => {
    const searchQuery = req.query.searchStudentProfile; // This will now accept both id_number and names
    const organization = req.session.adminData.organization;

    const unrestrictedOrganizations = ["SAO", "USG", "CSO"];

    if (!searchQuery) {
        return res.status(400).json({ studentFound: false, message: 'Search query is required' });
    }

    const query = `
        SELECT * FROM student 
        WHERE id_number = ? 
        OR first_name LIKE ? 
        OR last_name LIKE ?
    `;
    const likeSearch = `%${searchQuery}%`; // Allow for partial matches

    db.query(query, [searchQuery, likeSearch, likeSearch], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ studentFound: false });
        }

        if (results.length > 0) {
            const studentData = results[0];
            const departmentName = studentData.department_name;
            const aboName = studentData.abo_name;
            const iboName = studentData.ibo_name;

            const canSearch = unrestrictedOrganizations.includes(organization) ||
                departmentName === organization ||
                aboName === organization ||
                iboName === organization;

            if (canSearch) {
                req.session.departmentName = departmentName;
                req.session.aboName = aboName;
                req.session.iboName = iboName;
                res.status(200).json({ studentFound: true, studentData });
            } else {
                res.status(403).json({ error: 'Organization mismatch' });
            }
        } else {
            res.status(404).json({ studentFound: false });
        }
    });
});

// search students for add-student-ibo
router.get('/search-students', (req, res) => {
    const searchQuery = req.query.q;
    console.log('Search query:', searchQuery);

    if (!searchQuery) return res.json([]);

    const query = `
        SELECT id_number, first_name, last_name
        FROM student
        WHERE (id_number LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
        AND (ibo_name IS NULL OR ibo_name = '')`;

    db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Server Error:', err);
            return res.status(500).json({ message: 'Server Error' });
        }
        console.log('Results:', results.length ? results : 'No results found');
        res.json(results);
    });
});

router.post('/store-student-data', (req, res) => {
    const { id_number, department_name, abo_name, ibo_name } = req.body;

    // Store data in session (or another preferred storage method)
    req.session.studentData = { id_number, department_name, abo_name, ibo_name };
    res.status(200).send({ message: 'Student data stored successfully' });
});


router.post('/update-student-profile', (req, res) => {
    const { id_number, first_name, last_name, new_id_number, active_status, exemption_status, department_name, course_name, abo_name, ibo_name, year_level } = req.body;

    // Step 1: Check if the student exists (using the original id_number)
    const checkStudentQuery = `
        SELECT COUNT(*) AS count 
        FROM student 
        WHERE id_number = ?;
    `;

    db.query(checkStudentQuery, [id_number], (err, result) => {
        if (err) {
            console.error("Error checking if student exists:", err);
            return res.status(500).json({ success: false, message: "Error checking student existence" });
        }

        if (result[0].count === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Step 2: Proceed with the update if student exists
        const updateQuery = `
            UPDATE student
            SET first_name = ?, last_name = ?, id_number = ?, active_status = ?, exemption_status = ?, department_name = ?, course_name = ?, abo_name = ?, ibo_name = ?, year_level = ?
            WHERE id_number = ?;
        `;


        db.query(updateQuery, [first_name, last_name, new_id_number, active_status, exemption_status, department_name, course_name, abo_name, ibo_name, year_level, id_number], (err, result) => {
            if (err) {
                console.error("Error updating student profile:", err);
                return res.status(500).json({ success: false, message: "Error updating student profile" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "No changes made or student not found" });
            }

            // Step 3: Update foreign key references in the participation_record table
            const updateParticipationRecordQuery = `
                UPDATE participation_record 
                SET id_number = ?
                WHERE id_number = ?
            `;
            db.query(updateParticipationRecordQuery, [new_id_number, id_number], (err, result) => {
                if (err) {
                    console.error("Error updating foreign key references in participation_record:", err);
                    return res.status(500).json({ success: false, message: "Error updating participation records" });
                }

                // Step 4: Update foreign key references in the attendance_record table
                const updateAttendanceRecordQuery = `
                    UPDATE attendance_record
                    SET id_number = ?
                    WHERE id_number = ?
                `;
                db.query(updateAttendanceRecordQuery, [new_id_number, id_number], (err, result) => {
                    if (err) {
                        console.error("Error updating foreign key references in attendance_record:", err);
                        return res.status(500).json({ success: false, message: "Error updating attendance records" });
                    }

                    res.json({ success: true, message: "Student profile updated successfully" });
                });
            });
        });
    });
});


router.get('/search-landing', (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(400).json({ studentFound: false, message: 'Search query is required' });
    }

    const query = `
        SELECT * FROM student 
        WHERE id_number LIKE ? 
        OR first_name LIKE ? 
        OR last_name LIKE ?
    `;

    const likeSearch = `%${searchQuery}%`;

    db.query(query, [likeSearch, likeSearch, likeSearch], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ studentFound: false });
        }

        res.status(200).json({ studentFound: results.length > 0, results });
    });
});



module.exports = router;
