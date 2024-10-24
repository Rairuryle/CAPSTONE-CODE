const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const exphbs = require('express-handlebars');
const { getUrlFlags, isLeadingOrgs, isMainOrgs, isExtraOrgs, otherCombinations } = require('./utils');

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}));

app.set('view engine', 'hbs');

router.get('/', (req, res) => {
    res.render('landing-page', {
        title: 'Landing Page | LSU HEU Events and Attendance Tracking Website'
    });
});

router.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help and Resources | LSU HEU Events and Attendance Tracking Website'
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us | LSU HEU Events and Attendance Tracking Website'
    });
});

router.get('/login', (req, res) => {
    const isLoggedOut = req.query.isLoggedOut === 'true';
    const message = req.query.message || null;

    res.render('login', {
        title: 'Login | LSU HEU Events and Attendance Tracking Website',
        isLoggedOut: isLoggedOut,
        message: message
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login?isLoggedOut=true&message=You have logged out');
    });
});


router.get('/register', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const departmentName = req.session.departmentName;

        const CAS_ABO = ["JSWAP", "LABELS", "LSUPS", "POLISAYS"];
        const CBA_ABO = ["JFINEX", "JMEX", "JPIA"];
        const CCSEA_ABO = ["ALGES", "ICpEP", "IIEE", "JIECEP", "LISSA", "PICE", "SOURCE", "UAPSA"];
        const CTE_ABO = ["ECC", "GENTLE", "GEM-O", "LapitBayan", "LME", "SPEM", "SSS"];
        const CTHM_ABO = ["FHARO", "FTL", "SOTE"];

        const CAS_College = ["CAS"];
        const CBA_College = ["CBA"];
        const CCJE_College = ["CCJE"];
        const CCSEA_College = ["CCSEA"];
        const CON_College = ["CON"];
        const CTE_College = ["CTE"];
        const CTHM_College = ["CTHM"];

        const {
            isSAO,
            isCollegeDepartment,
            isUSGorSAO,
            isCollegeOrSAO,
        } = isMainOrgs(organization, departmentName);

        const {
            isCSOorSAO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        const isCAS = CAS_ABO.includes(organization) || isCSOorSAO;
        const isCBA = CBA_ABO.includes(organization) || isCSOorSAO;
        const isCCSEA = CCSEA_ABO.includes(organization) || isCSOorSAO;
        const isCTE = CTE_ABO.includes(organization) || isCSOorSAO;
        const isCTHM = CTHM_ABO.includes(organization) || isCSOorSAO;

        const isCASCollege = CAS_College.includes(organization) || isSAO;
        const isCBACollege = CBA_College.includes(organization) || isSAO;
        const isCCJECollege = CCJE_College.includes(organization) || isSAO;
        const isCCSEACollege = CCSEA_College.includes(organization) || isSAO;
        const isCONCollege = CON_College.includes(organization) || isSAO;
        const isCTECollege = CTE_College.includes(organization) || isSAO;
        const isCTHMCollege = CTHM_College.includes(organization) || isSAO;

        const isCollegeOrSAORegister = isCASCollege || isCBACollege || isCCJECollege || isCCSEACollege || isCONCollege || isCTECollege || isCTHMCollege || isSAO;

        res.render('register', {
            adminData,
            organization,
            departmentName,
            isSAO,
            isCollegeDepartment,
            isUSGorSAO,
            isCollegeOrSAO,
            isCSOorSAO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue,
            organization,
            isCAS,
            isCBA,
            isCCSEA,
            isCTE,
            isCTHM,
            isCollegeOrSAORegister,
            title: 'Register | LSU HEU Events and Attendance Tracking Website'
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/register-successful', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;

        res.render('register-successful', {
            adminData,
            title: 'Register | LSU HEU Events and Attendance Tracking Website'
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/dashboard', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const studentData = req.session.studentData;
        const organization = adminData.organization;
        const { isUSGorSAO } = isMainOrgs(organization);
        const { isCSOorIBO, isExtraOrgsTrue } = isExtraOrgs(organization);

        res.render('dashboard', {
            adminData,
            studentData,
            isUSGorSAO,
            isCSOorIBO,
            isExtraOrgsTrue,
            currentPath: '/dashboard',
            title: 'Dashboard | LSU HEU Events and Attendance Tracking Website'
        });
    } else {
        res.redirect('/login'); // Redirect if the user is not authenticated
    }
});

router.get('/add-student', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const { isUSG } = isMainOrgs(organization);
        const { isExtraOrgsTrue } = isExtraOrgs(organization);

        let errorMessage = '';

        if (req.session.errorMessage) {
            errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
        }

        res.render('add-student', {
            adminData,
            organization,
            isUSG,
            isExtraOrgsTrue,
            currentPath: '/add-student',
            title: 'Add Student Account | LSU HEU Events and Attendance Tracking Website',
            errorMessage: errorMessage
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/add-student-successful', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const { isExtraOrgsTrue } = isExtraOrgs(organization);
        const addedStudentID = req.query.addedStudentID;

        res.render('add-student-successful', {
            adminData,
            organization,
            isExtraOrgsTrue,
            addedStudentID,
            currentPath: '/add-student-successful',
            title: 'Add Student Account | LSU HEU Events and Attendance Tracking Website'
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/add-student-ibo', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const { isUSG } = isMainOrgs(organization);
        const { isCSOorIBO, isExtraOrgsTrue } = isExtraOrgs(organization);

        let errorMessage = '';

        if (req.session.errorMessage) {
            errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
        }

        res.render('add-student-ibo', {
            adminData,
            organization,
            isUSG,
            isCSOorIBO,
            isExtraOrgsTrue,
            currentPath: '/add-student-ibo',
            title: 'Add Student Account | LSU HEU Events and Attendance Tracking Website',
            errorMessage: errorMessage
        });
    } else {
        res.redirect('/login');
    }
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

router.get('/list', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const departmentName = req.session.departmentName;
        console.log('Department Name:', departmentName);

        // Use selected group if available, otherwise default to the admin's organization.
        const selectedGroup = req.query.groupList || organization;

        const isUSGorCSOorSAO = isLeadingOrgs(organization);

        const {
            isSAO,
            isCollegeDepartment,
            isUSGorSAO,
            isCollegeOrSAO,
        } = isMainOrgs(organization, departmentName);

        const {
            isCSO,
            isABOorIBO,
            isCSOorSAO,
            isCSOorIBO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        db.query('SELECT * FROM student', (error, students) => {
            if (error) {
                console.log(error);
                res.redirect('/');
            } else {
                // Filter students based on the selected group (either college, ABO, or IBO).
                const filterStudents = (students, group) => {
                    return students.filter(student =>
                        student.department_name === group ||
                        student.abo_name === group ||
                        student.ibo_name === group
                    );
                };

                const selectedStudents = filterStudents(students, selectedGroup);

                res.render('list', {
                    adminData,
                    organization,
                    departmentName,
                    isUSGorCSOorSAO,
                    isSAO,
                    isCollegeDepartment,
                    isUSGorSAO,
                    isCollegeOrSAO,
                    isCSO,
                    isABOorIBO,
                    isCSOorSAO,
                    isCSOorIBO,
                    isCSOorABOorSAO,
                    isCSOorIBOorSAO,
                    isExtraOrgsTrue,
                    organization,
                    selectedGroup,  // Pass the selected group for highlighting in the view.
                    selectedStudents,  // Pass the filtered students to the template.
                    currentPath: '/list',
                    title: 'List of Students | LSU HEU Events and Attendance Tracking Website',
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Helper function to fetch events (you can place this outside of both routes)
const fetchEvents = (callback) => {
    const eventQuery = 'SELECT * FROM event ORDER BY event_date_start DESC';
    db.query(eventQuery, (err, eventResults) => {
        if (err) {
            console.error('Error fetching events:', err);
            return callback([]); // Return an empty array in case of error
        }
        callback(eventResults);
    });
};

const filterEvents = (events, departmentName, aboName, iboName, selectedScope) => {
    const institutionalEvents = events.filter(event => event.event_scope === 'INSTITUTIONAL');
    const collegeEvents = events.filter(event => event.event_scope === departmentName);
    const aboEvents = events.filter(event => event.event_scope === aboName);
    const iboEvents = events.filter(event => event.event_scope === iboName);

    // Determine which events to return based on selectedScope
    let filteredEvents;
    if (selectedScope === 'INSTITUTIONAL') {
        filteredEvents = institutionalEvents;
    } else if (selectedScope === departmentName) {
        filteredEvents = collegeEvents;
    } else if (selectedScope === aboName) {
        filteredEvents = aboEvents;
    } else if (selectedScope === iboName) {
        filteredEvents = iboEvents;
    } else {
        // Default to show all events if no scope selected
        filteredEvents = events;
    }

    return {
        institutionalEvents,
        collegeEvents,
        aboEvents,
        iboEvents,
        filteredEvents // Include the filtered events for use in the view
    };
};



// Route for spr-main
router.get('/spr-main', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const departmentName = req.session.departmentName;
        const aboName = req.session.aboName;
        const iboName = req.session.iboName;
        console.log('Department Name:', departmentName);
        console.log('ABO:', aboName);
        console.log('IBO:', iboName);

        const isUSGorCSOorSAO = isLeadingOrgs(organization);

        const {
            isUSG,
            isSAO,
            isCollegeDepartment,
            isUSGorSAO,
            isCollegeOrSAO,
            isUSGorCollegeOrSAO,
            isMainOrgsTrue
        } = isMainOrgs(organization, departmentName);

        const {
            isCSO,
            isABOorIBO,
            isCSOorSAO,
            isCSOorIBO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        const idNumber = req.query.id;
        console.log('ID Number:', idNumber);

        const selectedScope = req.query.scope || '';


        const renderMainPage = (student, events) => {
            console.log('Selected Scope:', selectedScope);

            const { filteredEvents } = filterEvents(events, departmentName, aboName, iboName, selectedScope);

            res.render('spr-main', {
                adminData,
                organization,
                departmentName,
                isUSGorCSOorSAO,
                isCollegeOrCSOorSAO: otherCombinations(organization),
                isUSG,
                isSAO,
                isCollegeDepartment,
                isUSGorSAO,
                isCollegeOrSAO,
                isUSGorCollegeOrSAO,
                isMainOrgsTrue,
                isCSO,
                isABOorIBO,
                isCSOorSAO,
                isCSOorIBO,
                isCSOorABOorSAO,
                isCSOorIBOorSAO,
                isExtraOrgsTrue,
                student,
                filteredEvents, // Pass the filtered events to the template
                currentPath: '/spr-main',
                title: 'Student Participation Record Main Page | LSU HEU Events and Attendance Tracking Website'
            });
        };

        if (idNumber) {
            const query = 'SELECT * FROM student WHERE id_number = ?';
            db.query(query, [idNumber], (err, results) => {
                if (err) {
                    return res.status(500).send('Database error');
                }

                const student = results.length > 0 ? results[0] : null;

                // Fetch events and then render the page
                fetchEvents((events) => {
                    renderMainPage(student, events);
                });
            });
        } else {
            // If no ID number, fetch events and render the page without student data
            fetchEvents((events) => {
                renderMainPage(null, events);
            });
        }
    } else {
        res.redirect('/login');
    }
});

// Route for spr-edit
router.get('/spr-edit', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const departmentName = req.session.departmentName;
        const aboName = req.session.aboName;
        const iboName = req.session.iboName;

        console.log('Department Name', departmentName);
        console.log('ABO:', aboName);
        console.log('IBO:', iboName);

        const {
            isUSG,
            isSAO,
            isCollegeDepartment,
            isUSGorSAO,
            isCollegeOrSAO,
            isUSGorCollegeOrSAO,
            isMainOrgsTrue
        } = isMainOrgs(organization, departmentName);

        const {
            isCSO,
            isCSOorSAO,
            isCSOorIBO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        const CAS_ABO = ["JSWAP", "LABELS", "LSUPS", "POLISAYS"];
        const CBA_ABO = ["JFINEX", "JMEX", "JPIA"];
        const CCSEA_ABO = ["ALGES", "ICpEP", "IIEE", "JIECEP", "LISSA", "PICE", "SOURCE", "UAPSA"];
        const CTE_ABO = ["ECC", "GENTLE", "GEM-O", "LapitBayan", "LME", "SPEM", "SSS"];
        const CTHM_ABO = ["FHARO", "FTL", "SOTE"];

        const isCAS = CAS_ABO.includes(organization) || isCSOorSAO;
        const isCBA = CBA_ABO.includes(organization) || isCSOorSAO;
        const isCCSEA = CCSEA_ABO.includes(organization) || isCSOorSAO;
        const isCTE = CTE_ABO.includes(organization) || isCSOorSAO;
        const isCTHM = CTHM_ABO.includes(organization) || isCSOorSAO;

        const idNumber = req.query.id;
        console.log('ID Number:', idNumber);

        const renderEditPage = (student, events) => {
            const selectedScope = req.query.scope || ''; // Get the selected event scope from the query parameter
            console.log('Selected Scope:', selectedScope);
            const { filteredEvents } = filterEvents(events, departmentName, aboName, iboName, selectedScope);

            res.render('spr-edit', {
                adminData,
                organization,
                departmentName,
                isUSGorCSOorSAO: isLeadingOrgs(organization),
                isCollegeOrCSOorSAO: otherCombinations(organization),
                isUSG,
                isSAO,
                isCollegeDepartment,
                isUSGorSAO,
                isCollegeOrSAO,
                isUSGorCollegeOrSAO,
                isMainOrgsTrue,
                isCSO,
                isCSOorSAO,
                isCSOorIBO,
                isCSOorABOorSAO,
                isCSOorIBOorSAO,
                isExtraOrgsTrue,
                isCAS,
                isCBA,
                isCCSEA,
                isCTE,
                isCTHM,
                student,
                filteredEvents, // Pass the filtered events to the template
                currentPath: '/spr-edit',
                title: 'Student Participation Record Edit Mode | LSU HEU Events and Attendance Tracking Website'
            });
        };

        if (idNumber) {
            const query = 'SELECT * FROM student WHERE id_number = ?';
            db.query(query, [idNumber], (err, results) => {
                if (err) {
                    return res.status(500).send('Database error');
                }

                const student = results.length > 0 ? results[0] : null;

                // Fetch events and then render the page
                fetchEvents((events) => {
                    renderEditPage(student, events);
                });
            });
        } else {
            // If no ID number, fetch events and render the page without student data
            fetchEvents((events) => {
                renderEditPage(null, events);
            });
        }
    } else {
        res.redirect('/login');
    }
});


// router.get('/university-events-admin', (req, res) => {
//     if (req.session.isAuthenticated) {
//         const idNumber = req.query.id_number;
//         const adminData = req.session.adminData;
//         const organization = adminData.organization;
//         const departmentName = req.session.departmentName;
//         const aboName = req.session.aboName;
//         const iboName = req.session.iboName;
//         const eventData = req.session.eventData;

//         const {
//             isUSG,
//             isSAO,
//             isCollege,
//             isUSGorSAO,
//             isCollegeOrSAO,
//             isMainOrgsTrue
//         } = isMainOrgs(organization, departmentName);

//         const {
//             ABO,
//             IBO,
//             isCSO,
//             isABO,
//             isIBO,
//             isABOorIBO,
//             isCSOorABO,
//             isCSOorIBO,
//             isCSOorSAO,
//             isABOorSAO,
//             isIBOorSAO,
//             isCSOorABOorSAO,
//             isCSOorIBOorSAO,
//             isExtraOrgsTrue
//         } = isExtraOrgs(organization);

//         const {
//             isAdminURL,
//             isStudentURL,
//             isEditURL,
//             isRecordPage,
//             isAdminPageURL
//         } = getUrlFlags(req.url);

//         db.query('SELECT * FROM event', (error, events) => {
//             if (error) {
//                 console.log(error);
//                 res.redirect('/dashboard');
//             } else {
//                 const institutionalEvents = events.filter(event => event.event_scope === 'INSTITUTIONAL');
//                 const collegeEvents = events.filter(event => event.event_scope === departmentName);
//                 const aboEvents = events.filter(event => event.event_scope === aboName);
//                 const iboEvents = events.filter(event => event.event_scope === iboName);

//                 db.query('SELECT * FROM student WHERE id_number = ?', [idNumber], (error, results) => {
//                     if (error) {
//                         console.log(error);
//                         res.redirect('/dashboard');
//                     } else {
//                         if (results.length > 0) {
//                             const studentData = results[0];
//                             res.render('university-events-admin', {
//                                 adminData,
//                                 studentData,
//                                 departmentName,
//                                 isUSG,
//                                 isSAO,
//                                 isCollege,
//                                 isUSGorSAO,
//                                 isCollegeOrSAO,
//                                 isMainOrgsTrue,
//                                 ABO,
//                                 IBO,
//                                 isCSO,
//                                 isABO,
//                                 isIBO,
//                                 isABOorIBO,
//                                 isCSOorABO,
//                                 isCSOorIBO,
//                                 isCSOorSAO,
//                                 isABOorSAO,
//                                 isIBOorSAO,
//                                 isCSOorABOorSAO,
//                                 isCSOorIBOorSAO,
//                                 isExtraOrgsTrue,
//                                 isAdminURL,
//                                 isEditURL,
//                                 isAdminPageURL,
//                                 isStudentURL,
//                                 isRecordPage,
//                                 eventData,
//                                 institutionalEvents,
//                                 collegeEvents,
//                                 aboEvents,
//                                 iboEvents,
//                                 idNumber: idNumber,
//                                 events: events.map(event => ({
//                                     ...event,
//                                     formattedStartDate: event.event_date_start.toLocaleDateString(),
//                                     formattedEndDate: event.event_date_end.toLocaleDateString(),
//                                 })),
//                                 title: 'Admin Main Page | LSU Events and Attendance Tracking Website',
//                             });
//                         } else {
//                             res.redirect('/dashboard');
//                         }
//                     }
//                 });
//             }
//         });
//     } else {
//         res.redirect('/login');
//     }
// });

// router.get('/university-events-edit', (req, res) => {
//     if (req.session.isAuthenticated) {
//         const idNumber = req.query.id_number;
//         const adminData = req.session.adminData;
//         const organization = adminData.organization;
//         const departmentName = req.session.departmentName;
//         const aboName = req.session.aboName;
//         const iboName = req.session.iboName;
//         const eventData = req.session.eventData;

//         const {
//             isUSG,
//             isSAO,
//             isCollege,
//             isUSGorCollege,
//             isUSGorSAO,
//             isCollegeOrSAO,
//             isMainOrgsTrue
//         } = isMainOrgs(organization, departmentName);

//         const {
//             ABO,
//             IBO,
//             isCSO,
//             isABO,
//             isIBO,
//             isABOorIBO,
//             isCSOorABO,
//             isCSOorIBO,
//             isCSOorSAO,
//             isABOorSAO,
//             isIBOorSAO,
//             isCSOorABOorSAO,
//             isCSOorIBOorSAO,
//             isExtraOrgsTrue
//         } = isExtraOrgs(organization);

//         const {
//             isAdminURL,
//             isStudentURL,
//             isEditURL,
//             isRecordPage,
//             isAdminPageURL
//         } = getUrlFlags(req.url);

//         db.query('SELECT * FROM event', (error, events) => {
//             if (error) {
//                 console.log(error);
//                 res.redirect('/dashboard');
//             } else {
//                 const institutionalEvents = events.filter(event => event.event_scope === 'INSTITUTIONAL');
//                 const collegeEvents = events.filter(event => event.event_scope === departmentName);
//                 const aboEvents = events.filter(event => event.event_scope === aboName);
//                 const iboEvents = events.filter(event => event.event_scope === iboName);

//                 db.query('SELECT * FROM student WHERE id_number = ?', [idNumber], (error, results) => {
//                     if (error) {
//                         console.log(error);
//                         res.redirect('/dashboard');
//                     } else {
//                         if (results.length > 0) {
//                             const studentData = results[0];
//                             res.render('university-events-edit', {
//                                 adminData,
//                                 studentData,
//                                 departmentName,
//                                 isUSG,
//                                 isSAO,
//                                 isCollege,
//                                 isUSGorCollege,
//                                 isUSGorSAO,
//                                 isCollegeOrSAO,
//                                 isMainOrgsTrue,
//                                 ABO,
//                                 IBO,
//                                 isCSO,
//                                 isABO,
//                                 isIBO,
//                                 isABOorIBO,
//                                 isCSOorABO,
//                                 isCSOorIBO,
//                                 isCSOorSAO,
//                                 isABOorSAO,
//                                 isIBOorSAO,
//                                 isCSOorABOorSAO,
//                                 isCSOorIBOorSAO,
//                                 isExtraOrgsTrue,
//                                 isAdminURL,
//                                 isEditURL,
//                                 isAdminPageURL,
//                                 isStudentURL,
//                                 isRecordPage,
//                                 eventData,
//                                 institutionalEvents,
//                                 collegeEvents,
//                                 aboEvents,
//                                 iboEvents,
//                                 events: events.map(event => ({
//                                     ...event,
//                                     formattedStartDate: event.event_date_start.toLocaleDateString(),
//                                     formattedEndDate: event.event_date_end.toLocaleDateString(),
//                                 })),
//                                 title: 'Admin Edit Page | LSU Events and Attendance Tracking Website',
//                             });
//                         } else {
//                             res.redirect('/dashboard');
//                         }
//                     }
//                 });
//             }
//         });
//     } else {
//         res.redirect('/login');
//     }
// });

// router.get('/college-events', (req, res) => {
//     if (req.session.isAuthenticated) {
//         const departmentName = req.session.departmentName;

//         db.query('SELECT * FROM event WHERE event_scope = ?', [departmentName], (error, events) => {
//             if (error) {
//                 console.log(error);
//                 res.status(500).json({ error: 'Error fetching college events' });
//             } else {
//                 res.status(200).json({ collegeEvents: events });
//             }
//         });
//     } else {
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });


module.exports = router;