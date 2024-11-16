document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;

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
            });
    });
});
