document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;

    const fileInput = document.getElementById('csvFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Display the file name when the file is selected
    fileInput.addEventListener('change', function () {
        const fileName = fileInput.files[0] ? fileInput.files[0].name : '';
        
        if (fileName) {
            fileNameDisplay.textContent = `Selected File: ${fileName}`;
            fileNameDisplay.style.display = 'block';  // Make the file name visible
        } else {
            fileNameDisplay.style.display = 'none';  // Hide if no file is selected
        }
    });

    document.getElementById('importCsvForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        const formData = new FormData(this);

        // Log formData entries to check if 'admin_id' is correctly included
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Append query parameters to formData individually
        queryParams.forEach((value, key) => {
            formData.append(key, value);  // Append each query parameter to form data
        });

        // Make an AJAX request to upload the file
        fetch('/import/import-csv', {
            method: 'POST',
            body: formData,  // send FormData, which includes the file and query parameters
        })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    return response.json();
                }
            })
            .then(data => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error uploading CSV:', error);
            });
    });
});
