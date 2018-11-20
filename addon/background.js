browser.downloads.search({
    orderBy: ["-startTime"],
    limit: 7,
    mime: 'video/mp4'
}).then((downloads) => {
    console.log(downloads);


})


const searchForDuplicate = downloadItem => {
    let [name, ] = downloadItem.filename.split('\\').reverse()
    name = name.replace(/(-[0-9]+).*/, '');

    console.log(name);

    browser.downloads.search({
        query: [name],
        // mime: 'video/mp4'
    }).then((downloads) => {
        console.log(downloads);

        if (downloads.length > 0)
            Promise.all([
                browser.downloads.cancel(downloadItem.id),
                browser.downloads.erase({ id: downloadItem.id })
            ]).then(_ => console.log("Cancel & Erased :-)"))
            .catch(e => console.error("Promise.race : ", e))
    });
}


browser.downloads.onCreated.addListener(searchForDuplicate)