browser.contextMenus.create({
    id: "find-item-in-download",
    title: "Find in Downloads",
    contexts: ["selection"]
});


browser.downloads.search({
    orderBy: ["-startTime"],
    limit: 5,
    mime: 'video/mp4'
}).then((downloads) => {
    console.log(downloads);
})


browser.contextMenus.onClicked.addListener(contextMenuAction);

function contextMenuAction(info, tab) {
    console.debug(info);
    const selected = info.selectionText.trim();

    browser.downloads.search({
        query: [selected],
        limit: 3,
        mime: 'video/mp4'
    }).then((downloads) => {
        if (downloads.length > 0)
            console.log(':-) Already IN');
    })

}