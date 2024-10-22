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