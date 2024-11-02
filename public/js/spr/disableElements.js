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

    disableAllCheckboxes();
    disableAllAssignRoles();
    disableVerifyButton();
});