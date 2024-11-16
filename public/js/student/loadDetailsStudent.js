document.addEventListener('DOMContentLoaded', function () {
    function updateURLWithEventScope() {
        const selectEventScope = document.getElementById('selectEventScope');
        const scope = selectEventScope ? selectEventScope.value : null;
    
        if (scope) {
            console.log("Setting Scope Value:", scope);
            const url = new URL(window.location.href);
            url.searchParams.set('event_scope', scope);
    
            // Reload the page with the updated URL
            window.location.href = url.toString();
    
            console.log("Updated URL:", url.toString());
    
            const eventScopeLabel = document.getElementById('eventScopeLabel');
            if (eventScopeLabel) {
                eventScopeLabel.textContent = scope.toUpperCase() + ' EVENTS';
            }
        } else {
            console.log("No scope value determined.");
        }
    }
    

    function setSelectedEventScope() {
        const selectEventScope = document.getElementById('selectEventScope');
        const urlParams = new URLSearchParams(window.location.search);
        const eventScope = urlParams.get('event_scope');
    
        if (selectEventScope && eventScope && selectEventScope.value !== eventScope) {
            selectEventScope.value = eventScope;
    
            const eventScopeLabel = document.getElementById('eventScopeLabel');
            if (eventScopeLabel) {
                eventScopeLabel.textContent = eventScope.toUpperCase() + ' EVENTS';
            }
        }
    }

    setSelectedEventScope();

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

    window.showEventDetails = function (eventId, eventDays, eventName, eventStartDate, eventEndDate) {
        console.log("showEventDetails called with eventId:", eventId);
        console.log("Days:", eventDays);
        console.log("Name:", eventName);
        console.log("Start Date:", eventStartDate);
        console.log("End Date:", eventEndDate);

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

        loadEventDetails(eventId, eventDays, eventName, eventStartDate, eventEndDate);
    };

    function loadEventDetails(eventId, eventDays, eventName, eventStartDate, eventEndDate) {
        const currentYear = document.getElementById('selectYearDropdown').innerText || "Select Year";
        const currentSemester = document.getElementById('selectSemDropdown').innerText || "Select Sem";
        const studentId = getStudentIdFromUrl();

        const url = new URL(`/spr-student?id_number=${studentId}&event_id=${eventId}`, window.location.origin);
        url.searchParams.set('academic_year', currentYear);
        url.searchParams.set('semester', currentSemester);
        url.searchParams.set('event_days', eventDays);
        url.searchParams.set('event_name', eventName);
        url.searchParams.set('event_start_date', eventStartDate);
        url.searchParams.set('event_end_date', eventEndDate);

        // Preserve the event scope in the URL
        const selectEventScope = document.getElementById('selectEventScope');
        if (selectEventScope) {
            const selectedScope = selectEventScope.value;
            url.searchParams.set('event_scope', selectedScope);
        }

        window.location.href = url.toString();
    }


    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        let studentId = urlParams.get('id_number');
        if (!studentId) {
            studentId = document.getElementById('studentId')?.value;
        }
        return studentId;
    }
});