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

module.exports = router;
