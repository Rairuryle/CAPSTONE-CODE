document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchStudentProfile');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', function () {
        searchStudent();
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchStudent();
        }
    });

    function searchStudent() {
        const query = searchInput.value.trim();

        if (!query) {
            return;
        }

        fetch(`/student/search-landing?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.studentFound) {
                    const student = data.results[0];
                    const queryString = window.location.search;
                    
                    window.location.href = `/spr-student?id_number=${student.id_number}&${queryString}`;
                } else {
                    alert("Student not found!");
                }
            })
            .catch(error => console.error('Error fetching search results:', error));
    }
});
