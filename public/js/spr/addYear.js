document.addEventListener('DOMContentLoaded', function () {
    function updateYearText(year) {
        const [startYear] = year.split('-');
        const formattedYear = `${startYear}-${parseInt(startYear) + 1}`;
        const dropdownButton = document.getElementById("selectYearDropdown");
        dropdownButton.textContent = formattedYear;
    }

    // If there's an initial value for selectedYear, update the dropdown button text on page load
    const initialYear = document.getElementById("selectYearDropdown").textContent.trim();
    if (initialYear.length === 4) {  // If the year is in the "YYYY" format
        const formattedYear = `${initialYear}-${parseInt(initialYear) + 1}`;
        document.getElementById("selectYearDropdown").textContent = formattedYear;
    }

    document.getElementById("addYearForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const startYear = document.getElementById("academicYear").value;
        if (!startYear) return;

        // Format the selected year as "YYYY-YYYY"
        const formattedYear = `${startYear}-${parseInt(startYear) + 1}`;

        const academicYearData = { academic_year: formattedYear };

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
