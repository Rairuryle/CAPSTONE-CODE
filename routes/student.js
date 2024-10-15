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
                    res.redirect('/add-student-successful');
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



module.exports = router;
