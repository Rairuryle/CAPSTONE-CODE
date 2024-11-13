document.addEventListener('DOMContentLoaded', function () {
    const handleAddMoreActivities = (modal) => {
        let activityIndex = 1;
        
        const cloneActivityEntry = (originalEntry) => {
            const newEntry = originalEntry.cloneNode(true);
            const activityNameInput = newEntry.querySelector('input[name^="activity_name"]');
            const activityDateInput = newEntry.querySelector('input[name^="activity_date"]');

            activityNameInput.name = `activity_name[]`;
            activityDateInput.name = `activity_date[]`;
            activityNameInput.value = '';
            activityDateInput.value = '';

            const deleteIcon = newEntry.querySelector('.delete-activity-icon');
            deleteIcon.addEventListener('click', () => removeActivityRow(newEntry));

            return newEntry;
        };

        const addMoreButton = modal.querySelector('.add-more-activities');
        const activityContainer = modal.querySelector('.add-activities-container');
        const toVerifyDropdown = modal.querySelector('#toVerifyDropdown');

        const setActivityFields = (requiredCount) => {
            while (activityContainer.querySelectorAll('.activity-entry').length < requiredCount) {
                const originalEntry = activityContainer.querySelector('.activity-entry');
                const newEntry = cloneActivityEntry(originalEntry);
                activityContainer.insertBefore(newEntry, addMoreButton);
                activityIndex++;
            }
            while (activityContainer.querySelectorAll('.activity-entry').length > requiredCount) {
                activityContainer.removeChild(activityContainer.lastElementChild.previousElementSibling);
                activityIndex--;
            }
        };

        const removeActivityRow = (row) => {
            if (activityContainer.querySelectorAll('.activity-entry').length > 1) {
                row.remove();
                activityIndex--;
            }
        };

        toVerifyDropdown.addEventListener('change', function () {
            const requiredActivities = parseInt(toVerifyDropdown.value, 10) || 0;
            setActivityFields(requiredActivities);
        });

        addMoreButton.addEventListener('click', function () {
            const originalEntry = activityContainer.querySelector('.activity-entry');
            const newEntry = cloneActivityEntry(originalEntry);
            activityContainer.insertBefore(newEntry, addMoreButton);
            activityIndex++;
            updateActivityDateRestrictions();
        });

        // Initialize delete icon event for the first entry
        const initialDeleteIcon = activityContainer.querySelector('.delete-activity-icon');
        if (initialDeleteIcon) {
            initialDeleteIcon.addEventListener('click', function () {
                removeActivityRow(initialDeleteIcon.closest('.activity-entry'));
            });
        }
    };

    const addEventsModal = document.getElementById('addEventsModal');
    if (addEventsModal) {
        handleAddMoreActivities(addEventsModal);
    }

    const addActivitiesModal = document.getElementById('addActivitiesModal');
    if (addActivitiesModal) {
        handleAddMoreActivities(addActivitiesModal);
    }
});
