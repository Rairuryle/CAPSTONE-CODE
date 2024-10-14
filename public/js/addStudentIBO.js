document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value;

    // If input is empty, hide the suggestions
    if (!query) {
        document.getElementById('suggestionsList').innerHTML = '';
        document.getElementById('suggestionsList').style.display = 'none'; // Hide suggestions
        return;
    }

    // Fetch search results from the backend
    fetch(`/search-students?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
            const suggestionsList = document.getElementById('suggestionsList');
            suggestionsList.innerHTML = ''; // Clear previous suggestions

            // If no results, hide the list
            if (!results.length) {
                suggestionsList.style.display = 'none'; // Hide suggestions if no results
                return;
            }

            // Populate suggestions list
            results.forEach(student => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = `${student.first_name} ${student.last_name} (${student.id_number})`;
                listItem.addEventListener('click', function () {
                    document.getElementById('searchInput').value = `${student.first_name} ${student.last_name}`; // Set selected value
                    suggestionsList.innerHTML = ''; // Hide suggestions
                    suggestionsList.style.display = 'none'; // Hide suggestions
                });
                suggestionsList.appendChild(listItem);
            });

            // Show suggestions if there are results
            suggestionsList.style.display = results.length ? 'block' : 'none';
        })
        .catch(error => console.error('Error fetching search results:', error));
});