export function bookmarkForSameTitle(bookmarkItem, pageNumbers, savedBookmarks, bookmarkIndex) {
    const oldBtn = bookmarkItem.querySelector('.pagenumber');
    const delete_btn = bookmarkItem.querySelector('.delete');
    const copiedToClipboard = document.getElementById('copied-page-number');
    const label_exist = bookmarkItem.querySelector('.number-of-pages');
    const updateButton = bookmarkItem.querySelector('.update');

    if (oldBtn) oldBtn.remove();

    if (updateButton) {
        updateButton.disabled = true;
    }
    if (!label_exist) {
        const label = document.createElement('label');
        label.className = 'number-of-pages';
        label.textContent = `${pageNumbers.length} pgs`;

        bookmarkItem.insertBefore(label, delete_btn);

        const list = document.createElement('div');
        list.className = 'page-list';

        pageNumbers.forEach(num => {
            const pageNumberContainer = document.createElement('div');
            pageNumberContainer.className = 'pagenumber-container';

            const pagenum = document.createElement('button');
            pagenum.className = 'pagenumber';
            pagenum.textContent = num;
            pagenum.addEventListener('click', (e) => {
                navigator.clipboard.writeText(num);
                copiedToClipboard.className = 'fade-in';
                setTimeout(() => {
                    copiedToClipboard.className = 'fade-out';
                }, 2000);
            });

            const deletebtn = document.createElement('button');
            deletebtn.className = 'delete';
            deletebtn.innerHTML = `
            <img src="icons/delete.png" alt="delete" width="30px" height="30px" class="static">
            <img src="icons/del1.gif" alt="delete" width="30px" height="30px" class="gif">
        `;
            deletebtn.addEventListener('click', () => {
                pageNumberContainer.remove();
                savedBookmarks[bookmarkIndex].page = savedBookmarks[bookmarkIndex].page.filter(
                    p => (p !== num)
                );
                localStorage.setItem('savedBookmarks', JSON.stringify(savedBookmarks));
                if (savedBookmarks[bookmarkIndex].page.length === 1) {
                    const newBtn = document.createElement('button');
                    newBtn.className = 'pagenumber';
                    newBtn.textContent = `${savedBookmarks[bookmarkIndex].page[0]}`;

                    newBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(currentPage);
                        copiedToClipboard.className = 'fade-in';
                        setTimeout(() => {
                            copiedToClipboard.className = 'fade-out';
                        }, 2000);
                    });
                    label.remove();
                    list.remove();
                    updateButton.disabled = false;
                    delete_btn.before(newBtn);

                } else {
                    label.textContent = `${savedBookmarks[bookmarkIndex].page.length} pgs`;
                }
            });

            pageNumberContainer.appendChild(pagenum);
            pageNumberContainer.appendChild(deletebtn);

            list.appendChild(pageNumberContainer);
        });

        bookmarkItem.appendChild(list);

        label.addEventListener('click', () => {
            list.style.display = 'flex';
        });


        document.querySelector('.buttons-container').addEventListener('click', () => {
            list.style.display = 'none';
        });

    } else {
        label_exist.textContent = `${pageNumbers.length} pgs`;
    }
}