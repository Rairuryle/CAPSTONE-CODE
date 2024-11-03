document.addEventListener('DOMContentLoaded', function () {
    // Function to handle adding more activities
    const handleAddMoreActivities = (modal) => {
        let activityIndex = 1;

        const cloneActivityEntry = (originalEntry) => {
            const newEntry = originalEntry.cloneNode(true);

            const activityNameInput = newEntry.querySelector('input[name^="activity_name"]');
            const activityDateInput = newEntry.querySelector('input[name^="activity_date"]');

            // Update the new activity input names and ids
            activityNameInput.name = `activity_name[]`;
            activityDateInput.name = `activity_date[]`;

            // Clear the new inputs
            activityNameInput.value = '';
            activityDateInput.value = '';

            return newEntry;
        };

        // Get the button for adding more activities within the specific modal context
        const addMoreButton = modal.querySelector('.add-more-activities');
        const activityContainer = modal.querySelector('.add-activities-container');

        addMoreButton.addEventListener('click', function () {
            const originalEntry = activityContainer.querySelector('.activity-entry');
            const newEntry = cloneActivityEntry(originalEntry);

            // Insert the new entry and update restrictions
            activityContainer.insertBefore(newEntry, addMoreButton);
            activityIndex++;
            // Call any function to update activity date restrictions if needed
            updateActivityDateRestrictions();
        });
    };

    // Initialize the handler for addEventsModal
    const addEventsModal = document.getElementById('addEventsModal');
    if (addEventsModal) {
        handleAddMoreActivities(addEventsModal);
    }

    // Initialize the handler for addActivitiesModal
    const addActivitiesModal = document.getElementById('addActivitiesModal');
    if (addActivitiesModal) {
        handleAddMoreActivities(addActivitiesModal);
    }
});
