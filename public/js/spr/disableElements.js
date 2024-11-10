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

    function disableImportFileButton() {
        const importFileCard = document.querySelector('.import-file-card');
        const importFileButton = document.querySelector('.btn-import-file');
        importFileButton.disabled = true;
        importFileCard.style.backgroundColor = "#b0b0b0";
        importFileButton.style.color = "white";
        importFileButton.style.border = "none";
    }

    function disableVerifyButton() {
        const verifyButton = document.querySelector('.btn-verify-points');
        verifyButton.disabled = true;
        verifyButton.style.backgroundColor = "gray";
        verifyButton.style.color = "white";
        verifyButton.style.border = "none";
    }

    const activeStatus = document.getElementById('activeStatus').textContent;
    const exemptionStatus = document.getElementById('exemptionStatus').textContent;
    const currentPath = window.location.pathname;

    if (activeStatus === 'Inactive' || exemptionStatus === 'Exempted' || currentPath === '/spr-edit') {
        disableAllCheckboxes();
        disableAllAssignRoles();
        disableImportFileButton();
        disableVerifyButton();
    }
});