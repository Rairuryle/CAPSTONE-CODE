document.addEventListener('DOMContentLoaded', function () {
    // edit events button
    const editButtons = document.querySelectorAll(".edit-event-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            const eventName = this.getAttribute("data-event-name");
            let eventStart = this.getAttribute("data-event-start");
            let eventEnd = this.getAttribute("data-event-end");

            // Convert dates to 'YYYY-MM-DD' format without using `toISOString()`
            eventStart = new Date(eventStart);
            eventEnd = new Date(eventEnd);

            const formattedStartDate = `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`;
            const formattedEndDate = `${eventEnd.getFullYear()}-${String(eventEnd.getMonth() + 1).padStart(2, '0')}-${String(eventEnd.getDate()).padStart(2, '0')}`;

            document.getElementById("editEventNameInput").value = eventName;
            document.getElementById("editStartDateEvent").value = formattedStartDate;
            document.getElementById("editEndDateEvent").value = formattedEndDate;

            console.log("Formatted Event Start Date:", formattedStartDate);
            console.log("Formatted Event End Date:", formattedEndDate);
        });
    });

    const editEventNameInput = document.getElementById("editEventNameInput");
    const deleteEventButtons = document.querySelectorAll(".btn-delete-event");

    deleteEventButtons.forEach(button => {
        button.addEventListener("click", function () {
            const eventNames = document.querySelectorAll(".event-name-to-delete");
            eventNames.forEach(eventName => {
                eventName.textContent = editEventNameInput.value;
            });
        });
    });
});