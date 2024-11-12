function searchStudentProfile() {
    const idNumberInput = document.getElementById('searchStudentProfile');

    if (!idNumberInput) {
        console.log('Element with ID "searchStudentProfile" not found');
        return;
    }

    const searchQuery = idNumberInput.value.trim(); // Use this for search

    if (!searchQuery) {
        alert('Please enter an ID number or name to search.');
        return;
    }

    console.log('Sending request with search query:', searchQuery);

    // Send a request to the server to search for the student profile
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
                // Get the current URL to check if we are in the `spr-edit` context
                const currentUrl = window.location.href;
                let redirectUrl = '';

                if (currentUrl.includes('/spr-edit')) {
                    redirectUrl = `/spr-edit?id=${encodeURIComponent(data.studentData.id_number)}`;
                } else {
                    redirectUrl = `/spr-main?id=${encodeURIComponent(data.studentData.id_number)}`;
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

// Add event listeners for search button and Enter key press
document.getElementById('searchButton').addEventListener('click', searchStudentProfile);
document.getElementById('searchStudentProfile').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchStudentProfile();
    }
});
