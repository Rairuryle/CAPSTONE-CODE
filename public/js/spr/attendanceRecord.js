document.addEventListener('DOMContentLoaded', function () {
    const studentId = getStudentIdFromUrl();
    const adminId = document.getElementById('adminId').value;

    document.querySelectorAll('.attendance-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const attendanceId = this.getAttribute('data-attendance-id');
            const amInChecked = document.querySelector(`input[data-role-name="AM IN"][data-attendance-id="${attendanceId}"]`).checked;
            const pmInChecked = document.querySelector(`input[data-role-name="PM IN"][data-attendance-id="${attendanceId}"]`).checked;
            const pmOutChecked = document.querySelector(`input[data-role-name="PM OUT"][data-attendance-id="${attendanceId}"]`).checked;

            let attendancePoints = 0;
            if (amInChecked) attendancePoints += 5;
            if (pmInChecked) attendancePoints += 5;
            if (pmOutChecked) attendancePoints += 5;

            if (!amInChecked && !pmInChecked && !pmOutChecked) {
                // delete if all checkboxes are unchecked
                fetch('/event/delete-attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ attendance_id: attendanceId, id_number: studentId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Attendance record deleted successfully');
                        document.querySelector(`[data-attendance-id="${attendanceId}"] .officer-in-charge`).style.display = 'none';
                    } else {
                        console.error('Error deleting attendance record:', data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            } else {
                const data = {
                    attendance_id: attendanceId,
                    attendance_points: attendancePoints,
                    am_in: amInChecked ? 5 : null,
                    pm_in: pmInChecked ? 5 : null,
                    pm_out: pmOutChecked ? 5 : null,
                    id_number: studentId,
                    admin_id: adminId
                };

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
                        console.log('Attendance record updated successfully');
                        document.querySelector(`[data-attendance-id="${attendanceId}"] .officer-in-charge`).style.display = 'block';
                    } else {
                        console.error('Error updating attendance record:', data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        });
    });

    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});