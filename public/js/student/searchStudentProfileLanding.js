document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchStudentProfileLanding');
    const suggestionsList = document.getElementById('suggestionsList');
    const searchButton = document.getElementById('searchButton');

    // Event listener for input changes to show suggestions
    searchInput.addEventListener('input', function () {
        const query = this.value;

        if (!query) {
            // Hide suggestions if input is cleared
            suggestionsList.classList.add('d-none');
            return;
        }

        fetch(`/student/search-landing?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.studentFound) {
                    renderSuggestions(data.results); // Call a function to display suggestions
                } else {
                    suggestionsList.classList.add('d-none');
                }
            })
            .catch(error => console.error('Error fetching search results:', error));
    });

    // Event listener for clicking the search button (search icon)
    searchButton.addEventListener('click', function () {
        searchStudent();
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchStudent();
        }
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
                    const student = data.results[0]; // Get the first result (assuming unique or preferred match)
                    window.location.href = `/spr-student?id_number=${student.id_number}`;
                } else {
                    alert("Student not found!");
                }
            })
            .catch(error => console.error('Error fetching search results:', error));
    }

    // Function to render suggestions in the list
    function renderSuggestions(results) {
        suggestionsList.innerHTML = ''; // Clear previous suggestions

        results.forEach(student => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'text-white');
            listItem.textContent = `${student.first_name} ${student.last_name} - ${student.id_number}`;

            listItem.addEventListener('click', function () {
                searchInput.value = `${student.first_name} ${student.last_name} - ${student.id_number}`;
                suggestionsList.classList.add('d-none');
                window.location.href = `/spr-student?id_number=${student.id_number}`;
            });

            suggestionsList.appendChild(listItem);
        });

        suggestionsList.classList.remove('d-none');
    }

    // Hide suggestions when clicking outside the input
    document.addEventListener('click', function (event) {
        if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.classList.add('d-none');
        }
    });
});
