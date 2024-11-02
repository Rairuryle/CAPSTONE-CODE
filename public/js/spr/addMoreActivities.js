document.addEventListener('DOMContentLoaded', function () {
    // Add more activities
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

    document.querySelector('.add-more-activities').addEventListener('click', function () {
        const originalEntry = document.querySelector('.activity-entry');
        const newEntry = cloneActivityEntry(originalEntry);

        // Insert the new entry and update restrictions
        document.querySelector('.add-activities-container').insertBefore(newEntry, this);
        activityIndex++;
        updateActivityDateRestrictions();
    });
});