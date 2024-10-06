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


let lastSelectedMainButton = null; // Track last selected main organization button
let lastSelectedDropdownButton = null; // Track last selected dropdown button

document.addEventListener('click', function (e) {
    // Check if a dropdown item was clicked
    if (e.target.classList.contains('dropdown-item')) {
        const dropdownMenu = e.target.closest('.dropdown-menu');
        const dropdownButton = dropdownMenu.previousElementSibling;
        const dropdownId = dropdownButton.getAttribute('data-dropdown-id');
        const button = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);

        // Reset previous dropdown button if it exists and is not the same button
        if (lastSelectedDropdownButton && lastSelectedDropdownButton !== button) {
            lastSelectedDropdownButton.innerText = lastSelectedDropdownButton.getAttribute('data-original-text');
            lastSelectedDropdownButton.classList.remove('active-style');
        }

        // Set new active dropdown button
        button.innerText = e.target.innerText;
        button.classList.add('active-style');
        lastSelectedDropdownButton = button;

        // Remove active-style class from main buttons (SAO, USG, CSO)
        if (lastSelectedMainButton) {
            lastSelectedMainButton.classList.remove('active-style');
            lastSelectedMainButton = null; // Clear the main button selection
        }

        // Update the hidden input field with the selected organization
        document.getElementById('organizationRegister').value = e.target.innerText;
    }

    // Check if one of the primary organization buttons (SAO, USG, CSO) was clicked
    if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('dropdown-toggle') && !e.target.classList.contains('btn-reset')) {
        // Reset previous main button if it exists and is not the same button
        if (lastSelectedMainButton && lastSelectedMainButton !== e.target) {
            lastSelectedMainButton.classList.remove('active-style');
        }

        // Set new active main button
        e.target.classList.add('active-style');
        lastSelectedMainButton = e.target;

        // Remove active-style from dropdown buttons if a main button is clicked
        if (lastSelectedDropdownButton) {
            lastSelectedDropdownButton.classList.remove('active-style');
            lastSelectedDropdownButton.innerText = lastSelectedDropdownButton.getAttribute('data-original-text');
            lastSelectedDropdownButton = null; // Clear the dropdown button selection
        }

        // Update the hidden input field with the selected organization
        document.getElementById('organizationRegister').value = e.target.innerText;
    }
});

// Store the original text values of the dropdown buttons for resetting later
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