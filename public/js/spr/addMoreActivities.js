document.addEventListener('DOMContentLoaded', function () {
    const handleAddMoreActivities = (modal) => {
        let activityIndex = 1;

        // clone the activity entry and add a delete icon
        const cloneActivityEntry = (originalEntry) => {
            const newEntry = originalEntry.cloneNode(true);
            const activityNameInput = newEntry.querySelector('input[name^="activity_name"]');
            const activityDateInput = newEntry.querySelector('input[name^="activity_date"]');

            // Reset values for the cloned fields
            activityNameInput.value = '';
            activityDateInput.value = '';

            // Find the delete icon in the cloned row (it should exist in the original row)
            const deleteIcon = newEntry.querySelector('.delete-activity-icon');

            // Add event listener to the delete icon to remove the row
            deleteIcon.addEventListener('click', function () {
                removeActivityRow(newEntry);
            });

            return newEntry;
        };

        const addMoreButton = modal.querySelector('.add-more-activities');
        const activityContainer = modal.querySelector('.add-activities-container');
        const toVerifyDropdown = modal.querySelector('#toVerifyDropdown');

        // Function to handle adding/removing activity fields based on to_verify selection
        const setActivityFields = (requiredCount) => {
            while (activityContainer.querySelectorAll('.activity-entry').length < requiredCount) {
                const originalEntry = activityContainer.querySelector('.activity-entry');
                const newEntry = cloneActivityEntry(originalEntry);
                activityContainer.insertBefore(newEntry, addMoreButton); // Insert before the Add More button
                activityIndex++;
            }
            while (activityContainer.querySelectorAll('.activity-entry').length > requiredCount) {
                activityContainer.removeChild(activityContainer.lastElementChild.previousElementSibling); // Remove extra rows
                activityIndex--;
            }
        };

        // Event listener for "Add More" button to add new rows
        addMoreButton.addEventListener('click', function () {
            const originalEntry = activityContainer.querySelector('.activity-entry');
            const newEntry = cloneActivityEntry(originalEntry);
            activityContainer.insertBefore(newEntry, addMoreButton); // Insert new row before the button
            activityIndex++;
        });

        // Event listener for "To Verify" dropdown (only for addEventsModal)
        if (modal.id === 'addEventsModal') {
            toVerifyDropdown.addEventListener('change', function () {
                const requiredActivities = parseInt(toVerifyDropdown.value, 10) || 0;
                setActivityFields(requiredActivities); // Adjust activity fields based on to_verify value
            });
        }

        // Function to remove an activity row
        const removeActivityRow = (row) => {
            if (activityContainer.querySelectorAll('.activity-entry').length > 1) {
                row.remove(); 
                activityIndex--;
            }
        };

        // Initialize delete icon event for the first entry
        const initialDeleteIcon = activityContainer.querySelector('.delete-activity-icon');
        if (initialDeleteIcon) {
            initialDeleteIcon.addEventListener('click', function () {
                removeActivityRow(initialDeleteIcon.closest('.activity-entry'));
            });
        }
    };

    // Attach the function to both modals
    const addActivitiesModal = document.getElementById('addActivitiesModal');
    if (addActivitiesModal) {
        handleAddMoreActivities(addActivitiesModal);
    }

    const addEventsModal = document.getElementById('addEventsModal');
    if (addEventsModal) {
        handleAddMoreActivities(addEventsModal);
    }
});
