document.addEventListener('DOMContentLoaded', function () {
    // disabling
    function disableAllCheckboxes() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }

    function disableAllAssignRoles() {
        const assignRoles = document.querySelectorAll('.assign-role');
        assignRoles.forEach(assignRole => {
            assignRole.disabled = true;
            assignRole.style.backgroundColor = "gray";
            assignRole.style.color = "white";
        });
    }

    function disableVerifyButton() {
        const verifyButton = document.querySelector('.btn-verify-points');
        verifyButton.disabled = true;
        verifyButton.style.backgroundColor = "gray";
        verifyButton.style.color = "white";
    }

    disableAllCheckboxes();
    disableAllAssignRoles();
    disableVerifyButton();

    // date picker
    // Function to update activity date min and max based on event dates
    function updateActivityDateRestrictions() {
        const startDate = document.getElementById('startDateEvent').value;
        const endDate = document.getElementById('endDateEvent').value;
        const activityDateInputs = document.querySelectorAll('input[name^="activity_date"]');

        activityDateInputs.forEach(input => {
            input.setAttribute('min', startDate);
            input.setAttribute('max', endDate);
        });
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDateEvent').setAttribute('min', today);

    document.getElementById('startDateEvent').addEventListener('change', function () {
        const startDate = this.value;

        // Clear the end date and set min attribute to startDate
        document.getElementById('endDateEvent').value = '';
        document.getElementById('endDateEvent').setAttribute('min', startDate);

        // Optionally, set a maximum limit of 6 days after the start date
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 6);
        document.getElementById('endDateEvent').setAttribute('max', maxEndDate.toISOString().split('T')[0]);

        updateActivityDateRestrictions();
    });

    document.getElementById('endDateEvent').addEventListener('change', function () {
        updateActivityDateRestrictions();
    });


    // Add more activities
    let activityIndex = 1;

    // Function to clone activity entry
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

    // event scope
    function handleUSGOrOtherScope() {
        const eventScopeLabel = document.getElementById('eventScopeLabel');
        const eventCards = document.querySelectorAll('.event-card');
        const adminOrganization = document.getElementById('adminOrganization').textContent;
        const isUSG = document.querySelector('#isUSG').value === "true";

        let scope;
        if (isUSG) {
            scope = 'INSTITUTIONAL';
        } else {
            scope = adminOrganization;
        }

        // Update the label
        eventScopeLabel.textContent = scope.toUpperCase() + ' EVENTS';

        eventCards.forEach(card => {
            const eventScope = card.getAttribute('data-scope');

            if (eventScope === scope) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    handleUSGOrOtherScope();
});