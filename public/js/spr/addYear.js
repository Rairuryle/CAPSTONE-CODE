document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("addYearForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const startYear = document.getElementById("academicYear").value;
        if (!startYear) return;

        const academicYearData = { academic_year: startYear };

        try {
            const response = await fetch('/event/academic_year', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(academicYearData),
            });

            if (!response.ok) {
                throw new Error('Error adding year: ' + response.statusText);
            }

            // Optional: Handle the response from the server
            const result = await response.json();
            console.log(result.message);

            location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            document.getElementById("academicYear").value = "";

            const addYearModal = bootstrap.Modal.getInstance(document.getElementById("addYearModal"));
            addYearModal.hide();
        }
    });
});