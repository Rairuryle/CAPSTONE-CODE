document.addEventListener('DOMContentLoaded', function () {
    const roleSelects = document.querySelectorAll('.assign-role');
    const verifyButton = document.querySelector('.btn-verify-points');
    const studentId = getStudentIdFromUrl();

    // Define isCSO based on the value in your HTML element
    const isCSO = document.querySelector('#isCSO').value === "true";

    const eventDays = {};  // To track the assigned roles per event day

    const toVerify = new URLSearchParams(window.location.search).get('to_verify');
    console.log('To Verify URL:', toVerify);

    // update the element with the ID 'toVerify' with the value
    if (toVerify) {
        document.getElementById('toVerify').value = toVerify;
        console.log('To Verify Value:', document.getElementById('toVerify').value);
    }

    roleSelects.forEach((select, index) => {
        // Initial setup: Add class based on initial value, if any
        updateRoleClass(select);

        select.addEventListener('change', function () {
            updateRoleClass(select);
            // Update points display based on role selected
            updatePoints(select, index);
            // Track assigned roles count per event day
            updateAssignedRolesCount(select);
            // Only check and enable the button if isCSO is not true
            if (!isCSO) {
                checkAndEnableVerifyButton();
            }
        });
    });

    function updateRoleClass(select) {
        select.classList.remove('indiv-participant', 'team-participant', 'prog-spectator', 'oth-spectator', 'red-stamp', 'blue-stamp', 'violet-stamp');

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
            case 'RED Stamp':
                select.classList.add('red-stamp');
                break;
            case 'BLUE Stamp':
                select.classList.add('blue-stamp');
                break;
            case 'VIOLET Stamp':
                select.classList.add('violet-stamp');
                break;
            default:
                break;
        }
    }

    function updatePoints(select, index) {
        const pointsContainer = document.getElementById(`points-container-${index}`);
        const officerSpan = document.getElementById(`officer-in-charge-${index}`);
        const adminId = document.getElementById('adminId').value; // Retrieve the admin ID

        const rolePoints = {
            'INDIV. Participant': 15,
            'TEAM Participant': 20,
            'PROG. Spectator': 10,
            'OTH. Spectator': 5,
            'RED Stamp': 5,
            'BLUE Stamp': 10,
            'VIOLET Stamp': 15
        };

        const selectedRole = select.value;
        const points = rolePoints[selectedRole] || 0;

        if (pointsContainer) {
            pointsContainer.innerText = `${points} points`;
        }

        if (officerSpan) {
            officerSpan.style.display = 'block';
        }

        const activityDiv = select.closest('.activity-table-information');
        const activityId = activityDiv.getAttribute('data-activity-id');

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
                    location.reload();
                })
                .catch((error) => console.error('Error:', error));
        });
    }

    // track assigned roles count per event day
    function updateAssignedRolesCount(select) {
        const activityDiv = select.closest('.activity-table-information');
        const eventDay = activityDiv.getAttribute('data-day');
        console.log('Activity Day:', eventDay);
        const selectedRole = select.value;
        console.log('Selected Role:', selectedRole);

        if (!eventDay) return;

        if (!eventDays[eventDay]) {
            eventDays[eventDay] = 0;
        }

        if (selectedRole !== "") {
            eventDays[eventDay] += 1;
        } else {
            eventDays[eventDay] -= 1;
        }
    }

    function checkAndEnableVerifyButton() {
        let enableButton = false;

        // Loop through all event days to check the assigned roles
        for (let eventDay in eventDays) {
            const assignedRolesCount = eventDays[eventDay];
            console.log('Role Count:', assignedRolesCount);

            if (assignedRolesCount >= toVerify) {
                enableButton = true;
                break;
            }
        }

        if (enableButton) {
            verifyButton.removeAttribute('disabled');
        } else {
            verifyButton.setAttribute('disabled', 'true');
        }
    }

    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});