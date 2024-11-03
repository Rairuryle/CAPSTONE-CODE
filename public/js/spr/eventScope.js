document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/spr-edit')) {
        console.log("You are on the spr-edit page");

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
    } else if (currentPath.includes('/spr-main')) {
        console.log("You are on the spr-main page");
        const isCollegeOrCSOorSAO = document.querySelector('#isCollegeOrCSOorSAO').value === "true";
        const isUSG = document.querySelector('#isUSG').value === "true";

        function handleSelectEventScope() {
            const selectEventScope = document.getElementById('selectEventScope');
            selectEventScope.addEventListener('change', function () {
                const selectedScope = this.value;
                const eventScopeLabel = document.getElementById('eventScopeLabel');
                const eventCards = document.querySelectorAll('.event-card');

                console.log('Selected Scope: ', selectedScope);

                // Update the label to display the selected scope or hide it when no scope is selected
                if (selectedScope) {
                    eventScopeLabel.textContent = selectedScope.toUpperCase() + ' EVENTS';
                } else {
                    eventScopeLabel.textContent = ''; // Hide the label when no scope is selected
                }

                // Show or hide event cards based on the selected scope
                eventCards.forEach(card => {
                    const eventScope = card.getAttribute('data-scope');

                    if (selectedScope && eventScope === selectedScope) {
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

        if (isCollegeOrCSOorSAO) {
            handleSelectEventScope();
        } else {
            handleUSGOrOtherScope();
        }
    }
});
