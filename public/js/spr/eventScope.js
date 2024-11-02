document.addEventListener('DOMContentLoaded', function () {
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