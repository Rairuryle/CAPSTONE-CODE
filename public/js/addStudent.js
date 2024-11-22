document.addEventListener('DOMContentLoaded', function () {
    const departmentInput = document.getElementById('inputDepartmentStudent');
    const courseInput = document.getElementById('inputCourseStudent');
    const ABOInput = document.getElementById('inputABOStudent');

    const departmentCourses = {
        CAS: ['ABCOM', 'ABENG', 'ABPOLSC', 'BSPSYCH', 'BSSW'],
        CBA: ['BSA', 'BSBAFM', 'BSBAMM'],
        CCJE: ['BSCrim'],
        CCSEA: ['BLIS', 'BSArch', 'BSCE', 'BSCpE', 'BSCS', 'BSECE', 'BSEE', 'BSGE', 'BSIT'],
        CON: ['BSN'],
        CTE: ['BECED', 'BEEd', 'BPE', 'BTLEd-HE', 'BSEd-English', 'BSED-Filipino', 'BSEd-Mathematics', 'BSEd-Science', 'BSEd-SocStud', 'BSEd-ValEd', 'BSNEd'],
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

    function updateCourses() {
        const selectedDepartment = departmentInput.value;
        const courses = departmentCourses[selectedDepartment] || [];

        courseInput.innerHTML = '<option disabled="disabled" selected="selected">Select Course</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseInput.appendChild(option);
        });
    }

    function updateABO() {
        const selectedCourse = courseInput.value;
        const ABOs = coursesABO[selectedCourse] || [];

        ABOInput.innerHTML = '<option disabled="disabled" selected="selected">Select ABO</option>';

        ABOs.forEach(ABO => {
            const option = document.createElement('option');
            option.value = ABO;
            option.textContent = ABO;
            ABOInput.appendChild(option);
        });
    }

    departmentInput.addEventListener('change', function () {
        updateCourses();
        updateABO();
    });

    courseInput.addEventListener('change', updateABO);

    // Initial call to populate courses if department is pre-selected
    updateCourses();
    updateABO();
});

document.querySelector('.btn-reset').addEventListener('click', function (e) {
    e.preventDefault();

    // Reset all text inputs
    document.querySelectorAll('input[type="text"]').forEach((input) => {
        if (!input.hasAttribute('readonly')) {
            input.value = ''; //
        }
    });

    document.querySelectorAll('select').forEach((select) => {
        if (select.id !== 'inputDepartmentStudent') {
            select.selectedIndex = 0;
        }
    });

    document.querySelectorAll('.form-control').forEach((element) => {
        element.classList.remove('is-valid', 'is-invalid');
    });
});