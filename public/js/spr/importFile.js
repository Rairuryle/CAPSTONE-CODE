document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;

    const fileInput = document.getElementById('csvFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    fileInput.addEventListener('change', function () {
        const fileName = fileInput.files[0] ? fileInput.files[0].name : '';
        
        if (fileName) {
            fileNameDisplay.textContent = `Selected File: ${fileName}`;
            fileNameDisplay.style.display = 'block';
        } else {
            fileNameDisplay.style.display = 'none'; 
        }
    });

    document.getElementById('importCsvForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        const formData = new FormData(this);

        queryParams.forEach((value, key) => {
            formData.append(key, value);
        });

        fetch('/import/import-csv', {
            method: 'POST',
            body: formData,
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
