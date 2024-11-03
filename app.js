const express = require('express');
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const session = require('express-session');
const authMiddleware = require('./middleware/authMiddleware'); // Import authentication middleware
const bodyParser = require('body-parser'); // Parsing form data
// const fs = require('fs'); // File System module

dotenv.config({ path: './.env' });

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//  parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
//  parse JSON bodies (as sent by API clients)
app.use(express.json());

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        or: function () {
            // Loop through all arguments and return true if any of them are truthy
            for (let i = 0; i < arguments.length - 1; i++) {
                if (arguments[i]) {
                    return true;
                }
            }
            return false;
        },
        and: function (a, b) {
            return a && b;
        },
        indexIsEven: function (index) {
            return index % 2 === 0;
        },
        indexIsOdd: function (index) {
            return index % 2 !== 0;
        },
        json: (context) => {
            return JSON.stringify(context);
        },
        // Date helper to format a date as MM-DD-YYYY
        formatDate: function (date) {
            const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
            return new Date(date).toLocaleDateString('en-US', options);
        },
        // Helper to calculate the number of days between two dates
        calculateDays: function (startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        },
        range: function (from, to) {
            const result = [];
            for (let i = from; i <= to; i++) {
                result.push(i);
            }
            return result;
        }
    }
}));

app.set('view engine', 'hbs');

// Configure express-session
app.use(session({
    secret: 'kakaka',
    resave: true,
    saveUninitialized: true
}));

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MySQL Connected")
    }
})

// define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', authMiddleware);
app.use('/student', require('./routes/student'));
app.use('/event', require('./routes/event')); // This mounts the event routes under /event


app.use(bodyParser.urlencoded({ extended: true }));


// app.get('/dashboard/search', (req, res) => {
//     const idNumber = req.query.gridsearchIDNumber;
//     const organization = req.session.adminData.organization;

//     const unrestrictedOrganizations = ["SAO", "USG", "CSO", "Compatriots", "Cosplay Corps", "Green Leaders", "Kainos", "Meeples", "Micromantics", "Red Cross Youth", "Soul Whisperers", "Vanguard E-sports"];

//     // const aboCAS = ["JSWAP", "LABELS", "LSUPS", "POLISAYS"];
//     // const aboCBA = ["JFINEX", "JMEX", "JPIA"];
//     // const aboCCSEA = ["ALGES", "ICpEP", "IIEE", "JIECEP", "LISSA", "PICE", "SOURCE", "UAPSA"];
//     // const aboCTE = ["ECC", "GENTLE", "GEM-O", "LapitBayan", "LME", "SPEM", "SSS"];
//     // const aboCTHM = ["FHARO", "FTL", "SOTE"];

//     // const CAS = aboCAS.includes(organization);
//     // const CBA = aboCBA.includes(organization);
//     // const CCSEA = aboCCSEA.includes(organization);
//     // const CTE = aboCTE.includes(organization);
//     // const CTHM = aboCTHM.includes(organization);

//     db.query('SELECT * FROM student WHERE id_number = ?', [idNumber], (error, results) => {
//         if (error) {
//             console.log(error);
//             res.status(500).json({ studentFound: false });
//         } else {
//             if (results.length > 0) {
//                 const studentData = results[0];
//                 const departmentName = studentData.department_name;
//                 const aboName = studentData.abo_name;
//                 const iboName = studentData.ibo_name;
//                 // const isCAS = CAS && departmentName === "CAS";
//                 // const isCBA = CBA && departmentName === "CBA";
//                 // const isCCSEA = CCSEA && departmentName === "CCSEA";
//                 // const isCTE = CTE && departmentName === "CTE";
//                 // const isCTHM = CTHM && departmentName === "CTHM";

//                 // console.log("iscas", isCAS);
//                 // console.log("iscba", isCBA);
//                 // console.log("isccsea", isCCSEA);
//                 // console.log("iscte", isCTE);
//                 // console.log("iscthm", isCTHM);

//                 const canSearch = unrestrictedOrganizations.includes(organization) ||
//                     departmentName === organization ||
//                     aboName === organization;

//                 if (canSearch) {
//                     req.session.departmentName = departmentName;
//                     req.session.aboName = aboName;
//                     req.session.iboName = iboName;
//                     res.status(200).json({ studentFound: true, studentData });
//                 } else {
//                     res.status(403).json({ error: 'Department mismatch' });
//                 }
//             } else {
//                 res.status(404).json({ studentFound: false });
//             }
//         }
//     });
// });

