document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sortActivityTable').addEventListener('change', function () {
        const sortBy = this.value;
        sortActivityTable(sortBy);
    });

    document.getElementById('searchInput').addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        filterActivities(searchTerm);
    });
});

function sortActivityTable(sortBy) {
    const activitiesContainer = document.querySelector('.activity-table-information-container');
    const activities = Array.from(activitiesContainer.children);

    switch (sortBy) {
        case 'Activity':
            activities.sort((a, b) => {
                const activityA = a.querySelector('.col-activity-name').innerText.trim();
                const activityB = b.querySelector('.col-activity-name').innerText.trim();
                return activityA.localeCompare(activityB);
            });
            break;

        case 'Date':
            activities.sort((a, b) => {
                const dateA = new Date(a.querySelector('.col-2').innerText.trim());
                const dateB = new Date(b.querySelector('.col-2').innerText.trim());
                return dateA - dateB;
            });
            break;

        case 'Role':
            activities.sort((a, b) => {
                const roleA = a.querySelector('.col-role select').value.trim();
                const roleB = b.querySelector('.col-role select').value.trim();
                return roleA.localeCompare(roleB);
            });
            break;

        case 'Points':
            activities.sort((a, b) => {
                const pointsA = parseInt(a.querySelector('.col-1').innerText.trim()) || 0;
                const pointsB = parseInt(b.querySelector('.col-1').innerText.trim()) || 0;
                return pointsA - pointsB;
            });
            break;

        case 'Officer':
            activities.sort((a, b) => {
                const officerA = a.querySelector('.officer-in-charge').innerText.trim();
                const officerB = b.querySelector('.officer-in-charge').innerText.trim();
                return officerA.localeCompare(officerB);
            });
            break;

        default:
            break;
    }

    // Append sorted activities back to the container
    activities.forEach(activity => activitiesContainer.appendChild(activity));
}

function filterActivities(searchTerm) {
    const activitiesContainer = document.querySelector('.activity-table-information-container');
    const activities = Array.from(activitiesContainer.children);

    activities.forEach(activity => {
        const activityName = activity.querySelector('.col-activity-name').innerText.trim().toLowerCase();

        const isMatch = activityName.includes(searchTerm);

        if (isMatch) {
            activity.classList.add('d-flex');
        } else {
            activity.classList.remove('d-flex');
            activity.style.display = 'none';
        }
    });

    // Force reflow after filtering (optional)
    activitiesContainer.offsetHeight;
}
