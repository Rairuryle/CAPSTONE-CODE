document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll(".edit-event-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            const eventId = this.getAttribute("data-event-id");
            const eventName = this.getAttribute("data-event-name");
            let eventStart = this.getAttribute("data-event-start");
            let eventEnd = this.getAttribute("data-event-end");

            // Convert dates to 'YYYY-MM-DD' format without using `toISOString()`
            eventStart = new Date(eventStart);
            eventEnd = new Date(eventEnd);

            const formattedStartDate = `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`;
            const formattedEndDate = `${eventEnd.getFullYear()}-${String(eventEnd.getMonth() + 1).padStart(2, '0')}-${String(eventEnd.getDate()).padStart(2, '0')}`;

            document.getElementById("editEventID").value = eventId;
            document.getElementById("deleteEventID").value = eventId;
            document.getElementById("editEventNameInput").value = eventName;
            document.getElementById("editStartDateEvent").value = formattedStartDate;
            document.getElementById("editEndDateEvent").value = formattedEndDate;

            console.log("Formatted Event Start Date:", formattedStartDate);
            console.log("Formatted Event End Date:", formattedEndDate);

            // Update the end date range based on the formatted start date
            updateEndDateRange(formattedStartDate);
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

    const startDateInput = document.getElementById('editStartDateEvent');
    const endDateInput = document.getElementById('editEndDateEvent');

    // Get today's date in 'YYYY-MM-DD' format
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Set min date for start date to today
    startDateInput.min = formattedToday;

    // Function to update the end date range based on a given start date
    function updateEndDateRange(formattedStartDate) {
        if (formattedStartDate) {
            const start = new Date(formattedStartDate);
            const maxEndDate = new Date(start);
            maxEndDate.setDate(maxEndDate.getDate() + 6);

            endDateInput.min = formattedStartDate;
            endDateInput.max = maxEndDate.toISOString().split('T')[0];
            endDateInput.disabled = false; // Enable the end date field
        } else {
            endDateInput.value = ""; // Clear end date if no start date is selected
            endDateInput.disabled = true; // Disable end date input
        }
    }

    // Update end date range when the start date changes
    startDateInput.addEventListener('change', function () {
        const selectedStartDate = startDateInput.value;
        updateEndDateRange(selectedStartDate);
    });

    // Initialize end date range on page load or modal open
    updateEndDateRange(null);

    // Update event
    document.querySelector('.btn-edit-event-submit').addEventListener('click', function (event) {
        event.preventDefault();

        const eventId = document.getElementById('editEventID').value;
        const updatedEventName = document.getElementById('editEventNameInput').value;
        const updatedEventStart = document.getElementById('editStartDateEvent').value;
        const updatedEventEnd = document.getElementById('editEndDateEvent').value;

        fetch('/event/update-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_id: eventId,
                event_name: updatedEventName,
                event_date_start: updatedEventStart,
                event_date_end: updatedEventEnd
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Event updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating event: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update event');
            });
    });

    // delete event
    document.querySelector('.btn-delete-event-submit').addEventListener('click', function (event) {
        event.preventDefault();

        const deletedEventId = document.getElementById('deleteEventID').value;
        console.log("Deleted Event ID:", deletedEventId);

        fetch('/event/delete-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_id: deletedEventId
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Event deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error deleting event: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete event');
            });
    });
});