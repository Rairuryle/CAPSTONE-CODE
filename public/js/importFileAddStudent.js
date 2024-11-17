document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;

    document.getElementById("csvFileInput").addEventListener("change", function () {
        const form = document.getElementById("importCsvStudentForm");

        const formData = new FormData(form);

        queryParams.forEach((value, key) => {
            formData.append(key, value);
        });

        fetch('/import/import-csv-student', {
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
                if (data.success) {
                    alert(data.message);
                    window.location.reload();

                } else {
                    alert(data.message);
                    window.location.reload();

                }
            })
            .catch(error => {
                console.error('Error during file upload:', error);
            });
    });
});
