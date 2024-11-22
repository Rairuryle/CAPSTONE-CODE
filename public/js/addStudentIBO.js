const selectedStudents = [];

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
            selectedStudents.push(student.id_number);

            logSelectedStudents();

            const memberItem = document.createElement('div');
            memberItem.innerHTML = `
            ${studentName}
            <span class="remove-icon">&times;</span>`;
            memberItem.classList.add('member-item');

            memberItem.querySelector('.remove-icon').addEventListener('click', function (e) {
                e.stopPropagation();
                membersToAddElement.removeChild(memberItem);
                selectedStudents.splice(selectedStudents.indexOf(student.id_number), 1);
                logSelectedStudents();
            });

            membersToAddElement.appendChild(memberItem);

            document.getElementById('searchInput').value = '';
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        });

        suggestionsList.appendChild(listItem);
    });

    suggestionsList.style.display = filteredResults.length ? 'block' : 'none';
}

document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value;

    if (!query) {
        document.getElementById('suggestionsList').innerHTML = '';
        document.getElementById('suggestionsList').style.display = 'none';
        return;
    }

    fetch(`/student/search-students?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
            renderSuggestions(results);
        })
        .catch(error => console.error('Error fetching search results:', error));
});

const form = document.getElementById('formAddStudentIBO');
console.log('Form element:', form);

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (selectedStudents.length === 0) {
            alert('No students selected to add.');
            return;
        }

        const iboName = document.getElementById('adminData').dataset.ibo;

        fetch('/student/add-students-to-ibo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ students: selectedStudents, ibo_name: iboName })
        })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Students added successfully!');
                    document.getElementById('membersToAdd').innerHTML = '';
                    selectedStudents.length = 0;
                } else {
                    alert('Failed to add students: ' + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    });
}