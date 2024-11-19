const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const exphbs = require('express-handlebars');
const { isLeadingOrgs, isMainOrgs, isExtraOrgs, otherCombinations } = require('../utils/utilsOrg');
const { fetchEvents, filterEvents, formatDate, fetchSemestralPoints, fetchYearlyPoints } = require('../utils/utilsSPR');

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
        currentPath: '/',
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
        const { isIBO, isCSOorIBO, isCSOorABOorSAO, isExtraOrgsTrue } = isExtraOrgs(organization);


        res.render('dashboard', {
            adminData,
            studentData,
            isUSGorSAO,
            isIBO,
            isCSOorIBO,
            isCSOorABOorSAO,
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
        const { isIBO, isExtraOrgsTrue } = isExtraOrgs(organization);

        let errorMessage = '';

        if (req.session.errorMessage) {
            errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
        }

        res.render('add-student', {
            adminData,
            organization,
            isUSG,
            isIBO,
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
        const { isIBO, isExtraOrgsTrue } = isExtraOrgs(organization);
        const addedStudentID = req.query.addedStudentID;

        res.render('add-student-successful', {
            adminData,
            organization,
            isIBO,
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
        const { isIBO, isCSOorIBO, isExtraOrgsTrue } = isExtraOrgs(organization);

        let errorMessage = '';

        if (req.session.errorMessage) {
            errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
        }

        res.render('add-student-ibo', {
            adminData,
            organization,
            isUSG,
            isIBO,
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

router.get('/list', (req, res) => {
    if (req.session.isAuthenticated) {
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const departmentName = req.session.departmentName;

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
            isIBO,
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
                const noStudent = selectedStudents.length == 0;

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
                    isIBO,
                    isABOorIBO,
                    isCSOorSAO,
                    isCSOorIBO,
                    isCSOorABOorSAO,
                    isCSOorIBOorSAO,
                    isExtraOrgsTrue,
                    organization,
                    selectedGroup,  // Pass the selected group for highlighting in the view.
                    selectedStudents,  // Pass the filtered students to the template.
                    noStudent,
                    currentPath: '/list',
                    title: 'List of Students | LSU HEU Events and Attendance Tracking Website',
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Route for spr-main
router.get('/spr-main', (req, res) => {
    if (req.session.isAuthenticated) {
        console.log('Entered Main Page');

        const idNumber = req.query.id;
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const studentData = req.session.studentData || {};
        const departmentName = req.session.departmentName || studentData.department_name;
        const aboName = req.session.aboName || studentData.abo_name;
        const iboName = req.session.iboName || studentData.ibo_name;
        console.log('ID Number:', idNumber);
        console.log('Organization:', organization);
        console.log('Student Data:', studentData);
        console.log('Department Name:', departmentName);
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
            isIBO,
            isABOorIBO,
            isCSOorSAO,
            isCSOorIBO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        const selectedScope = req.query.event_scope || (isUSG ? 'INSTITUTIONAL' : organization) || '';
        let selectedYear = req.query.academic_year || "Select Year";
        if (selectedYear.length === 4) {
            const startYear = selectedYear;
            const endYear = parseInt(startYear) + 1;
            selectedYear = `${startYear}-${endYear}`;
        }
        const selectedSemester = req.query.semester || "Select Sem";
        const selectedEventDay = req.query.event_day;

        const eventId = req.query.event_id;
        const eventDays = req.query.event_days || null;
        const eventName = req.query.event_name;
        const eventDateStart = req.query.event_start_date;
        const eventDateEnd = req.query.event_end_date;

        const departments = ['CAS', 'CBA', 'CCJE', 'CCSEA', 'CON', 'CTE', 'CTHM'];
        const IBOs = ['Compatriots', 'Cosplay Corps', 'Green Leaders', 'Kainos', 'Meeples', 'Micromantics', 'Red Cross Youth', 'Soul Whisperers', 'Vanguard E-sports'];

        const fetchAcademicYears = (callback) => {
            db.query('SELECT academic_year FROM academic_year ORDER BY academic_year DESC', (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                // Format the academic years to "yyyy-yyyy" format
                const formattedYears = results.map(year => {
                    const startYear = year.academic_year;
                    const endYear = parseInt(startYear) + 1;
                    return { academic_year: `${startYear}-${endYear}` };
                });

                callback(null, formattedYears);
            });
        };

        const renderMainPage = (student, events, academicYears, eventDays, activities, attendance, totalParticipationPoints, totalAttendancePoints, semestralScore, yearlyScore, verificationStatusByDay) => {
            const { filteredEvents } = filterEvents(events, departmentName, aboName, iboName, selectedScope);
            const noEvents = !filteredEvents || filteredEvents.length === 0;
            const totalScore = totalParticipationPoints + totalAttendancePoints;

            res.render('spr-main', {
                adminData,
                organization,
                departmentName,
                aboName,
                iboName,
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
                isIBO,
                isABOorIBO,
                isCSOorSAO,
                isCSOorIBO,
                isCSOorABOorSAO,
                isCSOorIBOorSAO,
                isExtraOrgsTrue,
                student,
                filteredEvents,
                noEvents,
                academicYears,
                activities,
                attendance,
                selectedYear,
                selectedSemester,
                selectedScope,
                selectedEventDay,
                eventId,
                eventDays,
                eventName,
                eventDateStart,
                eventDateEnd,
                departments,
                IBOs,
                totalParticipationPoints,
                totalAttendancePoints,
                totalScore,
                semestralScore,
                yearlyScore,
                verificationStatusByDay,
                currentPath: '/spr-main',
                title: 'Student Participation Record Main Page | LSU HEU Events and Attendance Tracking Website'
            });
        };

        const studentQuery = 'SELECT * FROM student WHERE id_number = ?';
        db.query(studentQuery, [idNumber], (err, studentResults) => {
            if (err) return res.status(500).send('Database error while fetching student data');
            const student = studentResults.length > 0 ? studentResults[0] : null;

            fetchSemestralPoints(selectedYear, selectedSemester, selectedScope, idNumber, (semestralScore) => {
                fetchYearlyPoints(selectedYear, selectedScope, idNumber, (yearlyScore) => {
                    if (idNumber && selectedYear !== "Select Year" && selectedSemester !== "Select Sem") {
                        fetchEvents(selectedYear, selectedSemester, selectedScope, (events) => {
                            if (events && events.length > 0) {
                                if (eventId && eventDays) {
                                    const activitiesQuery = `
                                        SELECT a.*, 
                                            pr.role_name, 
                                            pr.admin_id, 
                                            ad.first_name AS officer_first_name,
                                            ad.last_name AS officer_last_name,
                                            CASE pr.role_name 
                                                WHEN 'INDIV. Participant' THEN 15
                                                WHEN 'TEAM Participant' THEN 20
                                                WHEN 'PROG. Spectator' THEN 10
                                                WHEN 'OTH. Spectator' THEN 5
                                                WHEN 'RED Stamp' THEN 5
                                                WHEN 'BLUE Stamp' THEN 10
                                                WHEN 'VIOLET Stamp' THEN 15
                                                ELSE 0
                                            END AS participation_record_points
                                        FROM activity a
                                        LEFT JOIN participation_record pr ON a.activity_id = pr.activity_id AND pr.id_number = ?
                                        LEFT JOIN admin ad ON pr.admin_id = ad.admin_id
                                        WHERE a.event_id = ?
                                        ORDER BY a.activity_date ASC, a.activity_name ASC;`

                                    db.query(activitiesQuery, [idNumber, eventId], (err, activityResults) => {
                                        if (err) return res.status(500).send('Database error while fetching activities');
                                        const totalParticipationPoints = activityResults.reduce((acc, activity) => acc + (activity.participation_record_points || 0), 0);

                                        const attendanceQuery = `
                                            SELECT a.attendance_id,
                                                a.attendance_day,
                                                a.attendance_date,
                                                COALESCE(ar.am_in, 0) AS am_in,
                                                COALESCE(ar.pm_in, 0) AS pm_in,
                                                COALESCE(ar.pm_out, 0) AS pm_out,
                                                ad.first_name AS officer_first_name,
                                                ad.last_name AS officer_last_name
                                            FROM attendance a
                                            LEFT JOIN attendance_record ar ON a.attendance_id = ar.attendance_id AND ar.id_number = ?
                                            LEFT JOIN admin ad ON ar.admin_id = ad.admin_id
                                            WHERE a.event_id = ?
                                            ORDER BY a.attendance_date ASC`;

                                        db.query(attendanceQuery, [idNumber, eventId], (err, attendanceResults) => {
                                            if (err) return res.status(500).send('Database error while fetching attendance');
                                            const totalAttendancePoints = attendanceResults.reduce((acc, att) => {
                                                return acc + (att.am_in ? 5 : 0) + (att.pm_in ? 5 : 0) + (att.pm_out ? 5 : 0);
                                            }, 0);
                                            const formattedAttendance = attendanceResults.map(att => ({
                                                ...att,
                                                attendance_date: formatDate(att.attendance_date)
                                            }));

                                            const verificationStatusQuery = `
                                                SELECT
                                                a.activity_day,
                                                    CASE 
                                                        WHEN COUNT(DISTINCT pr.role_name) >= e.to_verify THEN 'Verified'
                                                        ELSE 'Not Verified'
                                                    END AS verification_status
                                                FROM activity a
                                                LEFT JOIN participation_record pr ON a.activity_id = pr.activity_id AND pr.id_number = ?
                                                JOIN event e ON a.event_id = e.event_id
                                                WHERE a.event_id = ?
                                                GROUP BY a.activity_day;`

                                            db.query(verificationStatusQuery, [idNumber, eventId], (err, verificationResults) => {
                                                if (err) return res.status(500).send('Database error while fetching verification status');
                                                const verificationStatusByDay = {};
                                                verificationResults.forEach(row => {
                                                    verificationStatusByDay[row.activity_day] = row.verification_status;
                                                });

                                                fetchAcademicYears((err, academicYears) => {
                                                    if (err) return res.status(500).send('Database error while fetching academic years');
                                                    renderMainPage(student, events, academicYears, eventDays, activityResults, formattedAttendance, totalParticipationPoints, totalAttendancePoints, semestralScore, yearlyScore, verificationStatusByDay);
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    fetchAcademicYears((err, academicYears) => {
                                        if (err) return res.status(500).send('Database error while fetching academic years');
                                        renderMainPage(student, events, academicYears, [], [], [], 0, 0, semestralScore, yearlyScore, {});
                                    });
                                }
                            } else {
                                fetchAcademicYears((err, academicYears) => {
                                    if (err) return res.status(500).send('Database error while fetching academic years');
                                    renderMainPage(student, [], academicYears, [], [], [], 0, 0, semestralScore, yearlyScore, {});
                                });
                            }
                        });
                    } else {
                        fetchAcademicYears((err, academicYears) => {
                            if (err) return res.status(500).send('Database error while fetching academic years');
                            renderMainPage(student, [], academicYears, [], [], [], 0, 0, semestralScore, yearlyScore, {});
                        });
                    }
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});


// Route for spr-edit
router.get('/spr-edit', (req, res) => {
    if (req.session.isAuthenticated) {
        console.log('Entered Edit Mode');

        const idNumber = req.query.id;
        const adminData = req.session.adminData;
        const organization = adminData.organization;
        const studentData = req.session.studentData || {};
        const departmentName = req.session.departmentName || studentData.department_name;
        const aboName = req.session.aboName || studentData.abo_name;
        const iboName = req.session.iboName || studentData.ibo_name;

        console.log('ID Number (Edit):', idNumber);
        console.log('Department Name (Edit):', departmentName);
        console.log('ABO (Edit):', aboName);
        console.log('IBO (Edit):', iboName);

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
            isIBO,
            isCSOorSAO,
            isCSOorIBO,
            isCSOorABOorSAO,
            isCSOorIBOorSAO,
            isExtraOrgsTrue
        } = isExtraOrgs(organization);

        let selectedYear = req.query.academic_year || "Select Year";
        if (selectedYear.length === 4) {
            const startYear = selectedYear;
            const endYear = parseInt(startYear) + 1;
            selectedYear = `${startYear}-${endYear} `;
        }

        const selectedSemester = req.query.semester || "Select Sem";
        const selectedScope = isUSG ? 'INSTITUTIONAL' : organization;
        console.log('Selected Year (Edit):', selectedYear);
        console.log('Selected Semester (Edit):', selectedSemester);
        console.log('Selected Scope (Edit):', selectedScope);

        const eventId = req.query.event_id;
        const eventName = req.query.event_name;
        const eventDays = req.query.event_days || null;
        const eventDateStart = req.query.event_start_date;
        const eventDateEnd = req.query.event_end_date;
        console.log('Event ID (Edit):', eventId);
        console.log('Event Name (Edit):', eventName);
        console.log('Event Days (Edit):', eventDays);
        console.log('Event Start Date (Edit):', eventDateStart);
        console.log('Event End Date (Edit):', eventDateEnd);

        const departments = ['CAS', 'CBA', 'CCJE', 'CCSEA', 'CON', 'CTE', 'CTHM'];
        const IBOs = ['Compatriots', 'Cosplay Corps', 'Green Leaders', 'Kainos', 'Meeples', 'Micromantics', 'Red Cross Youth', 'Soul Whisperers', 'Vanguard E-sports'];


        const fetchAcademicYears = (callback) => {
            db.query('SELECT academic_year FROM academic_year ORDER BY academic_year DESC', (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                const formattedYears = results.map(year => {
                    const startYear = year.academic_year;
                    const endYear = parseInt(startYear) + 1;
                    return { academic_year: `${startYear}-${endYear} ` };
                });

                callback(null, formattedYears);
            });
        };

        const renderEditPage = (student, events, academicYears, eventDays, activities, attendance) => {
            const { filteredEvents } = filterEvents(events, departmentName, aboName, iboName, selectedScope);
            const noEvents = !filteredEvents || filteredEvents.length === 0;

            res.render('spr-edit', {
                adminData,
                organization,
                departmentName,
                aboName,
                iboName,
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
                isIBO,
                isCSOorSAO,
                isCSOorIBO,
                isCSOorABOorSAO,
                isCSOorIBOorSAO,
                isExtraOrgsTrue,
                student,
                filteredEvents,
                noEvents,
                academicYears,
                activities,
                attendance,
                selectedYear,
                selectedSemester,
                selectedScope,
                eventId,
                eventName,
                eventDays,
                eventDateStart,
                eventDateEnd,
                departments,
                IBOs,
                currentPath: '/spr-edit',
                title: 'Student Participation Record Edit Mode | LSU HEU Events and Attendance Tracking Website'
            });
        };

        // Fetch student data based on the ID number
        const studentQuery = 'SELECT * FROM student WHERE id_number = ?';
        db.query(studentQuery, [idNumber], (err, studentResults) => {
            if (err) {
                return res.status(500).send('Database error while fetching student data');
            }

            const student = studentResults.length > 0 ? studentResults[0] : null;

            // Check if all parameters are present before fetching events
            if (idNumber && selectedYear !== "Select Year" && selectedSemester !== "Select Sem") {
                fetchEvents(selectedYear, selectedSemester, selectedScope, (events) => {
                    if (events && events.length > 0) {
                        if (eventId && eventDays) {
                            const activitiesQuery = 'SELECT * FROM activity WHERE event_id = ? ORDER BY activity_date ASC, activity_name ASC';
                            db.query(activitiesQuery, [eventId], (err, activityResults) => {
                                if (err) {
                                    return res.status(500).send('Database error while fetching activities');
                                }

                                // Fetch attendance based on student ID and activity ID
                                const attendanceQuery = 'SELECT * FROM attendance WHERE event_id = ? ORDER BY attendance_date ASC';
                                db.query(attendanceQuery, [eventId], (err, attendanceResults) => {
                                    if (err) {
                                        return res.status(500).send('Database error while fetching attendance');
                                    }

                                    const formattedAttendance = attendanceResults.map(att => ({
                                        ...att,
                                        attendance_date: formatDate(att.attendance_date)
                                    }));

                                    fetchAcademicYears((err, academicYears) => {
                                        if (err) {
                                            return res.status(500).send('Database error while fetching academic years');
                                        }

                                        renderEditPage(student, events, academicYears, eventDays, activityResults, formattedAttendance);
                                    });
                                });
                            });

                        } else {
                            // Render the page without activities or attendance if eventDays is not selected
                            fetchAcademicYears((err, academicYears) => {
                                if (err) {
                                    return res.status(500).send('Database error while fetching academic years');
                                }
                                renderEditPage(student, events, academicYears, [], [], []); // No attendance data
                            });
                        }
                    } else {
                        // If no events, render the page indicating no events found
                        fetchAcademicYears((err, academicYears) => {
                            if (err) {
                                return res.status(500).send('Database error while fetching academic years');
                            }
                            renderEditPage(student, [], academicYears, [], [], []); // No events or attendance found
                        });
                    }
                });
            } else {
                // If parameters are missing, render the page without events or attendance
                fetchAcademicYears((err, academicYears) => {
                    if (err) {
                        return res.status(500).send('Database error while fetching academic years');
                    }
                    renderEditPage(student, [], academicYears, [], [], []); // No events or attendance found
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

// student side

router.get('/landing-page-student', (req, res) => {
    res.render('landing-page-student', {
        currentPath: '/landing-page-student',
        title: 'Landing Page | LSU HEU Events and Attendance Tracking Website'
    });
});

router.get('/landing-page-student-search', (req, res) => {
    res.render('landing-page-student-search', {
        currentPath: '/landing-page-student-search',
        title: 'Landing Page | LSU HEU Events and Attendance Tracking Website'
    });
});

router.get('/spr-student', (req, res) => {
    const id_number = req.query.id_number;
    const selectedScope = req.query.event_scope || '';
    let selectedYear = req.query.academic_year || "Select Year";
    if (selectedYear.length === 4) {
        const startYear = selectedYear;
        const endYear = parseInt(startYear) + 1;
        selectedYear = `${startYear}-${endYear}`;
    }

    const selectedSemester = req.query.semester || "Select Sem";
    const eventId = req.query.event_id;
    const eventName = req.query.event_name;
    const eventDays = req.query.event_days || null;
    const eventDateStart = req.query.event_start_date;
    const eventDateEnd = req.query.event_end_date;
    const selectedEventDay = req.query.event_day;

    console.log('ID Number:', id_number);
    console.log('Selected Scope:', selectedScope);
    console.log('Selected Year:', selectedYear);
    console.log('Selected Semester:', selectedSemester);
    console.log('Selected Event Day:', selectedEventDay);

    const fetchAcademicYears = (callback) => {
        db.query('SELECT academic_year FROM academic_year ORDER BY academic_year DESC', (err, results) => {
            if (err) {
                return callback(err, null);
            }

            const formattedYears = results.map(year => {
                const startYear = year.academic_year;
                const endYear = parseInt(startYear) + 1;
                return { academic_year: `${startYear}-${endYear} ` };
            });

            callback(null, formattedYears);
        });
    };

    const renderPage = (student, academicYears, events, activities, attendance, totalParticipationPoints, totalAttendancePoints, semestralScore, yearlyScore, verificationStatusByDay) => {
        const { filteredEvents } = filterEvents(events, student.department_name, student.abo_name, student.ibo_name, selectedScope);
        const noEvents = !filteredEvents || filteredEvents.length === 0;
        const totalScore = totalParticipationPoints + totalAttendancePoints;

        res.render('spr-student', {
            student,
            departmentName: student.department_name,
            aboName: student.abo_name,
            iboName: student.ibo_name,
            filteredEvents,
            noEvents,
            academicYears,
            activities,
            attendance,
            selectedYear,
            selectedSemester,
            selectedScope,
            eventId,
            eventName,
            eventDays,
            eventDateStart,
            eventDateEnd,
            totalParticipationPoints,
            totalAttendancePoints,
            totalScore,
            semestralScore,
            yearlyScore,
            selectedEventDay,
            verificationStatusByDay,
            currentPath: '/spr-student',
            title: 'Student Participation Record | LSU HEU Events and Attendance Tracking Website'
        });
    };

    const studentQuery = 'SELECT * FROM student WHERE id_number = ?';

    db.query(studentQuery, [id_number], (err, studentResults) => {
        if (err) {
            return res.status(500).send('Database error while fetching student data');
        }

        const student = studentResults.length > 0 ? studentResults[0] : null;

        if (!student) {
            return res.status(404).send('Student not found');
        }

        fetchAcademicYears((err, academicYears) => {
            if (err) {
                return res.status(500).send('Database error while fetching academic years');
            }

            fetchSemestralPoints(selectedYear, selectedSemester, selectedScope, id_number, (semestralScore) => {
                fetchYearlyPoints(selectedYear, selectedScope, id_number, (yearlyScore) => {
                    // Fetch events
                    if (id_number && selectedYear !== "Select Year" && selectedSemester !== "Select Sem") {
                        fetchEvents(selectedYear, selectedSemester, selectedScope, (events) => {

                            if (events && events.length > 0) {
                                if (eventId && eventDays) {
                                    const activitiesQuery = `
                                        SELECT a.*,
                                        pr.role_name,
                                        pr.admin_id,
                                        ad.first_name AS officer_first_name,
                                            ad.last_name AS officer_last_name,
                                                CASE pr.role_name 
                                                   WHEN 'INDIV. Participant' THEN 15
                                                   WHEN 'TEAM Participant' THEN 20
                                                   WHEN 'PROG. Spectator' THEN 10
                                                   WHEN 'OTH. Spectator' THEN 5
                                                   WHEN 'RED Stamp' THEN 5
                                                   WHEN 'BLUE Stamp' THEN 10
                                                   WHEN 'VIOLET Stamp' THEN 15
                                                   ELSE 0
                                               END AS participation_record_points
                                        FROM activity a
                                        LEFT JOIN participation_record pr ON a.activity_id = pr.activity_id AND pr.id_number = ?
                                        LEFT JOIN admin ad ON pr.admin_id = ad.admin_id
                                        WHERE a.event_id = ? 
                                        ORDER BY a.activity_date ASC, a.activity_name ASC;`


                                    db.query(activitiesQuery, [id_number, eventId], (err, activityResults) => {
                                        if (err) {
                                            return res.status(500).send('Database error while fetching activities');
                                        }

                                        const totalParticipationPoints = activityResults.reduce((acc, activity) => acc + (activity.participation_record_points || 0), 0);

                                        const attendanceQuery = `
                                            SELECT a.attendance_id,
                                                a.attendance_day,
                                                a.attendance_date,
                                                COALESCE(ar.am_in, 0) AS am_in,
                                                COALESCE(ar.pm_in, 0) AS pm_in,
                                                COALESCE(ar.pm_out, 0) AS pm_out,
                                                ad.first_name AS officer_first_name,
                                                ad.last_name AS officer_last_name
                                            FROM attendance a
                                            LEFT JOIN attendance_record ar ON a.attendance_id = ar.attendance_id AND ar.id_number = ?
                                            LEFT JOIN admin ad ON ar.admin_id = ad.admin_id
                                            WHERE a.event_id = ?
                                            ORDER BY a.attendance_date ASC`;

                                        db.query(attendanceQuery, [id_number, eventId], (err, attendanceResults) => {
                                            if (err) {
                                                return res.status(500).send('Database error while fetching attendance');
                                            }

                                            const totalAttendancePoints = attendanceResults.reduce((acc, att) => {
                                                return acc + (att.am_in ? 5 : 0) + (att.pm_in ? 5 : 0) + (att.pm_out ? 5 : 0);
                                            }, 0);

                                            const formattedAttendance = attendanceResults.map(att => ({
                                                ...att,
                                                attendance_date: formatDate(att.attendance_date)
                                            }));

                                            const verificationStatusQuery = `
                                                SELECT
                                                a.activity_day,
                                                    CASE 
                                                        WHEN COUNT(DISTINCT pr.role_name) >= e.to_verify THEN 'Verified'
                                                        ELSE 'Not Verified'
                                                    END AS verification_status
                                                FROM activity a
                                                LEFT JOIN participation_record pr ON a.activity_id = pr.activity_id AND pr.id_number = ?
                                                JOIN event e ON a.event_id = e.event_id
                                                WHERE a.event_id = ?
                                                GROUP BY a.activity_day;`

                                            db.query(verificationStatusQuery, [id_number, eventId], (err, verificationResults) => {
                                                if (err) return res.status(500).send('Database error while fetching verification status');

                                                const verificationStatusByDay = {};
                                                verificationResults.forEach(row => {
                                                    verificationStatusByDay[row.activity_day] = row.verification_status;
                                                });

                                                renderPage(student, academicYears, events, activityResults, formattedAttendance, totalParticipationPoints, totalAttendancePoints, semestralScore, yearlyScore, verificationStatusByDay);
                                            });
                                        });
                                    });
                                } else {
                                    // Render the page with events, but no specific activity or attendance details
                                    renderPage(student, academicYears, events, [], [], 0, 0, semestralScore, yearlyScore, {});
                                }
                            } else {
                                // If no events found, render the page without events
                                renderPage(student, academicYears, [], [], [], 0, 0, semestralScore, yearlyScore, {});
                            }
                        });
                    } else {
                        // If academic year or semester is not selected, render the page with no events
                        renderPage(student, academicYears, [], [], [], 0, 0, semestralScore, yearlyScore, {});
                    }
                });
            });
        });
    });
});

module.exports = router;