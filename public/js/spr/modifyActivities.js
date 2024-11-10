document.addEventListener('DOMContentLoaded', function () {
    // Select all edit buttons for activities
    const editActivityButtons = document.querySelectorAll(".btn[data-bs-target='#editActivitiesModal']");

    editActivityButtons.forEach(button => {
        button.addEventListener("click", function () {
            const activityId = this.getAttribute("data-activity-id");
            const activityName = this.getAttribute("data-activity-name");
            let activityDate = this.getAttribute("data-activity-date");

            // Convert activity date to 'YYYY-MM-DD' format if needed
            activityDate = new Date(activityDate);
            const formattedActivityDate = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}-${String(activityDate.getDate()).padStart(2, '0')}`;

            // Populate the modal inputs with the activity data
            document.getElementById("editActivityID").value = activityId;
            document.getElementById("deleteActivityID").value = activityId;
            document.getElementById("editActivityNameInput").value = activityName;
            document.getElementById("editActivityDate").value = formattedActivityDate;

            console.log("Formatted Activity Date:", formattedActivityDate);
        });
    });

    const editActivityNameInput = document.getElementById("editActivityNameInput");
    const deleteActivityButtons = document.querySelectorAll(".btn-delete-activity");

    deleteActivityButtons.forEach(button => {
        button.addEventListener("click", function () {
            const activityNames = document.querySelectorAll(".activity-name-to-delete");
            activityNames.forEach(activityName => {
                activityName.textContent = editActivityNameInput.value;
            });
        });
    });

    document.querySelector('.btn-edit-activity-submit').addEventListener('click', function (event) {
        event.preventDefault();

        const activityID = document.getElementById('editActivityID').value;
        const updatedActivityName = document.getElementById('editActivityNameInput').value;
        const updatedActivityDate = document.getElementById('editActivityDate').value;

        // Get event start date (you should have it available in the modal or hidden inputs)
        const eventStartDate = document.getElementById('eventStartDate').value;

        // Convert the event start date and activity date to Date objects
        const startDate = new Date(eventStartDate);
        const activityDate = new Date(updatedActivityDate);

        // Calculate the activity day (1-based index)
        const timeDiff = activityDate - startDate;
        const activityDay = Math.ceil(timeDiff / (1000 * 3600 * 24));  // No +1 here

        // Make sure activity day is valid (e.g., should be within event date range)
        if (activityDay < 1 || activityDate < startDate) {
            alert('Invalid activity date.');
            return;
        }

        // Send the updated activity data (including activity_day) to the backend
        fetch('/event/update-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity_id: activityID,
                activity_name: updatedActivityName,
                activity_date: updatedActivityDate,
                activity_day: activityDay
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Activity updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating activity: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update activity');
            });
    });

    // delete activity
    document.querySelector('.btn-delete-activity-submit').addEventListener('click', function (event) {
        event.preventDefault();

        const deletedActivityId = document.getElementById('deleteActivityID').value;

        fetch('/event/delete-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity_id: deletedActivityId
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Activity deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error deleting activity: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete activity');
            });
    });
});