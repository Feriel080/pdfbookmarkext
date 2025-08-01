const scrollLine = document.querySelector('.scroll-line');
const scroll = document.querySelector('.scrolls');


function getMaxHeight() {
    const computedStyle = window.getComputedStyle(bookmarksList);
    return parseFloat(computedStyle.maxHeight);
}

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

export const toggleScrollButtons = () => {
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