document.addEventListener('DOMContentLoaded', function () {
    const sortSelect = document.getElementById('sortList');
    const selectedStudentsContainer = document.querySelector('.student-details-row');
    const searchInput = document.getElementById('searchInput');
    const selectedAboContainer = document.getElementById('selectedAbo');

    let filteredStudents = [...selectedStudents];

    function renderStudents(students) {
        selectedStudentsContainer.innerHTML = '';
        students.forEach((student, index) => {
            const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
            selectedStudentsContainer.innerHTML += `
                <div class="student-row" data-abo-name="${student.abo_name}">
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
        filteredStudents = selectedStudents.filter(student =>
            student.last_name.toLowerCase().includes(searchTerm) ||
            student.id_number.toLowerCase().includes(searchTerm)
        );
        renderStudents(filteredStudents);
    }

    selectedStudentsContainer.addEventListener('click', function (event) {
        const target = event.target.closest('.student-row');
        console.log('target:', target); // Debugging line
        if (target) {
            const aboName = target.getAttribute('data-abo-name');
            console.log('aboName:', aboName); // Debugging line
            selectedAboContainer.innerText = `Selected ABO Name: ${aboName}`;
        }
    });

    sortSelect.addEventListener('change', function () {
        const sortValue = this.value;
        if (sortValue === "Name") {
            filteredStudents.sort((a, b) => a.last_name.localeCompare(b.last_name));
        } else if (sortValue === "ID Number") {
            filteredStudents.sort((a, b) => a.id_number - b.id_number);
        } else if (sortValue === "Course") {
            filteredStudents.sort((a, b) => a.course_name.localeCompare(b.course_name));
        } else if (sortValue === "Year") {
            filteredStudents.sort((a, b) => a.year_level - b.year_level);
        }
        renderStudents(filteredStudents);
    });

    searchInput.addEventListener('input', filterStudents);
    renderStudents(selectedStudents);
});