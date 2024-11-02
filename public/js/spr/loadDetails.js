document.addEventListener('DOMContentLoaded', function () {
    function updateURLWithEventScope() {
        const scopeElementDefault = document.getElementById('eventScope');
        const scopeElementAutomatic = document.getElementById('eventScopeAutomatic');
        const isUSG = document.querySelector('#isUSG').value === "true";
        
        let scope;

        if (scopeElementDefault || scopeElementAutomatic) {
            if (isUSG) {
                scope = scopeElementAutomatic.value; // Use .value for input elements
            } else {
                scope = scopeElementDefault.value;
            }
            console.log("Scope Value:", scope);

            const url = new URL(window.location.href);
            url.searchParams.set('event_scope', scope);
            window.history.replaceState({}, '', url.toString());
        } else {
            console.log("Neither #eventScopeAutomatic nor #eventScope were found in the DOM.");
        }
    }

    // Call the function to update the URL with event scope on page load
    updateURLWithEventScope();

    window.updateYearText = function (selectedYear) {
        const dropdownButton = document.getElementById('selectYearDropdown');
        dropdownButton.innerHTML = selectedYear;

        const url = new URL(window.location.href);
        const idParam = url.searchParams.get('id');
        if (idParam) {
            url.searchParams.set('id', idParam);
        }
        url.searchParams.set('academic_year', selectedYear);
        window.location.href = url.toString();
    }

    window.updateSemesterText = function (selectedSem) {
        const dropdownButton = document.getElementById('selectSemDropdown');
        dropdownButton.innerHTML = selectedSem;

        const url = new URL(window.location.href);
        const academicYear = url.searchParams.get('academic_year');
        if (academicYear) {
            url.searchParams.set('academic_year', academicYear);
        }
        url.searchParams.set('semester', selectedSem);
        window.location.href = url.toString();
    }

    // Function to show event details when an event card is clicked
    window.showEventDetails = function (eventId) {
        console.log("showEventDetails called with eventId:", eventId);
        loadEventDetails(eventId);
    }

    // Function to load event details and redirect
    function loadEventDetails(eventId) {
        const currentYear = document.getElementById('selectYearDropdown').innerText || "Select Year";
        const currentSemester = document.getElementById('selectSemDropdown').innerText || "Select Sem";
        const studentId = getStudentIdFromUrl();

        const url = new URL(`/spr-edit?id=${studentId}&event_id=${eventId}`, window.location.origin);
        url.searchParams.set('academic_year', currentYear);
        url.searchParams.set('semester', currentSemester);
        window.location.href = url.toString();
    }

    // Helper function to extract the student ID from the URL
    function getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});
