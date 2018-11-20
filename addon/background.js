browser.contextMenus.create({
    id: "ddg",
    title: "Find in Download",
    contexts: ["selection"]
});


browser.downloads.search({
    orderBy: ["-startTime"],
    limit: 5,
}).then((downloads) => {
    console.log(downloads);
})


browser.contextMenus.onClicked.addListener(contextMenuAction);

function contextMenuAction(info, tab) {
    const selected = info.selectionText;

    console.log(selected);

    browser.downloads.search({
        query: [selected],
        limit: 3,
    }).then((downloads) => {
        console.log(downloads);
    })

}