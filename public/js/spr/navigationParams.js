document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;

    const currentPath = window.location.pathname;

    const editModeLink = document.querySelector('a[data-mode="edit"]');
    const exitEditModeLink = document.querySelector('a[data-mode="exit-edit"]');

    if (editModeLink && currentPath === '/spr-main') {
        editModeLink.href += queryString;
    }

    if (exitEditModeLink && currentPath === '/spr-edit') {
        exitEditModeLink.href += queryString;
    }
});