const selectEventScope = document.getElementById('selectEventScope');
const eventScopeAutomatic = document.getElementById('eventScopeAutomatic');
const eventScopeLabel = document.getElementById('eventScopeLabel');

// Function to update the label
function updateEventScopeLabel(value) {
    eventScopeLabel.textContent = value.toUpperCase();
}

// Check for automatic event scope (when there's no dropdown, just input field)
if (eventScopeAutomatic) {
    updateEventScopeLabel(eventScopeAutomatic.value);
}

// Handle select dropdown change
if (selectEventScope) {
    selectEventScope.addEventListener('change', function () {
        const selectedValue = selectEventScope.value;
        updateEventScopeLabel(selectedValue);
    });
}

// Function to filter event cards based on event scope
function filterEventCards(event_scope) {
    const eventCards = document.querySelectorAll('.event-card');

    eventCards.forEach(card => {
        const eventScope = card.getAttribute('data-scope');

        if (!event_scope || eventScope === event_scope) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

const isCollegeOrCSOorSAO = document.querySelector('#isCollegeOrCSOorSAO').value === "true";
const isUSG = document.querySelector('#isUSG').value === "true";

function handleSelectEventScope() {
    document.getElementById('selectEventScope').addEventListener('change', function () {
        const selectedScope = this.value;
        const eventScopeLabel = document.getElementById('eventScopeLabel');
        const eventCards = document.querySelectorAll('.event-card');

        console.log('Selected Scope: ', selectedScope);
        console.log('Event Scope Label: ', eventScopeLabel);

        // Update the label to display the selected scope
        eventScopeLabel.textContent = selectedScope ? selectedScope : 'All';

        eventCards.forEach(card => {
            const eventScope = card.getAttribute('data-scope');

            if (!selectedScope || eventScope === selectedScope) {
                card.style.display = 'block'; 
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function handleUSGOrOtherScope() {
    const eventScopeLabel = document.getElementById('eventScopeLabel');
    const eventCards = document.querySelectorAll('.event-card');
    const adminOrganization = document.getElementById('adminOrganization').textContent;

    let scope;
    if (isUSG) {
        scope = 'INSTITUTIONAL';
    } else {
        scope = adminOrganization;
    }

    // Update the label
    eventScopeLabel.textContent = scope;

    eventCards.forEach(card => {
        const eventScope = card.getAttribute('data-scope');

        if (eventScope === scope) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

if (isCollegeOrCSOorSAO) {
    handleSelectEventScope();
} else {
    handleUSGOrOtherScope();
}
