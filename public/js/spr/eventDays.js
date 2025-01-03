document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectEventDay').addEventListener('change', function () {
        const selectedDay = this.value; // Get the selected event day
        const selectedDayNumber = Number(selectedDay); // Convert it to a number
        const attendances = document.querySelectorAll('.attendance-table-information');
        const activities = document.querySelectorAll('.activity-table-information');
        const activityTableInformationContainer = document.querySelector('.activity-table-information-container');

        // Remove any existing "no activities" message
        const existingMessage = activityTableInformationContainer.querySelector('.no-activities-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        let hasActivities = false;

        // Filter and display attendance records for the selected event day
        attendances.forEach(attendance => {
            const attendanceDay = attendance.getAttribute('data-day');
            if (Number(attendanceDay) === selectedDayNumber) {
                attendance.style.display = 'flex';
            } else {
                attendance.classList.remove("d-flex");
                attendance.style.display = 'none'; 
            }
        });

        // Filter and display activities for the selected event day
        activities.forEach(activity => {
            const activityDay = activity.getAttribute('data-day');
            if (Number(activityDay) === selectedDayNumber) {
                activity.style.display = 'flex';
                hasActivities = true;
            } else {
                activity.classList.remove("d-flex");
                activity.style.display = 'none';
            }
        });

        // If no activities are found, display a "no activities" message
        if (!hasActivities) {
            const foundMessage = document.createElement('p');
            foundMessage.innerHTML = "No activities during this day.";
            foundMessage.classList.add('no-activities-message');
            activityTableInformationContainer.appendChild(foundMessage);
        }

        // send the selected event day to the backend if needed:
        const queryParams = new URLSearchParams({
            event_day: selectedDayNumber
        });

        fetch(`/spr-main?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response:', data);
        })
        .catch(error => {
            console.error('Error sending event day:', error);
        });
    });
});