document.addEventListener('DOMContentLoaded', function () {
    const sortSelect = document.getElementById('sortList');
    const selectedStudentsContainer = document.querySelector('.student-details-row'); // Adjust the selector as needed
    const searchInput = document.getElementById('searchInput');

    let filteredStudents = [...selectedStudents]; // Create a copy of the original student list

    function renderStudents(students) {
        selectedStudentsContainer.innerHTML = ''; // Clear the current list
        students.forEach((student, index) => {
            const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
            selectedStudentsContainer.innerHTML += `
            <div class="student-row d-flex" data-abo-name="${student.abo_name}">
                    <div class="col-5 p-0 ps-2">
                        <p class="studentDetails m-0 py-1 w-100 ${rowClass}">${student.last_name}, ${student.first_name}</p>
                    </div>
                    <div class="col-3 p-0">
                        <p class="studentDetails m-0 py-1 w-100 ${rowClass}">${student.id_number}</p>
                    </div>
                    <div class="col-3 p-0">
                        <p class="studentDetails m-0 py-1 w-100 ${rowClass}">${student.course_name}</p>
                    </div>
                    <div class="col-1 p-0">
                        <p class="studentDetails m-0 py-1 w-100 ${rowClass}">${student.year_level}</p>
                    </div>
            </div>
        `;
        });
    }

    function filterStudents() {
        const searchTerm = searchInput.value.toLowerCase();

        // Filter students based on the search term
        filteredStudents = selectedStudents.filter(student =>
            student.last_name.toLowerCase().includes(searchTerm) ||
            student.id_number.toLowerCase().includes(searchTerm)
        );

        renderStudents(filteredStudents);
    }

    sortSelect.addEventListener('change', function () {
        const sortValue = this.value;

        if (sortValue === "Name") {
            filteredStudents.sort((a, b) => a.last_name.localeCompare(b.last_name));
        } else if (sortValue === "ID Number") {
            filteredStudents.sort((a, b) => a.id_number.localeCompare(b.id_number));
        } else if (sortValue === "Course") {
            filteredStudents.sort((a, b) => a.course_name.localeCompare(b.course_name));
        } else if (sortValue === "Year") {
            filteredStudents.sort((a, b) => a.year_level - b.year_level);
        }

        renderStudents(filteredStudents);
    });

    searchInput.addEventListener('input', filterStudents);

    // Initial render
    renderStudents(selectedStudents);
});