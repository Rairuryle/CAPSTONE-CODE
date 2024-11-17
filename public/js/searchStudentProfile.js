function searchStudentProfile() {
    const idNumberInput = document.getElementById('searchStudentProfile');

    if (!idNumberInput) {
        console.log('Element with ID "searchStudentProfile" not found');
        return;
    }

    const searchQuery = idNumberInput.value.trim();

    if (!searchQuery) {
        alert('Please enter an ID number or name to search.');
        return;
    }

    console.log('Sending request with search query:', searchQuery);

    fetch(`/student/search?searchStudentProfile=${encodeURIComponent(searchQuery)}`)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 403) {
                alert('Access denied: Organization mismatch.');
                throw new Error('Organization mismatch');
            } else if (response.status === 404) {
                alert('Error: Student not found.');
                throw new Error('Student not found');
            } else {
                alert('An unexpected error occurred.');
                throw new Error('Unexpected error');
            }
        })
        .then(data => {
            if (data.studentFound) {
                const studentId = encodeURIComponent(data.studentData.id_number);
                let redirectUrl = '';

                const currentUrl = window.location.href;
                const queryString = window.location.search;

                if (currentUrl.includes('/spr-edit')) {
                    redirectUrl = `/spr-edit?id=${studentId}&${queryString}`;
                } else if (currentUrl.includes('/spr-main')) {
                    redirectUrl = `/spr-main?id=${studentId}&${queryString}`;
                } else {
                    redirectUrl = `/spr-main?id=${studentId}`;
                }

                window.location.href = redirectUrl;
            } else {
                alert('Student not found.');
            }
        })
        .catch(error => {
            console.error('Error searching for student: ', error);
        });
}

document.getElementById('searchButton').addEventListener('click', searchStudentProfile);
document.getElementById('searchStudentProfile').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchStudentProfile();
    }
});
