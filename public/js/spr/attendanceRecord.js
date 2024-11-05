document.addEventListener('DOMContentLoaded', function () {
    const studentId = getStudentIdFromUrl(); // Get student ID from the URL
    const adminId = document.getElementById('adminId').value; // Retrieve the admin ID

    document.querySelectorAll('.attendance-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const attendanceId = this.getAttribute('data-attendance-id');
            let attendancePoints = 0;

            // Get the current values for AM IN, PM IN, PM OUT
            const amInChecked = document.querySelector(`input[data-role-name="AM IN"][data-attendance-id="${attendanceId}"]`).checked;
            const pmInChecked = document.querySelector(`input[data-role-name="PM IN"][data-attendance-id="${attendanceId}"]`).checked;
            const pmOutChecked = document.querySelector(`input[data-role-name="PM OUT"][data-attendance-id="${attendanceId}"]`).checked;

            // Calculate attendance points
            if (amInChecked) attendancePoints += 5;
            if (pmInChecked) attendancePoints += 5;
            if (pmOutChecked) attendancePoints += 5;

            // Prepare data for the AJAX request
            const data = {
                attendance_id: attendanceId,
                attendance_points: attendancePoints,
                am_in: amInChecked ? 5 : null,
                pm_in: pmInChecked ? 5 : null,
                pm_out: pmOutChecked ? 5 : null,
                id_number: studentId, // Include student ID
                admin_id: adminId // Include admin ID
            };

            // AJAX request to insert the attendance record
            fetch('/event/record-attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Attendance record inserted/updated successfully');
                } else {
                    console.error('Error inserting attendance record:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    });

    // Function to extract the student ID from the URL
    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});
