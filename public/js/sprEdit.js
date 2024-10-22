document.addEventListener('DOMContentLoaded', function () {
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

    const today = new Date().toISOString().split('T')[0];

    document.getElementById('startDateEvent').setAttribute('min', today);

    document.getElementById('startDateEvent').addEventListener('change', function () {
        const startDate = this.value;

        document.getElementById('endDateEvent').value = '';
        document.getElementById('endDateEvent').setAttribute('min', startDate);

        // Optionally, set a maximum limit of 6 days after the start date
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 6);
        document.getElementById('endDateEvent').setAttribute('max', maxEndDate.toISOString().split('T')[0]);
    });

    disableAllCheckboxes();
    disableAllAssignRoles();
    disableVerifyButton();
});