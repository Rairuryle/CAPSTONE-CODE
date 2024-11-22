const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const fetchEvents = (academicYear, semester, eventScope, callback) => {
    const eventQuery = `
    SELECT * FROM event
    WHERE academic_year = ? AND semester = ? AND (event_scope = ? OR event_scope = 'INSTITUTIONAL')
    ORDER BY event_date_start DESC
    `;

    db.query(eventQuery, [academicYear, semester, eventScope], (err, eventResults) => {
        if (err) {
            console.error('Error fetching events:', err);
            return callback([]);
        }
        callback(eventResults);
    });
};

const filterEvents = (events, departmentName, aboName, iboName, selectedScope) => {
    const institutionalEvents = events.filter(event => event.event_scope === 'INSTITUTIONAL');
    const collegeEvents = events.filter(event => event.event_scope === departmentName);
    const aboEvents = events.filter(event => event.event_scope === aboName);
    const iboEvents = events.filter(event => event.event_scope === iboName);

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
        filteredEvents = [];
    }
    return {
        institutionalEvents,
        collegeEvents,
        aboEvents,
        iboEvents,
        filteredEvents
    };
};


const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

const fetchSemestralPoints = (academicYear, semester, eventScope, idNumber, callback) => {
    console.log('Academic Year:', academicYear);
    console.log('Semester:', semester);
    console.log('Event Scope:', eventScope);
    console.log('ID Number:', idNumber);

    const semestralPointsQuery = `
        SELECT 
            attendance_points.id_number,
            COALESCE(total_attendance_points, 0) + COALESCE(total_participation_points, 0) AS total_points
        FROM 
            (SELECT 
                ar.id_number,
                SUM(
                    (COALESCE(ar.am_in, 0)) + 
                    (COALESCE(ar.pm_in, 0)) + 
                    (COALESCE(ar.pm_out, 0))
                ) AS total_attendance_points
            FROM 
                attendance_record ar
            JOIN 
                attendance a ON ar.attendance_id = a.attendance_id
            JOIN 
                event e ON a.event_id = e.event_id
            WHERE 
                e.academic_year = ? 
                AND e.semester = ? 
                AND e.event_scope = ?
                AND ar.id_number = ?
            GROUP BY 
                ar.id_number) AS attendance_points

        LEFT JOIN
            (SELECT 
                pr.id_number,
                SUM(pr.participation_record_points) AS total_participation_points
            FROM 
                participation_record pr
            JOIN 
                activity ac ON pr.activity_id = ac.activity_id
            JOIN 
                event e ON ac.event_id = e.event_id
            WHERE 
                e.academic_year = ?
                AND e.semester = ? 
                AND e.event_scope = ?
                AND pr.id_number = ?
            GROUP BY 
                pr.id_number) AS participation_points

        ON attendance_points.id_number = participation_points.id_number;
    `;

    db.query(semestralPointsQuery, 
        [academicYear, semester, eventScope, idNumber, academicYear, semester, eventScope, idNumber], 
        (err, results) => {
            if (err) {
                console.error('Error fetching total points:', err);
                return callback(0);
            }
            
            if (results.length > 0) {
                const totalPoints = results[0].total_points;
                console.log('Total Points:', totalPoints);
                callback(totalPoints);
            } else {
                console.log('No records found for the given parameters.');
                callback(0);
            }
        });
};


const fetchYearlyPoints = (academicYear, eventScope, idNumber, callback) => {
    const yearlyPointsQuery = `
        SELECT 
            attendance_points.id_number,
            COALESCE(total_attendance_points, 0) + COALESCE(total_participation_points, 0) AS total_points
        FROM 
            (SELECT 
                ar.id_number,
                SUM(
                    (COALESCE(ar.am_in, 0)) + 
                    (COALESCE(ar.pm_in, 0)) + 
                    (COALESCE(ar.pm_out, 0))
                ) AS total_attendance_points
            FROM 
                attendance_record ar
            JOIN 
                attendance a ON ar.attendance_id = a.attendance_id
            JOIN 
                event e ON a.event_id = e.event_id
            WHERE 
                e.academic_year = ? 
                                AND e.event_scope = ?

                AND ar.id_number = ?
            GROUP BY 
                ar.id_number) AS attendance_points

        LEFT JOIN
            (SELECT 
                pr.id_number,
                SUM(pr.participation_record_points) AS total_participation_points
            FROM 
                participation_record pr
            JOIN 
                activity ac ON pr.activity_id = ac.activity_id
            JOIN 
                event e ON ac.event_id = e.event_id
            WHERE 
                e.academic_year = ?
                                AND e.event_scope = ?

                AND pr.id_number = ?
            GROUP BY 
                pr.id_number) AS participation_points

        ON attendance_points.id_number = participation_points.id_number;
    `;

    db.query(yearlyPointsQuery, [academicYear, eventScope, idNumber, academicYear, eventScope, idNumber], (err, results) => {
        if (err) {
            console.error('Error fetching total points:', err);
            return callback(0);
        }
        const totalPoints = results.length > 0 ? results[0].total_points : 0;
        callback(totalPoints);
    });
};

module.exports = {
    fetchEvents,
    filterEvents,
    formatDate,
    fetchSemestralPoints,
    fetchYearlyPoints
};