const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const { isMainOrgs, isExtraOrgs } = require('../utils/utilsOrg');
const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

function getFlags(organization) {
    const { isSAO, isUSGorSAO, isCollegeOrSAO } = isMainOrgs(organization);
    const { isCSOorSAO, isCSOorABOorSAO, isCSOorIBOorSAO, isExtraOrgsTrue } = isExtraOrgs(organization);

    return {
        isSAO,
        isUSGorSAO,
        isCollegeOrSAO,
        isCSOorSAO,
        isCSOorABOorSAO,
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

exports.register = (req, res) => {
    console.log(req.body);

    const { lastNameRegister, firstNameRegister, organizationRegister, username, password, passwordConfirm } = req.body;
    const organization = req.session.adminData.organization;

    const flags = getFlags(organization);
    console.log("Flags:", flags);

    db.query('SELECT username FROM admin WHERE username = ?', [username],
        async (error, results) => {
            if (error) {
                console.log(error);
                return res.render('register', {
                    message: 'An unexpected error occurred. Please try again.',
                    organization,
                    ...flags
                });
            }

            if (results.length > 0) {
                return res.render('register', {
                    message: 'That username is already in use',
                    organization,
                    ...flags
                });
            } else if (password !== passwordConfirm) {
                return res.render('register', {
                    message: 'Passwords do not match',
                    organization,
                    ...flags
                });
            } else if (password.length < 6) {
                return res.render('register', {
                    message: 'Password should be at least 6 characters long',
                    organization,
                    ...flags
                });
            } else if (!organizationRegister || organizationRegister.length === 0) {
                return res.render('register', {
                    message: 'Select an Organization',
                    organization,
                    ...flags
                });
            }

            const hashedPassword = await bcrypt.hash(password, 8);
            console.log("Hashed Password (Registration):", hashedPassword);

            db.query('INSERT INTO admin SET?', {
                last_name: lastNameRegister,
                first_name: firstNameRegister,
                organization: organizationRegister,
                username: username,
                password: hashedPassword
            }, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.render('register', {
                        message: 'An unexpected error occurred. Please try again.',
                        organization,
                        ...flags
                    });
                } else {
                    console.log(results);
                    return res.redirect('/register-successful');
                }
            });
        });
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('login', {
                message: 'Please provide both username and password'
            });
        }

        db.query('SELECT * FROM admin WHERE username = ?', [username], async (error, results) => {
            if (error) {
                console.log(error);
                return res.render('login', {
                    message: 'An error occurred while fetching data. Please try again.'
                });
            }

            if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.render('login', {
                    message: 'Username or password is incorrect'
                });
            } else {
                // If the username and password are correct, create a JWT token for authentication
                const user = results[0];
                console.log("User data from the database:", user);
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log('Token is: ' + token);

                // Store the token in a cookie
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                };
                res.cookie('jwt', token, cookieOptions);

                // Store user data in the session
                req.session.isAuthenticated = true;

                req.session.adminData = {
                    admin_id: user.admin_id,
                    last_name: user.last_name,
                    first_name: user.first_name,
                    organization: user.organization,
                    username: user.username
                };

                console.log("User logged in:", user.username);
                console.log("User organization:", user.organization);
                console.log("User admin ID:", user.admin_id);

                res.redirect('/dashboard');
            }
        });
    } catch (error) {
        console.error(error);
    }
};