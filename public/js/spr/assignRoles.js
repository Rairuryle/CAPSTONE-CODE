document.addEventListener('DOMContentLoaded', function () {
    const roleSelects = document.querySelectorAll('.assign-role');
    const verifyButton = document.querySelector('.btn-verify-points');
    const studentId = getStudentIdFromUrl();

    roleSelects.forEach((select, index) => {
        // Initial setup: Add class based on initial value, if any
        updateRoleClass(select);

        select.addEventListener('change', function () {
            updateRoleClass(select);
            // Update points display based on role selected
            updatePoints(select, index);
        });
    });

    // Function to update role classes
    function updateRoleClass(select) {
        select.classList.remove('indiv-participant', 'team-participant', 'prog-spectator', 'oth-spectator');

        switch (select.value) {
            case 'INDIV. Participant':
                select.classList.add('indiv-participant');
                break;
            case 'TEAM Participant':
                select.classList.add('team-participant');
                break;
            case 'PROG. Spectator':
                select.classList.add('prog-spectator');
                break;
            case 'OTH. Spectator':
                select.classList.add('oth-spectator');
                break;
            default:
                break;
        }
    }

    function updatePoints(select, index) {
        const pointsContainer = document.getElementById(`points-container-${index}`);
        const officerSpan = document.getElementById(`officer-in-charge-${index}`);
        const adminId = document.getElementById('adminId').value; // Retrieve the admin ID

        console.log('officerSpan', officerSpan);
        const rolePoints = {
            'INDIV. Participant': 15,
            'TEAM Participant': 20,
            'PROG. Spectator': 10,
            'OTH. Spectator': 5
        };

        const selectedRole = select.value;
        const points = rolePoints[selectedRole] || 0;

        // Update the points display
        if (pointsContainer) {
            pointsContainer.innerText = `${points} points`;
        }

        if (officerSpan) {
            officerSpan.style.display = 'block';
        }

        // Get the activity ID from the parent div
        const activityDiv = select.closest('.activity-table-information');
        const activityId = activityDiv.getAttribute('data-activity-id');

        // Get the student ID from the URL
        const studentId = getStudentIdFromUrl(); // Make sure this function is defined to extract the ID

        // Send role assignment to the server
        verifyButton.addEventListener('click', function () {
            fetch('/event/assign-role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activity_id: activityId,
                    role_name: selectedRole,
                    id_number: studentId,
                    points: points,
                    admin_id: adminId
                })
            })

                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Refresh the page after the successful data submission
                    location.reload();  // This line refreshes the page
                })
                .catch((error) => console.error('Error:', error));
        });
    }

    // Function to extract the student ID from the URL
    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});
