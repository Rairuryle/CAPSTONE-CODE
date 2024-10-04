app.post('/insert-into-database', (req, res) => {
    console.log(req.body);

    const {
        lastnameInput,
        firstnameInput,
        middlenameInput,
        idnumberInput,
        departmentInput,
        courseInput,
        ABOInput,
        // IBOInput,
        yearInput,
        activeStatusInput,
        exemptionStatusInput,
    } = req.body;

    // Check if the user with the provided ID number exists in the student table
    db.query('SELECT id_number FROM student WHERE id_number = ?', [idnumberInput], async (error, results) => {
        if (error) {
            console.log(error);
        }

        // Insert the student data into the student table if it doesn't already exist
        if (results.length === 0) {
            db.query('INSERT INTO student SET ?', {
                id_number: idnumberInput,
                last_name: lastnameInput,
                first_name: firstnameInput,
                middle_name: middlenameInput,
                department_name: departmentInput,
                course_name: courseInput,
                abo_name: ABOInput,
                // ibo_name: IBOInput,
                year_level: yearInput,
                active_status: activeStatusInput,
                exemption_status: exemptionStatusInput
            }, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(results);
                    return res.status(200).json({
                        message: `Account created for ${idnumberInput}`
                    });
                }
            });
        } else {
            return res.status(400).json({ error: 'ID number already in use', idNumber: idnumberInput });
        }

        // Store user-related data in the session
        req.session.studentData = {
            id_number: idnumberInput,
            last_name: lastnameInput,
            first_name: firstnameInput,
            middle_name: middlenameInput,
            department_name: departmentInput,
            course_name: courseInput,
            abo_name: ABOInput,
            // ibo_name: IBOInput,
            year_level: yearInput,
            active_status: activeStatusInput,
            exemption_status: exemptionStatusInput
        };
    });
});