// function searchStudentByGridsearchIDNumber(gridsearchIDNumber, req, callback) {
//     db.query('SELECT * FROM student WHERE id_number = ?', [gridsearchIDNumber], (error, results) => {
//         if (error) {
//             console.log(error);
//             return callback({ studentFound: false });
//         } else {
//             if (results.length > 0) {
//                 const studentData = results[0];
//                 const departmentName = studentData.department_name;
//                 const aboName = studentData.abo_name;
//                 const iboName = studentData.ibo_name;
//                 const organization = req.session.adminData.organization;

//                 const unrestrictedOrganizations = ["SAO", "USG", "CSO", "Compatriots", "Cosplay Corps", "Green Leaders", "Kainos", "Meeples", "Micromantics", "Red Cross Youth", "Soul Whisperers", "Vanguard E-sports"];

//                 // const aboCAS = ["JSWAP", "LABELS", "LSUPS", "POLISAYS"];
//                 // const aboCBA = ["JFINEX", "JMEX", "JPIA"];
//                 // const aboCCSEA = ["ALGES", "ICpEP", "IIEE", "JIECEP", "LISSA", "PICE", "SOURCE", "UAPSA"];
//                 // const aboCTE = ["ECC", "GENTLE", "GEM-O", "LapitBayan", "LME", "SPEM", "SSS"];
//                 // const aboCTHM = ["FHARO", "FTL", "SOTE"];

//                 // const CAS = aboCAS.includes(organization);
//                 // const CBA = aboCBA.includes(organization);
//                 // const CCSEA = aboCCSEA.includes(organization);
//                 // const CTE = aboCTE.includes(organization);
//                 // const CTHM = aboCTHM.includes(organization);

//                 // const isCAS = CAS && departmentName === "CAS";
//                 // const isCBA = CBA && departmentName === "CBA";
//                 // const isCCSEA = CCSEA && departmentName === "CCSEA";
//                 // const isCTE = CTE && departmentName === "CTE";
//                 // const isCTHM = CTHM && departmentName === "CTHM";

//                 const isSearchAllowed = unrestrictedOrganizations.includes(organization) ||
//                     departmentName === organization ||
//                     aboName === organization;

//                 if (isSearchAllowed) {
//                     req.session.departmentName = departmentName;
//                     req.session.aboName = aboName;
//                     req.session.iboName = iboName;
//                     return callback({ studentFound: true, studentData });
//                 } else {
//                     return callback({ studentFound: false, error: 'Department mismatch' });
//                 }
//             } else {
//                 return callback({ studentFound: false });
//             }
//         }
//     });
// }

// app.get('/university-events-admin/search', (req, res) => {
//     const gridsearchIDNumber = req.query.gridsearchIDNumber;
//     searchStudentByGridsearchIDNumber(gridsearchIDNumber, req, (result) => {
//         res.status(result.studentFound ? 200 : 500).json(result);
//     });
// });


// app.post('/insert-event-database', (req, res) => {
//     console.log(req.body);

//     const {
//         eventnameInput,
//         startDateEvent,
//         endDateEvent,
//         eventScope,
//         eventDays,
//         activities,
//         // attendance,
//     } = req.body;

//     const formattedStartDate = new Date(startDateEvent).toISOString().substring(0, 10);
//     const formattedEndDate = new Date(endDateEvent).toISOString().substring(0, 10);

//     db.query('SELECT event_name FROM event WHERE event_name = ?', [eventnameInput], async (error, results) => {
//         if (error) {
//             console.log(error);
//             return res.status(500).json({ error: 'Error checking for existing event' });
//         }

//         if (results.length === 0) {
//             db.query('INSERT INTO event SET ?', {
//                 event_name: eventnameInput,
//                 event_date_start: formattedStartDate,
//                 event_date_end: formattedEndDate,
//                 event_scope: eventScope,
//                 event_days: eventDays,
//             }, (error, eventResults) => {
//                 if (error) {
//                     console.log(error);
//                     return res.status(500).json({ error: 'Error inserting event data' });
//                 } else {
//                     console.log("Event results: ", eventResults);

//                     const eventId = eventResults.insertId;

//                     // Array to store promises for each activity insertion
//                     const insertionPromises = [];

//                     if (activities.length > 0) {
//                         activities.forEach(({ activityName, activityDate }) => {
//                             if (activityName && activityDate) {
//                                 const formattedActivityDate = new Date(activityDate).toISOString().substring(0, 10);

//                                 const startDate = new Date(startDateEvent); // Convert to a date object
//                                 const activityDateTime = new Date(activityDate);

