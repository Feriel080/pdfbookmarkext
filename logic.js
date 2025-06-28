document.addEventListener('DOMContentLoaded', () => {
    const addNewButton = document.getElementById('add-button');
    const deleteAllButton = document.getElementById('deleteAll-button');

    const noBookmarksContainer = document.querySelector('.no-bookmarks-container');

    const bookmarksContainer = document.querySelector('.bookmarks-container');
    const bookmarksList = document.querySelector('.bookmarqs');
    const numberOfBookmarks = document.querySelector('.number-of-bookmarks');

    const scrollLine = document.querySelector('.scroll-line');
    const scroll = document.querySelector('.scrolls')

    const addPageNumber = document.getElementById('add-page-number');
    const savePageNumber = document.getElementById('save-number');
    const cancelSaving = document.getElementById('cancel');

    const alreadyExist = document.getElementById('already-exist');
    const savedSuccessfully = document.getElementById('saved');
    const otherPage = document.getElementById('other-page');

    const bookmarkPageNumber = document.getElementById('bookmark-page-number');

    const copiedToClipboard = document.getElementById('copied-page-number');

    let isDragging = false;
    let dragStartY = 0;
    let startScrollTop = 0;

    let bookmarkToEdit = null;

    let savedBookmarks = JSON.parse(localStorage.getItem('savedBookmarks')) || [];
    savedBookmarks.forEach((bookmark, index) => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmarks';
        bookmarkItem.id = `bookmark${index}`;

        const update_button = document.createElement('button');
        update_button.className = 'update';
        update_button.setAttribute('data-tooltip', 'Update');
        update_button.innerHTML = `
            <img src="icons/update.png" alt="update" width="60px" height="60px" class="static">
            <img src="icons/upd1.gif" alt="update" width="60px" height="60px" class="gif">
        `;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'bookmark-title';

        const titleH = document.createElement('h3');
        titleH.textContent = bookmark.title;

        setTimeout(() => {
            if (titleH.scrollWidth > titleH.clientWidth) {
                const label = document.createElement('label');
                label.textContent = bookmark.title;
                titleDiv.insertBefore(label, titleH);
            }
        }, 0);
        titleDiv.appendChild(titleH);

        const pageNumber_Button = document.createElement('button');
        pageNumber_Button.className = 'pagenumber';
        pageNumber_Button.textContent = `${bookmark.page}`;

        const delete_button = document.createElement('button');
        delete_button.className = 'delete';
        delete_button.setAttribute('data-tooltip', 'Delete');
        delete_button.innerHTML = `
            <img src="icons/delete.png" alt="delete" width="50px" height="50px" class="static">
            <img src="icons/del1.gif" alt="delete" width="50px" height="50px" class="gif">
        `;

        bookmarkItem.appendChild(update_button);
        bookmarkItem.appendChild(titleDiv);
        bookmarkItem.appendChild(pageNumber_Button);
        bookmarkItem.appendChild(delete_button);

        bookmarksList.appendChild(bookmarkItem);

        update_button.addEventListener('click', () => {
            bookmarkToEdit = { index, pageNumber_Button, bookmarkItem };

            addPageNumber.classList.add('shown');
            addPageNumber.classList.remove('hidden');
        });

        pageNumber_Button.addEventListener('click', () => {
            navigator.clipboard.writeText(bookmark.page);
            copiedToClipboard.className = 'fade-in';
            setTimeout(() => {
                copiedToClipboard.className = 'fade-out';
            }, 2000);
        });

        delete_button.addEventListener('click', () => {
            bookmarkItem.remove();
            savedBookmarks = savedBookmarks.filter(
                b => !(b.title === bookmark.title && b.page === bookmark.page)
            );
            localStorage.setItem('savedBookmarks', JSON.stringify(savedBookmarks));
            updateBookmarkCount();
            toggleScrollButtons();
        });
    });

    function getMaxHeight() {
        const computedStyle = window.getComputedStyle(bookmarksList);
        return parseFloat(computedStyle.maxHeight);
    }

    const addAndDeleteAllButtons = () => {
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
    };

    addAndDeleteAllButtons();

    setTimeout(() => {
        const maxHeight = getMaxHeight();
        if (bookmarksList.offsetHeight >= maxHeight && bookmarksList.scrollHeight > bookmarksList.clientHeight) {
            scroll.style.display = 'block';
            bookmarksContainer.style.paddingRight = '16px';
        } else {
            scroll.style.display = 'none';
            bookmarksContainer.style.paddingRight = '';
        }
    }, 0);
    const toggleScrollButtons = () => {
        const scrollContent = bookmarksList;
        const scrollBar = scrollLine;
        const visibleHeight = scrollContent.offsetHeight;
        const contentHeight = scrollContent.scrollHeight;
        const scrollTop = scrollContent.scrollTop;

        const scrollbarHeight = Math.max(
            (visibleHeight / contentHeight) * visibleHeight,
            30
        )
        scrollBar.style.height = `${scrollbarHeight}px`;

        const maxScrollTop = contentHeight - visibleHeight;
        const maxBarTop = visibleHeight - scrollbarHeight;
        const barTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxBarTop : 0;
        scrollBar.style.top = `${barTop}px`;
    };

    bookmarksList.addEventListener('scroll', toggleScrollButtons);
    toggleScrollButtons();
    scrollLine.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartY = e.clientY;
        startScrollTop = bookmarksList.scrollTop;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const scrollContent = bookmarksList;
        const visibleHeight = scrollContent.offsetHeight;
        const contentHeight = scrollContent.scrollHeight;
        const scrollbarHeight = scrollLine.offsetHeight;
        const maxScrollTop = contentHeight - visibleHeight;
        const maxBarTop = visibleHeight - scrollbarHeight;

        const deltaY = e.clientY - dragStartY;
        const scrollRatio = maxBarTop !== 0 ? maxScrollTop / maxBarTop : 0;
        scrollContent.scrollTop = startScrollTop + deltaY * scrollRatio;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });

    function updateBookmarkCount() {
        const bookmarksCount = savedBookmarks.length;
        numberOfBookmarks.textContent = `You have ${bookmarksCount} bookmark${bookmarksCount === 1 ? '' : 's'}.`;
        noBookmarksContainer.style.display = bookmarksCount > 0 ? 'none' : 'flex';
        bookmarksContainer.style.display = bookmarksCount > 0 ? 'flex' : 'none';
    }

    function addBookmark() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            let pageTitle;

            if (tab) {
                pageTitle = tab.title;
                pageTitle = pageTitle.replace(/\.pdf$/i, "");
                console.log('page title:', pageTitle);
            } else {
                pageTitle = "Unknown Title";
            }

            noBookmarksContainer.style.display = 'none';
            const currentPage = bookmarkPageNumber.value.trim();
            bookmarkPageNumber.value = '';
            const bookmarksCount = savedBookmarks.length;

            const existingBookmark = savedBookmarks.find(b => b.title === pageTitle);
            if (existingBookmark) {
                if (existingBookmark.page === currentPage) {
                    alreadyExist.style.display = 'block';
                    setTimeout(() => {
                        alreadyExist.style.display = 'none';
                    }, 3000);
                    return;
                } else {
                    otherPage.style.display = 'block';
                    setTimeout(() => {
                        otherPage.style.display = 'none';
                    }, 3000);
                    return;
                }
            }

            savedBookmarks.push({
                title: pageTitle,
                page: currentPage,
            });

            localStorage.setItem('savedBookmarks', JSON.stringify(savedBookmarks));

            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmarks';
            bookmarkItem.id = `bookmark${bookmarksCount}`;

            const update_button = document.createElement('button');
            update_button.className = 'update';
            update_button.setAttribute('data-tooltip', 'Update');
            update_button.innerHTML = `
                <img src="icons/update.png" alt="update" width="60px" height="60px" class="static">
                <img src="icons/upd1.gif" alt="update" width="60px" height="60px" class="gif">
            `;

            const titleDiv = document.createElement('div');
            titleDiv.className = 'bookmark-title';

            const titleH = document.createElement('h3');
            titleH.textContent = pageTitle;

            setTimeout(() => {
                if (titleH.scrollWidth > titleH.clientWidth) {
                    const label = document.createElement('label');
                    label.textContent = pageTitle;
                    titleDiv.insertBefore(label, titleH);
                }
            }, 0);
            titleDiv.appendChild(titleH);

            const pageNumber_Button = document.createElement('button');
            pageNumber_Button.className = 'pagenumber';
            pageNumber_Button.textContent = `${currentPage}`;

            const delete_button = document.createElement('button');
            delete_button.className = 'delete';
            delete_button.setAttribute('data-tooltip', 'Delete');
            delete_button.innerHTML = `
                <img src="icons/delete.png" alt="delete" width="50px" height="50px" class="static">
                <img src="icons/del1.gif" alt="delete" width="50px" height="50px" class="gif">
            `;

            bookmarkItem.appendChild(update_button);
            bookmarkItem.appendChild(titleDiv);
            bookmarkItem.appendChild(pageNumber_Button);
            bookmarkItem.appendChild(delete_button);

            bookmarksList.appendChild(bookmarkItem);
            update_button.addEventListener('click', () => {
                bookmarkToEdit = {
                    index: savedBookmarks.length - 1,
                    pageNumber_Button,
                    bookmarkItem
                };
                addPageNumber.classList.add('shown');
                addPageNumber.classList.remove('hidden');
            });

            pageNumber_Button.addEventListener('click', () => {
                navigator.clipboard.writeText(currentPage);
                copiedToClipboard.className = 'fade-in';
                setTimeout(() => {
                    copiedToClipboard.className = 'fade-out';
                }, 2000);
            });

            delete_button.addEventListener('click', () => {
                bookmarkItem.remove();
                savedBookmarks = savedBookmarks.filter(
                    b => !(b.title === pageTitle && b.page === currentPage)
                );
                localStorage.setItem('savedBookmarks', JSON.stringify(savedBookmarks));
                updateBookmarkCount();
                toggleScrollButtons();

                // if (bookmarksList.children.length === 0) {
                //     noBookmarksContainer.style.display = 'flex';
                //     bookmarksContainer.style.display = 'none';
                // }
            });

            updateBookmarkCount();
            toggleScrollButtons();
            savedSuccessfully.style.display = 'block';
            setTimeout(() => {
                savedSuccessfully.style.display = 'none';
            }, 3000);
        });
    }

    addNewButton.addEventListener('click', () => {
        if (!addPageNumber.classList.contains('shown')) {
            addPageNumber.classList.add('shown');
        }
    });
    savePageNumber.addEventListener('click', () => {
        if (bookmarkToEdit) {
            const newPageNumber = bookmarkPageNumber.value.trim();
            if (newPageNumber) {
                bookmarkPageNumber.value = '';
                bookmarkToEdit.pageNumber_Button.textContent = `${newPageNumber}`;
                savedBookmarks[bookmarkToEdit.index].page = newPageNumber;
                localStorage.setItem('savedBookmarks', JSON.stringify(savedBookmarks));
                otherPage.textContent = 'Updated successfully ✓';
                otherPage.style.display = 'block';
                setTimeout(() => {
                    otherPage.style.display = 'none';
                }, 2000);
            }
            addPageNumber.classList.remove('shown');
            addPageNumber.classList.add('hidden');
            bookmarkToEdit = null;
        } else {
            addBookmark();
        }
    });
    cancelSaving.addEventListener('click', () => {
        addPageNumber.classList.remove('shown');
        addPageNumber.classList.add('hidden');
    });
    // here
    deleteAllButton.addEventListener('click', () => {
        localStorage.removeItem('savedBookmarks');
        noBookmarksContainer.style.display = 'flex';
        bookmarksContainer.style.display = 'none';
        // Remove all bookmark DOM elements from the list
        while (bookmarksList.firstChild) {
            bookmarksList.removeChild(bookmarksList.firstChild);
        }
        updateBookmarkCount();
    });

    bookmarkPageNumber.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            savePageNumber.click();
        }
    });
});