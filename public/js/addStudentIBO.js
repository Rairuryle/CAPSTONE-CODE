const selectedStudents = [];

// Function to log selected students
function logSelectedStudents() {
    console.log('Current Selected Students:', selectedStudents);
}

// Function to render suggestions based on results
function renderSuggestions(results) {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    // Filter out already selected students
    const filteredResults = results.filter(student =>
        !selectedStudents.includes(student.id_number) // Ensure the student is not already selected
    );

    if (!filteredResults.length) {
        suggestionsList.style.display = 'none';
        return;
    }

    filteredResults.forEach(student => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = `${student.first_name} ${student.last_name} (${student.id_number})`;

        listItem.addEventListener('click', function () {
            const studentName = `${student.first_name} ${student.last_name}`;
            const membersToAddElement = document.getElementById('membersToAdd');
            // Add student to the selectedStudents array
            selectedStudents.push(student.id_number); // Assuming student.id_number is a string

            // Log selected students after adding a new one
            logSelectedStudents();  // Call the function to log the current selected students

            // Append the new student to the existing list with a remove icon
            const memberItem = document.createElement('div');
            memberItem.innerHTML = `
            ${studentName}
            <span class="remove-icon" style="cursor: pointer; color: red; margin-left: 10px;">&times;</span>`;
            memberItem.classList.add('member-item'); // This line adds the class for styling


            // Add click event for the remove icon
            memberItem.querySelector('.remove-icon').addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent triggering the parent click event
                membersToAddElement.removeChild(memberItem); // Remove the member from display
                selectedStudents.splice(selectedStudents.indexOf(student.id_number), 1); // Remove from selectedStudents array
                logSelectedStudents(); // Log updated selected students
            });

            membersToAddElement.appendChild(memberItem);

            // Clear the input and suggestions
            document.getElementById('searchInput').value = '';
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        });

        suggestionsList.appendChild(listItem);
    });

    suggestionsList.style.display = filteredResults.length ? 'block' : 'none';
}

// Event listener for the search input
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value;

    if (!query) {
        document.getElementById('suggestionsList').innerHTML = '';
        document.getElementById('suggestionsList').style.display = 'none';
        return;
    }

    fetch(`/search-students?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
            renderSuggestions(results); // Call the render function
        })
        .catch(error => console.error('Error fetching search results:', error));
});

const form = document.getElementById('formAddStudentIBO');
console.log('Form element:', form);

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Check if any students have been selected
        if (selectedStudents.length === 0) {
            alert('No students selected to add.');
            return;
        }

        const iboName = document.getElementById('adminData').dataset.ibo;

        console.log('Submitting students:', selectedStudents);  // Check if this logs an array of selected students
        console.log('IBO name:', iboName);  // Ensure ibo_name is correctly fetched

        fetch('/student/add-students-to-ibo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ students: selectedStudents, ibo_name: iboName })  // Send data
        })
            .then(response => {
                console.log('Response status:', response.status); // Log response status
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Students added successfully!');
                    document.getElementById('membersToAdd').innerHTML = ''; // Clear displayed students
                    selectedStudents.length = 0; // Clear selected students
                } else {
                    alert('Failed to add students: ' + data.message); // Provide more detailed error info
                }
            })
            .catch(error => console.error('Error:', error));
    });
}
