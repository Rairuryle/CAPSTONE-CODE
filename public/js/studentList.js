document.addEventListener('DOMContentLoaded', function () {
    const isUSGorSAO = document.querySelector('#isUSGorSAO').value === "true";
    const isUSGorCSOorSAO = document.querySelector('#isUSGorCSOorSAO').value === "true";

    if (isUSGorCSOorSAO) {
        const collegeSelect = document.getElementById('selectGroupListCollege');
        const aboSelect = document.getElementById('selectGroupListABO');
        const iboSelect = document.getElementById('selectGroupListIBO');
        const filterForm = document.getElementById('filterForm');

        // Function to reset other selects and submit form
        function resetOtherSelects(selectedSelect) {
            if (isUSGorSAO) {
                if (selectedSelect !== collegeSelect) {
                    collegeSelect.selectedIndex = 0; // Reset to default option
                }
            }
            if (selectedSelect !== aboSelect) {
                aboSelect.selectedIndex = 0; // Reset to default option
            }
            if (selectedSelect !== iboSelect) {
                iboSelect.selectedIndex = 0; // Reset to default option
            }
            filterForm.submit();
        }

        // Event listeners for each select
        if (isUSGorSAO) {
            collegeSelect.addEventListener('change', function () {
                resetOtherSelects(collegeSelect);
            });
        }

        aboSelect.addEventListener('change', function () {
            resetOtherSelects(aboSelect);
        });

        iboSelect.addEventListener('change', function () {
            resetOtherSelects(iboSelect);
        });
    }

    const sortSelect = document.getElementById('sortList');
    const selectedStudentsContainer = document.querySelector('.student-details-row');
    const searchInput = document.getElementById('searchInput');
    const selectedLastNameContainer = document.getElementById('selectedLastName');
    const selectedFirstNameContainer = document.getElementById('selectedFirstName');
    const selectedIDNumberContainer = document.getElementById('selectedIDNumber');
    const selectedDepartmentContainer = document.getElementById('selectedDepartment');
    const selectedCourseContainer = document.getElementById('selectedCourse');
    const selectedYearLevelContainer = document.getElementById('selectedYearLevel');
    const selectedABOContainer = document.getElementById('selectedABO');
    const selectedIBOContainer = document.getElementById('selectedIBO');
    const selectedExemptionStatusContainer = document.getElementById('selectedExemptionStatus');
    const selectedActiveStatusContainer = document.getElementById('selectedActiveStatus');

    let filteredStudents = [...selectedStudents];

    function renderStudents(students) {
        selectedStudentsContainer.innerHTML = '';
        students.forEach((student, index) => {
            const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
            selectedStudentsContainer.innerHTML += `
                <div class="student-row d-flex" data-last-name="${student.last_name}" data-first-name="${student.first_name}" data-id-number="${student.id_number}" data-exemption-status="${student.exemption_status}" data-active-status="${student.active_status}" data-department-name="${student.department_name}" data-course-name="${student.course_name}" data-year-level="${student.year_level}" data-abo-name="${student.abo_name}" data-ibo-name="${student.ibo_name}">
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
            student.first_name.toLowerCase().includes(searchTerm) ||
            student.id_number.toLowerCase().includes(searchTerm)
        );
        renderStudents(filteredStudents);
    }

    selectedStudentsContainer.addEventListener('click', function (event) {
        const target = event.target.closest('.student-row');
        if (target) {
            const lastName = target.getAttribute('data-last-name');
            const firstName = target.getAttribute('data-first-name');
            const idNumber = target.getAttribute('data-id-number');
            const exemptionStatus = target.getAttribute('data-exemption-status');
            const activeStatus = target.getAttribute('data-active-status');
            const departmentName = target.getAttribute('data-department-name');
            const courseName = target.getAttribute('data-course-name');
            const yearLevel = target.getAttribute('data-year-level');
            const aboName = target.getAttribute('data-abo-name');
            const iboName = target.getAttribute('data-ibo-name');

            selectedLastNameContainer.innerText = `${lastName}`;
            selectedFirstNameContainer.innerText = `${firstName}`;
            selectedIDNumberContainer.innerText = `${idNumber}`;
            selectedExemptionStatusContainer.innerText = `${exemptionStatus}`;
            selectedActiveStatusContainer.innerText = `${activeStatus}`;
            selectedDepartmentContainer.innerText = `${departmentName}`;
            selectedCourseContainer.innerText = `${courseName}`;
            selectedYearLevelContainer.innerText = `${yearLevel}`;
            selectedABOContainer.innerText = `${aboName}`;
            selectedIBOContainer.innerText = iboName ? iboName : 'None';

            const noStudentSelectedText = document.getElementById('noStudentSelectedText');
            noStudentSelectedText.classList.add("d-none");

            const studentGroupPrimaryInformationContainer = document.querySelector('.student-group-primary-information');
            studentGroupPrimaryInformationContainer.classList.remove("d-none");

            const studentGroupStatusContainer = document.querySelector('.student-group-status');
            studentGroupStatusContainer.classList.remove("d-none");
            studentGroupStatusContainer.classList.add("d-flex");

            const studentGroupListContainer = document.querySelector('.student-group-list');
            studentGroupListContainer.classList.remove("d-none");
            studentGroupListContainer.classList.add("d-flex");

            const btnViewRecord = document.querySelector('.btn-view-record');
            btnViewRecord.classList.remove("d-none");
            btnViewRecord.classList.add("d-flex");
        }
    });


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
    renderStudents(selectedStudents);

    const viewRecordButton = document.querySelector('.btn-view-record');
    viewRecordButton.addEventListener('click', async function () {
        const selectedIdNumber = selectedIDNumberContainer.innerText;
        const selectedDepartment = selectedDepartmentContainer.innerText;
        const selectedABO = selectedABOContainer.innerText;
        const selectedIBO = selectedIBOContainer.innerText;

        try {
            await fetch('/student/store-student-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_number: selectedIdNumber,
                    department_name: selectedDepartment,
                    abo_name: selectedABO,
                    ibo_name: selectedIBO,
                }),
            });

            window.location.href = `/spr-main?id=${selectedIdNumber}`;
        } catch (error) {
            console.error('Error storing student data:', error);
            alert('Failed to store student data. Please try again.');
        }
    });
});