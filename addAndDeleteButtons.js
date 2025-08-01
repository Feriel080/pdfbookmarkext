const deleteAllButton = document.getElementById('deleteAll-button');
const addNewButton = document.getElementById('add-button');

export function deleteAll() {
    deleteAllButton.addEventListener('click', () => {
        localStorage.removeItem('savedBookmarks');
        savedBookmarks = [];
        updateBookmarkCount();
        while (bookmarksList.firstChild) {
            bookmarksList.removeChild(bookmarksList.firstChild);
        }
    });
}

export function addNew() {
    addNewButton.addEventListener('click', () => {
        if (!addPageNumber.classList.contains('shown')) {
            addPageNumber.classList.add('shown');
        }
    });
}

export function enableDisable() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        let pageTitle;

        if (tab) {
            pageTitle = tab.title;
            if (pageTitle.endsWith('.pdf')) {
                addNewButton.disabled = false;
                deleteAllButton.disabled = false;
            }
        }
    })
}