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

            const selectedRole = assignRole.value;

            if (selectedRole === "INDIV. Participant" || selectedRole === "OTH. Spectator" || selectedRole === "BLUE Stamp") {
                assignRole.style.backgroundColor = "blue";
                assignRole.style.color = "white";
            } else if (selectedRole === "TEAM Participant" || selectedRole === "PROG. Spectator" || selectedRole === "RED Stamp") {
                assignRole.style.backgroundColor = "red";
                assignRole.style.color = "white";
            } else if (selectedRole === "VIOLET Stamp") {
                assignRole.style.backgroundColor = "#7f00ff";
                assignRole.style.color = "white";
            }
        });
    }

    disableAllCheckboxes();
    disableAllAssignRoles();

});