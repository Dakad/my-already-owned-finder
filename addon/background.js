browser.downloads.search({
    state: 'complete',
    orderBy: ['-startTime']
}).then((downloads) => {
    console.log(downloads);


})


const searchForDuplicate = downloadItem => {
    let [name, ] = downloadItem.filename.split('\\').reverse()
    name = name.replace(/(-[0-9]+).*/, '');

    console.log(downloadItem);
    console.log(name);

    if (downloadItem.mime && !downloadItem.mime.startsWith('video')) {
        return;
    }

    return browser.downloads.search({
            query: [name],
            // url: downloadItem.url
            // mime: 'video/mp4'
        }).then((downloads) => {
            console.log(downloads);

            const currentDownload = downloads.findIndex(({ id }) => id == downloadItem.id);
            downloads.splice(currentDownload, 1);

            console.log('After splicing : ', downloads);

            // No matching download
            if (downloads.length == 0)
                return undefined;

            return Promise.all([
                browser.downloads.cancel(downloadItem.id),
                browser.downloads.erase({ id: downloadItem.id })
            ]);
        }).then(_ => _ ? console.log("Cancel & Erased :-)", downloadItem.id, _) : null)
        .catch(e => console.error("Promise.race : ", e))
}


browser.downloads.onCreated.addListener(searchForDuplicate);