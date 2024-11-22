document.addEventListener('DOMContentLoaded', function () {
    const departmentInput = document.getElementById('editDepartmentNameDropdown');
    const courseInput = document.getElementById('editCourseNameDropdown');
    const ABOInput = document.getElementById('aboNameDropdown');

    const departmentCourses = {
        CAS: ['ABCOM', 'ABENG', 'ABPOLSC', 'BSPSYCH', 'BSSW'],
        CBA: ['BSA', 'BSBAFM', 'BSBAMM'],
        CCJE: ['BSCrim'],
        CCSEA: ['BLIS', 'BSArch', 'BSCE', 'BSCpE', 'BSCS', 'BSECE', 'BSEE', 'BSGE', 'BSIT'],
        CON: ['BSN'],
        CTE: ['BECED', 'BEEd', 'BPE', 'BTLEd-HE', 'BSEd-English', 'BSEd-Filipino', 'BSEd-Mathematics', 'BSEd-Science', 'BSEd-SocStud', 'BSEd-ValEd', 'BSNEd'],
        CTHM: ['BSHM', 'BSTM']
    };

    const coursesABO = {
        ABCOM: ['None'],
        ABENG: ['LABELS'],
        ABPOLSC: ['POLISAYS'],
        BSPSYCH: ['LSUPS'],
        BSSW: ['JSWAP'],
        BSA: ['JPIA'],
        BSBAFM: ['JFINEX'],
        BSBAMM: ['JMEX'],
        BSCrim: ['None'],
        BLIS: ['LISSA'],
        BSArch: ['UAPSA'],
        BSCE: ['PICE'],
        BSCpE: ['ICpEP'],
        BSCS: ['SOURCE'],
        BSECE: ['JIECEP'],
        BSEE: ['IIEE'],
        BSGE: ['ALGES'],
        BSIT: ['SOURCE'],
        BSN: ['None'],
        BECED: ['None'],
        BEEd: ['GEM-O'],
        BPE: ['SPEM'],
        "BTLEd-HE": ['GENTLE'],
        "BSEd-English": ['ECC'],
        "BSEd-Filipino": ['LapitBayan'],
        "BSEd-Mathematics": ['LME'],
        "BSEd-Science": ['None'],
        "BSEd-SocStud": ['SSS'],
        "BSEd-ValEd": ['None'],
        BSNEd: ['None'],
        BSHM: ['FHARO', 'FTL'],
        BSTM: ['SOTE']
    };

    const studentCourseName = courseInput.value;
    const studentABOName = ABOInput.value;

    function updateCourses() {
        const selectedDepartment = departmentInput.value;
        const courses = departmentCourses[selectedDepartment] || [];

        courseInput.innerHTML = '<option disabled="disabled" selected="selected">New Course</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseInput.appendChild(option);
        });

        // Retain the student course value if no update
        if (studentCourseName && courses.includes(studentCourseName)) {
            courseInput.value = studentCourseName; // Retain the student's current course value
        } else {
            courseInput.value = ''; // Reset to 'Select Course' if no match
        }
    }

    // Function to update the ABOInput dropdown based on selected course
    function updateABO() {
        const selectedCourse = courseInput.value;
        const ABOs = coursesABO[selectedCourse] || [];

        // Reset ABOInput and add default placeholder option
        ABOInput.innerHTML = '<option disabled="disabled" selected="selected">New ABO</option>';

        // Add new options dynamically based on selected course
        ABOs.forEach(ABO => {
            const option = document.createElement('option');
            option.value = ABO;
            option.textContent = ABO;
            ABOInput.appendChild(option);
        });

        // Retain the student ABO value if no update
        if (studentABOName && ABOs.includes(studentABOName)) {
            ABOInput.value = studentABOName; 
        } else {
            ABOInput.value = '';
        }
    }

    departmentInput.addEventListener('change', function () {
        updateCourses();
        updateABO();
    });

    courseInput.addEventListener('change', updateABO);

    // Initial function call to populate courses and ABO based on selected department/course
    updateCourses();
    updateABO();


    document.querySelector('.btn-edit-student-profile-submit').addEventListener('click', function (event) {
        event.preventDefault();

        const updatedFirstName = document.getElementById('editStudentFirstName').value;
        const updatedLastName = document.getElementById('editStudentLastName').value;
        const originalStudentId = document.getElementById('originalIDNumber').value;
        const newStudentId = document.getElementById('editIDNumber').value;
        const updatedActiveStatus = document.getElementById('editActiveStatus').value;
        const updatedExemptionStatus = document.getElementById('editExemptionStatus').value;
        const updatedDepartment = document.getElementById('editDepartmentNameDropdown').value;
        const updatedCourse = document.getElementById('editCourseNameDropdown').value;
        const updatedABO = document.getElementById('aboNameDropdown').value;
        const updatedYearLevel = document.getElementById('editYearLevelDropdown').value;
        const updatedIBO = document.getElementById('iboNameDropdown').value;

        fetch('/student/update-student-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_number: originalStudentId, 
                first_name: updatedFirstName,
                last_name: updatedLastName,
                new_id_number: newStudentId,
                active_status: updatedActiveStatus,
                exemption_status: updatedExemptionStatus,
                department_name: updatedDepartment,
                course_name: updatedCourse,
                abo_name: updatedABO,
                ibo_name: updatedIBO,
                year_level: updatedYearLevel,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Student profile updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error updating profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update profile');
            });
    });
});