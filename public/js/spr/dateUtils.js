document.addEventListener('DOMContentLoaded', function () {
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
});