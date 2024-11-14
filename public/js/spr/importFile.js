document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = new URL(window.location.href); // Get the current URL
    const queryParams = currentUrl.searchParams; // Extract query parameters using searchParams
    console.log('Current query parameters:', [...queryParams]);

    document.getElementById('importCsvForm').addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent form from submitting

        const formData = new FormData(this);

        // Log formData entries to check if 'admin_id' is correctly included
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Append query parameters to formData individually
        queryParams.forEach((value, key) => {
            formData.append(key, value);  // Append each query parameter to form data
        });

        // Clear previous messages
        document.getElementById('importStatusMessage').innerText = '';

        // Make an AJAX request to upload the file
        fetch('/import/import-csv', {
            method: 'POST',
            body: formData,  // send FormData, which includes the file and query parameters
        })
        .then(response => {
            // Check if the response was a redirect
            if (response.redirected) {
                console.log('Redirect URL:', response.url);  // Log the redirect URL for debugging
                window.location.href = response.url;  // Redirect to the new URL (including query params)
            } else {
                return response.json();  // Handle error or message if it's not a redirect
            }
        })
        .then(data => {
            // Display success or error message
            document.getElementById('importStatusMessage').innerText = data.message || 'CSV data imported successfully';
            window.location.reload();
        })
        .catch(error => {
            document.getElementById('importStatusMessage').innerText = 'Error importing CSV.';
        });
    });
});
