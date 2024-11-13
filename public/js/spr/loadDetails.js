document.addEventListener('DOMContentLoaded', function () {
    function updateURLWithEventScope() {
        const scopeElementDefault = document.getElementById('eventScope');
        const scopeElementAutomatic = document.getElementById('eventScopeAutomatic');
        const scopeElementAutomaticOrganization = document.getElementById('eventScopeAutomaticOrganization');
        const selectEventScope = document.getElementById('selectEventScope');
        const isUSG = document.querySelector('#isUSG').value === "true";

        let scope;

        if (scopeElementAutomatic && isUSG) {
            scope = scopeElementAutomatic.value;
        } else if (scopeElementDefault) {
            scope = scopeElementDefault.value;
        } else if (selectEventScope && selectEventScope.value) {
            scope = selectEventScope.value;
        } else if (scopeElementAutomaticOrganization) {
            scope = scopeElementAutomaticOrganization.value;
        }

        if (scope) {
            console.log("Setting Scope Value:", scope);
            const url = new URL(window.location.href);
            url.searchParams.set('event_scope', scope);
            window.history.replaceState({}, '', url.toString());
            console.log("Updated URL:", url.toString());

            // Send the updated scope via AJAX
            fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => console.log('Backend response:', data))
                .catch(error => console.error('Error:', error));
        } else {
            console.log("No scope value determined.");
        }
    }

    // Function to set the selected event scope on page load
    function setSelectedEventScope() {
        const selectEventScope = document.getElementById('selectEventScope');
        const urlParams = new URLSearchParams(window.location.search);
        const eventScope = urlParams.get('event_scope');

        if (selectEventScope && eventScope) {
            selectEventScope.value = eventScope;

            // Update the label to reflect the selected scope
            const eventScopeLabel = document.getElementById('eventScopeLabel');
            eventScopeLabel.textContent = eventScope.toUpperCase() + ' EVENTS';
        }
    }

    // Call this function on page load
    setSelectedEventScope();
    updateURLWithEventScope();

    const selectEventScope = document.getElementById('selectEventScope');
    if (selectEventScope) {
        selectEventScope.addEventListener('change', updateURLWithEventScope);
    }

    window.updateYearText = function (selectedYear) {
        const dropdownButton = document.getElementById('selectYearDropdown');
        dropdownButton.innerHTML = selectedYear;

        const url = new URL(window.location.href);
        const idParam = url.searchParams.get('id');
        if (idParam) {
            url.searchParams.set('id', idParam);
        }
        url.searchParams.set('academic_year', selectedYear);

        const selectEventScope = document.getElementById('selectEventScope');
        if (selectEventScope) {
            const selectedScope = selectEventScope.value;
            url.searchParams.set('event_scope', selectedScope);
        }

        window.location.href = url.toString();
    };

    window.updateSemesterText = function (selectedSem) {
        const dropdownButton = document.getElementById('selectSemDropdown');
        dropdownButton.innerHTML = selectedSem;

        const url = new URL(window.location.href);
        const academicYear = url.searchParams.get('academic_year');
        if (academicYear) {
            url.searchParams.set('academic_year', academicYear);
        }
        url.searchParams.set('semester', selectedSem);

        const selectEventScope = document.getElementById('selectEventScope');
        if (selectEventScope) {
            const selectedScope = selectEventScope.value;
            url.searchParams.set('event_scope', selectedScope);
        }

        window.location.href = url.toString();
    };

    window.showEventDetails = function (eventId, eventDays, eventName, eventStartDate, eventEndDate, toVerify) {
        console.log("showEventDetails called with eventId:", eventId);
        console.log("Days:", eventDays);
        console.log("Name:", eventName);
        console.log("Start Date:", eventStartDate);
        console.log("End Date:", eventEndDate);
        console.log("To Verify:", toVerify)

        // Populate the dropdown
        const selectEventDayDropdown = document.getElementById('selectEventDay');
        selectEventDayDropdown.innerHTML = '<option disabled="disabled" selected="selected">Select Event Day</option>';

        for (let day = 1; day <= eventDays; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = `Day ${day}`;
            selectEventDayDropdown.appendChild(option);
            console.log("day", day);
        }

        loadEventDetails(eventId, eventDays, eventName, eventStartDate, eventEndDate, toVerify);
    };

    // Function to load event details and redirect
    function loadEventDetails(eventId, eventDays, eventName, eventStartDate, eventEndDate, toVerify) {
        const currentYear = document.getElementById('selectYearDropdown').innerText || "Select Year";
        const currentSemester = document.getElementById('selectSemDropdown').innerText || "Select Sem";
        const studentId = getStudentIdFromUrl();

        const currentPath = window.location.pathname.includes('spr-edit') ? 'spr-edit' : 'spr-main';

        // Construct the URL with the correct path and maintain the event scope
        const url = new URL(`/${currentPath}?id=${studentId}&event_id=${eventId}`, window.location.origin);
        url.searchParams.set('academic_year', currentYear);
        url.searchParams.set('semester', currentSemester);
        url.searchParams.set('event_days', eventDays);
        url.searchParams.set('event_name', eventName);
        url.searchParams.set('event_start_date', eventStartDate);
        url.searchParams.set('event_end_date', eventEndDate);
        url.searchParams.set('to_verify', toVerify);

        // Preserve the event scope in the URL
        const selectEventScope = document.getElementById('selectEventScope');
        if (selectEventScope) {
            const selectedScope = selectEventScope.value;
            url.searchParams.set('event_scope', selectedScope);
        }

        window.location.href = url.toString();
    }

    // Helper function to extract the student ID from the URL
    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});