//                                 const timeDifference = activityDateTime - startDate; // Difference between activity date and event start date
//                                 const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24) + 1); // number of days
//                                 db.query('INSERT INTO activities SET ?', {
//                                     activity_name: activityName,
//                                     activity_date: formattedActivityDate,
//                                     event_id: eventId,
//                                     event_day: dayDifference,
//                                 }, (error, activityResults) => {
//                                     if (error) {
//                                         console.log(error);
//                                     } else {
//                                         console.log(`Activity ${activityName} successfully created with event day: ${dayDifference}`);

//                                         db.query('INSERT INTO event_day (event_id, activity_id, event_day) VALUES (?, ?, ?)', [eventId, activityResults.insertId, dayDifference], (error) => {
//                                             if (error) {
//                                                 console.log(error);
//                                             } else {
//                                                 console.log(`Event_day entry for activity ${activityName} successfully created`);
//                                             }
//                                         });
//                                     }
//                                 });
//                             } else {
//                                 console.log('Skipping activity with undefined name or date:', { activityName, formattedActivityDate });
//                             }
//                         });
//                     }

//                     // if (attendance.length > 0) {
//                     //     attendance.forEach((attendanceDate) => {
//                     //         if (isValidAttendanceDate(attendanceDate)) {
//                     //             const formattedAttendanceDate = new Date(attendanceDate.formattedDate).toISOString().substring(0, 10);
//                     //             const eventStartDate = new Date(startDateEvent);
//                     //             const attendanceDateTime = new Date(attendanceDate.formattedDate);

//                     //             if (attendanceDateTime >= eventStartDate) {
//                     //                 const timeDifference = attendanceDateTime - eventStartDate;
//                     //                 const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1;

//                     //                 const promise = new Promise((resolve, reject) => {
//                     //                     db.query('INSERT INTO attendance SET ?', {
//                     //                         attendance_date: formattedAttendanceDate,
//                     //                         event_id: eventId,
//                     //                         event_day: dayDifference,
//                     //                     }, (error, attendanceResults) => {
//                     //                         if (error) {
//                     //                             console.log(error);
//                     //                             reject(error);
//                     //                         } else {
//                     //                             console.log(`Attendance date ${formattedAttendanceDate} successfully created with event day: ${dayDifference}`);
//                     //                             resolve(attendanceResults);
//                     //                         }
//                     //                     });
//                     //                 });

//                     //                 insertionPromises.push(promise);
//                     //             } else {
//                     //                 console.error('Attendance date is before the event start date:', attendanceDate.formattedDate);
//                     //             }
//                     //         } else {
//                     //             console.error('Invalid attendance date:', attendanceDate.formattedDate);
//                     //         }
//                     //     });
//                     // }

//                     // function isValidAttendanceDate(date) {
//                     //     return (
//                     //         date &&
//                     //         typeof date.formattedDate === 'string' &&
//                     //         !isNaN(Date.parse(date.formattedDate))
//                     //     );
//                     // }

//                     // Wait for all promises to settle
//                     Promise.allSettled(insertionPromises)
//                         .then((results) => {
//                             const successfulResults = results.filter((result) => result.status === 'fulfilled');
//                             const failedResults = results.filter((result) => result.status === 'rejected');

//                             // Fetch all events after adding the new event
//                             db.query('SELECT * FROM event', (error, events) => {
//                                 if (error) {
//                                     console.log(error);
//                                     return res.status(500).json({ error: 'Error fetching events' });
//                                 } else {
//                                     // Return the updated list of events to the client
//                                     return res.status(200).json({
//                                         message: `Event ${eventnameInput} and its activities successfully created`,
//                                         events: events,
//                                         activities: successfulResults.map((result) => result.value),
//                                         // attendance: successfulResults.map((result) => result.value),
//                                         errors: failedResults.map((result) => result.reason),
//                                     });
//                                 }
//                             });
//                         })
//                         .catch((error) => {
//                             console.error('Error:', error);
//                             res.status(500).json({ error: 'Server error' });
//                         });
//                 }
//             });
//         } else {
//             return res.status(400).json({ error: 'There is already an existing event', eventname: eventnameInput });
//         }

//         req.session.eventData = {
//             event_name: eventnameInput,
//             event_date_start: formattedStartDate,
//             event_date_end: formattedEndDate,
//             event_scope: eventScope,
//             event_days: eventDays,
//         };
//     });
// });

// function getEventRoute(eventNameSpecific, callback) {
//     db.query('SELECT * FROM event WHERE event_name = ?', [eventNameSpecific], (error, eventResults) => {
//         if (error) {
//             console.error('Error in SQL query:', error);
//             return callback({ eventFound: false });
//         } else {
//             if (eventResults.length > 0) {
//                 const eventData = eventResults[0];

