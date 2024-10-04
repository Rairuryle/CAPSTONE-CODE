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

// exports.register = (req, res) => {
//     const { lastNameRegister, firstameRegister, organizationRegister, username, password, passwordConfirm } = req.body;
//     const organization = req.session.adminData.organization;

//     const flags = getFlags(organization);
//     console.log("Flags:", flags);

//     if (password.length < 6) {
//         return res.render('register', {
//             message: 'Password should be at least 6 characters long',
//             organization,
//             ...flags
//         });
//     }

//     db.query('SELECT username FROM admin WHERE username = ?', [username], async (error, results) => {
//         if (error) {
//             console.log(error);
//             return res.render('register', {
//                 message: 'An error occurred',
//                 organization,
//                 ...flags
//             });
//         }

//         if (results.length > 0) {
//             return res.render('register', {
//                 message: 'That username is already in use',
//                 organization,
//                 ...flags
//             });
//         } else if (password !== passwordConfirm) {
//             return res.render('register', {
//                 message: 'Passwords do not match',
//                 organization,
//                 ...flags
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 8);
//         console.log("Hashed Password (Registration):", hashedPassword);

//         db.query('INSERT INTO admin SET?', {
//             last_name: lastNameRegister,
//             first_name: firstameRegister,
//             organization: organizationRegister,
//             username: username,
//             password: hashedPassword
//         }, (error, results) => {
//             if (error) {
//                 console.log(error);
//                 return res.render('register', {
//                     message: 'An error occurred',
//                     organization,
//                     ...flags
//                 });
//             } else {
//                 console.log(results);
//                 res.redirect('/login');
//             }
//         });
//     });
// };

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
