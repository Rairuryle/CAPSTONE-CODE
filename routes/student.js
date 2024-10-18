const express = require('express');
const mysql = require("mysql");
const { isMainOrgs, isExtraOrgs } = require('../routes/utils');
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
        res.json(results); // Only send results, not the entire query object
    });
});

router.post('/add-students-to-ibo', (req, res) => {
    console.log('Incoming request body:', req.body); // Log the request body
    const { students, ibo_name } = req.body;

    // Log received data
    console.log('Students:', students);
    console.log('IBO Name:', ibo_name);

    // Validate students array
    if (!students || !Array.isArray(students) || !students.length) {
        return res.status(400).json({ success: false, message: 'Students array is missing or empty' });
    }

    if (!ibo_name) {
        return res.status(400).json({ success: false, message: 'IBO name is missing' });
    }

    // Build a SQL query to update ibo_name for selected students
    const placeholders = students.map(() => '?').join(',');
    const query = `UPDATE student SET ibo_name = ? WHERE id_number IN (${placeholders})`;

    // Prepare the parameters for the query
    const parameters = [ibo_name, ...students];

    // Log SQL query and parameters
    console.log('SQL Query:', query);
    console.log('Parameters:', parameters);

    // Execute the query
    db.query(query, parameters, (error, results) => {
        if (error) {
            console.error('Error updating students:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Successfully updated
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

module.exports = router;
