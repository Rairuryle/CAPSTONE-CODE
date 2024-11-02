document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('selectEventDay').addEventListener('change', function () {
        const selectedDay = this.value; // Get the selected event day
        const selectedDayNumber = Number(selectedDay); // Convert it to a number
        const attendances = document.querySelectorAll('.attendance-table-information');
        const activities = document.querySelectorAll('.activity-table-information');
        const activityTableInformationContainer = document.querySelector('.activity-table-information-container');

        const existingMessage = activityTableInformationContainer.querySelector('.no-activities-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        let hasActivities = false;

        attendances.forEach(attendance => {
            const attendanceDay = attendance.getAttribute('data-day');

            if (Number(attendanceDay) === selectedDayNumber) {
                attendance.style.display = 'flex';
            } else {
                attendance.classList.remove("d-flex");
                attendance.style.display = 'none';
            }
        });

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

        if (!hasActivities) {
            const foundMessage = document.createElement('p');
            foundMessage.innerHTML = "No activities during this day.";
            foundMessage.classList.add('no-activities-message');
            activityTableInformationContainer.appendChild(foundMessage);
        }
    });
});
