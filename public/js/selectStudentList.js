document.addEventListener('DOMContentLoaded', function () {

    const collegeSelect = document.getElementById('selectGroupListCollege');
    const aboSelect = document.getElementById('selectGroupListABO');
    const iboSelect = document.getElementById('selectGroupListIBO');

    // Function to reset other selects
    function resetOtherSelects(selectedSelect) {
        if (selectedSelect !== collegeSelect) {
            collegeSelect.selectedIndex = 0; // Reset to default option
        }
        if (selectedSelect !== aboSelect) {
            aboSelect.selectedIndex = 0; // Reset to default option
        }
        if (selectedSelect !== iboSelect) {
            iboSelect.selectedIndex = 0; // Reset to default option
        }
    }

    // Event listeners for each select
    collegeSelect.addEventListener('change', function () {
        resetOtherSelects(collegeSelect);
    });

    aboSelect.addEventListener('change', function () {
        resetOtherSelects(aboSelect);
    });

    iboSelect.addEventListener('change', function () {
        resetOtherSelects(iboSelect);
    });
});