//                 // Fetch associated activities
//                 db.query('SELECT * FROM activities WHERE event_id = ?', [eventData.event_id], (error, activityResults) => {
//                     if (error) {
//                         console.error('Error fetching activities:', error);
//                         return callback({ eventFound: false });
//                     } else {
//                         console.log(eventData.id);
//                         console.log(activityResults);
//                         eventData.activities = activityResults;
//                         return callback({ eventFound: true, eventData });
//                     }
//                 });
//             } else {
//                 return callback({ eventFound: false });
//             }
//         }
//     });
// }

// app.get('/university-events-admin/eventroute', (req, res) => {
//     const eventNameSpecific = req.query.eventNameSpecific;
//     getEventRoute(eventNameSpecific, (result) => {
//         res.status(result.eventFound ? 200 : 500).json(result);
//     });
// });

// app.get('/student-participation-record/eventroute', (req, res) => {
//     const eventNameSpecific = req.query.eventNameSpecific;
//     getEventRoute(eventNameSpecific, (result) => {
//         res.status(result.eventFound ? 200 : 500).json(result);
//     });
// });

// app.post('/insert-activity-database', (req, res) => {
//     const { eventId, activities } = req.body;

//     db.query('SELECT event_date_start, event_days FROM event WHERE event_id = ?', [eventId], (error, eventResult) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).json({ message: `Error fetching event data for event ID ${eventId}` });
//         }

//         if (eventResult.length > 0) {
//             const eventStartDate = new Date(eventResult[0].event_date_start);
//             const eventDays = eventResult[0].event_days;

//             const insertionPromises = activities.map((activity) => {
//                 const { activityName, activityDate } = activity;
//                 const formattedActivityDate = new Date(activityDate).toISOString().substring(0, 10);

//                 const currentActivityDate = new Date(formattedActivityDate);
//                 const timeDifference = currentActivityDate - eventStartDate;
//                 const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

//                 return new Promise((resolve, reject) => {
//                     if (dayDifference <= eventDays) {
//                         db.query(
//                             'INSERT INTO activities SET ?',
//                             {
//                                 activity_name: activityName,
//                                 activity_date: formattedActivityDate,
//                                 event_id: eventId,
//                                 event_day: dayDifference,
//                             },
//                             (error, activityResults) => {
//                                 if (error) {
//                                     console.error(error);
//                                     reject(`Error inserting activity ${activityName} data`);
//                                 } else {
//                                     const activityId = activityResults.insertId;
//                                     resolve(`Activity ${activityName} successfully created with event day: ${dayDifference}`);

//                                     db.query(
//                                         'INSERT INTO event_day (event_id, activity_id, event_day) VALUES (?, ?, ?)',
//                                         [eventId, activityId, dayDifference],
//                                         (error, eventDayResults) => {
//                                             if (error) {
//                                                 console.error(error);
//                                                 reject(`Error inserting event_day data for activity ${activityName}`);
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         );
//                     } else {
//                         resolve(`Activity ${activityName} skipped: beyond event days`);
//                     }
//                 });
//             });

//             Promise.all(insertionPromises)
//                 .then((results) => {
//                     res.status(200).json({ message: "Activities added successfully", results });
//                 })
//                 .catch((err) => {
//                     console.error("Error inserting activities:", err);
//                     res.status(500).json({ message: "Error inserting activities", error: err });
//                 });
//         } else {
//             return res.status(404).json({ message: `Event with ID ${eventId} not found` });
//         }
//     });
// });


// app.get('/student-participation-record/search', (req, res) => {
//     const idNumber = req.query.gridsearchIDNumber;
//     db.query('SELECT * FROM student WHERE id_number = ?', [idNumber], (error, results) => {
//         if (error) {
//             console.log(error);
//             res.status(500).json({ studentFound: false });
//         } else {
//             if (results.length > 0) {
//                 const studentData = results[0];
//                 const departmentName = studentData.department_name;
//                 const aboName = studentData.abo_name;
//                 const iboName = studentData.ibo_name;

//                 req.session.departmentName = departmentName;
//                 req.session.aboName = aboName;
//                 req.session.iboName = iboName;

//                 res.status(200).json({ studentFound: true, studentData });
//             } else {
//                 res.status(404).json({ studentFound: false });
//             }
//         }
//     });
// });

app.listen(3000, () => {
    console.log("Server started on Port 3000");
})