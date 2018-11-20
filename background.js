browser.contextMenus.create({
    id: "ddg",
    title: "Find in Download",
    contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener(contextMenuAction);

function contextMenuAction(info, tab) {
    const selected = info.selectionText;
    // TODO IMPLEMENT
}