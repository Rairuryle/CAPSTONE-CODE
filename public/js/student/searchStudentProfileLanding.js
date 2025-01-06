document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchStudentProfileLanding');
    const searchButton = document.getElementById('searchButton');

    // Event listener for input changes
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchStudent();
        }
    });

    // Event listener for clicking the search button (search icon)
    searchButton.addEventListener('click', function () {
        searchStudent();
    });

    function searchStudent() {
        const query = searchInput.value.trim();

        if (!query) {
            return;
        }

        // Fetch matching students based on the input (first_name, last_name, or id_number)
        fetch(`/student/search-landing?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.studentFound) {
                    const student = data.results[0];
                    window.location.href = `/spr-student?id_number=${student.id_number}`;
                } else {
                    alert("Student not found!");
                }
            })
            .catch(error => console.error('Error fetching search results:', error));
    }
});
