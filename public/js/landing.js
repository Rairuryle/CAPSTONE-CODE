$(document).ready(function () {
    // Toggle password visibility for all password fields with the class `password-input`
    $(".togglePassword").on('click', function (event) {
        event.preventDefault();
        let passwordInput = $(this).closest('.input-group').find('.password-input');
        let icon = $(this).find('i');
        if (passwordInput.attr("type") === "password") {
            passwordInput.attr('type', 'text');
            icon.removeClass("fa-eye-slash").addClass("fa-eye");
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass("fa-eye").addClass("fa-eye-slash");
        }
    });
});


let lastSelectedButton = null; // Variable to track the last selected button

document.addEventListener('click', function (e) {
    // Check if a dropdown item was clicked
    if (e.target.classList.contains('dropdown-item')) {
        const dropdownMenu = e.target.closest('.dropdown-menu');
        const dropdownButton = dropdownMenu.previousElementSibling;
        const dropdownId = dropdownButton.getAttribute('data-dropdown-id');
        const button = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);

        // Reset previous active button if it exists
        if (lastSelectedButton && lastSelectedButton !== button) {
            lastSelectedButton.innerText = lastSelectedButton.getAttribute('data-original-text');
            lastSelectedButton.classList.remove('active-style');
        }

        // Set new active button
        button.innerText = e.target.innerText;
        button.classList.add('active-style');
        lastSelectedButton = button;

        // Update the hidden input field with the selected organization
        document.getElementById('organizationRegister').value = e.target.innerText;
    }

    // Check if one of the primary organization buttons (SAO, USG, CSO) was clicked
    if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('dropdown-toggle') && !e.target.classList.contains('btn-reset')) {
        if (lastSelectedButton && lastSelectedButton !== e.target) {
            lastSelectedButton.classList.remove('active-style');
        }

        e.target.classList.add('active-style');
        lastSelectedButton = e.target;

        // Update the hidden input field with the selected organization
        document.getElementById('organizationRegister').value = e.target.innerText;
    }
});

// Store the original text values of the buttons for resetting later
document.querySelectorAll('.dropdown-toggle').forEach((btn) => {
    btn.setAttribute('data-original-text', btn.innerText);
});

document.querySelector('.btn-reset').addEventListener('click', function (e) {
    e.preventDefault();

    // Clear input fields
    document.querySelectorAll('input[type="text"], input[type="password"]').forEach((input) => {
        input.value = '';
    });

    // Reset all dropdown buttons to their original text
    document.querySelectorAll('.dropdown-toggle').forEach((btn) => {
        btn.innerText = btn.getAttribute('data-original-text');
    });

    // Reset active styles on primary organization buttons
    document.querySelectorAll('.btn-org').forEach((btn) => {
        btn.classList.remove('active-style');
    });

    document.getElementById('organizationRegister').value = '';

    // Reset the lastSelectedButton variable
    lastSelectedButton = null;
});