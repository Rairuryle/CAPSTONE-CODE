document.addEventListener('DOMContentLoaded', function() {
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
});