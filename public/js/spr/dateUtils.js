document.addEventListener('DOMContentLoaded', function () {
    // add events modal
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

        // maximum limit of 6 days after the start date
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 6);
        document.getElementById('endDateEvent').setAttribute('max', maxEndDate.toISOString().split('T')[0]);

        updateActivityDateRestrictions();
    });

    document.getElementById('endDateEvent').addEventListener('change', function () {
        updateActivityDateRestrictions();
    });


    // add activities modal
    const addActivitiesModal = document.getElementById('addActivitiesModal');

    addActivitiesModal.addEventListener('show.bs.modal', function () {

        function formatDateToYYYYMMDD(dateString) {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`; // YYYY-MM-DD format
        }

        function updateActivityDateRestrictions(startDate, endDate) {
            const activityDateInputs = document.querySelectorAll('input[name^="activity_date"]');
            console.log("Activity Date Inputs:", activityDateInputs);
            console.log("Start Date:", startDate);

            // convert dates to YYYY-MM-DD
            const formattedStartDate = formatDateToYYYYMMDD(startDate);
            const formattedEndDate = formatDateToYYYYMMDD(endDate);

            activityDateInputs.forEach(input => {
                input.setAttribute('min', formattedStartDate);
                input.setAttribute('max', formattedEndDate);
                input.value = '';
            });
        }

        // get values from hidden inputs
        const eventDateStart = document.getElementById('eventStartDate').value;
        const eventDateEnd = document.getElementById('eventEndDate').value;

        console.log("Event Start Date:", eventDateStart);
        console.log("Event End Date:", eventDateEnd);

        if (eventDateStart && eventDateEnd) {
            updateActivityDateRestrictions(eventDateStart, eventDateEnd);
        }
    });

    // edit activities modal
    const editActivitiesModal = document.getElementById('editActivitiesModal');

    editActivitiesModal.addEventListener('show.bs.modal', function () {

        // format date to YYYY-MM-DD
        function formatDateToYYYYMMDD(dateString) {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`; // YYYY-MM-DD format
        }

        // update date restrictions on activity date input
        function updateActivityDateRestrictions(startDate, endDate) {
            const activityDateInput = document.getElementById('editActivityDate');

            // Convert start and end dates to YYYY-MM-DD format
            const formattedStartDate = formatDateToYYYYMMDD(startDate);
            const formattedEndDate = formatDateToYYYYMMDD(endDate);

            // Set min and max date attributes for the activity date input
            activityDateInput.setAttribute('min', formattedStartDate);
            activityDateInput.setAttribute('max', formattedEndDate);
            activityDateInput.value = '';
        }

        // Get event start and end date values from hidden inputs
        const eventDateStart = document.getElementById('eventStartDate').value;
        const eventDateEnd = document.getElementById('eventEndDate').value;

        console.log("Event Start Date:", eventDateStart);
        console.log("Event End Date:", eventDateEnd);

        if (eventDateStart && eventDateEnd) {
            updateActivityDateRestrictions(eventDateStart, eventDateEnd);
        }
    });
});