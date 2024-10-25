document.addEventListener('DOMContentLoaded', function () {
    const errorResponse = document.getElementById("resultResponse");
    errorResponse.classList.add("slide-in");

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});