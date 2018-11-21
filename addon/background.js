browser.downloads.search({
    state: 'complete',
    orderBy: ['-startTime']
}).then((downloads) => {
    console.log(downloads);


})

const _getName = (filename) => filename.split('\\').reverse()[0].replace(/(-[0-9]+).*/, '');

const _getDomain = function(url) {
    return new URL(url).hostname;
    // const link = document.createElement('a');
    // link.href = url;
    // return link.hostname;
}

const PnStore = new Map();

class PnItem {
    constructor({ id, filename, mime, referrer, url, startTime, fileSize, state }) {
        this.id = id;
        this.filename = filename;
        this.mime = mime;
        this.urlPage = referrer; // The downloading page
        this.src = url; // The real src of the video
        this.startTime = startTime;
        this.fileSize = fileSize;
        this.state = state;
        this.name = _getName(filename);
        this.domain = _getDomain(referrer);
    }
}


const searchForDuplicate = downloadItem => {
    const name = _getName(downloadItem.filename);

    console.log(downloadItem, name);

    if (downloadItem.mime && !downloadItem.mime.startsWith('video')) {
        return;
    }

    return browser.downloads.search({
            query: [name],
            // url: downloadItem.url
            // mime: 'video/mp4'
        }).then((downloads) => {
            // Remove the current download item
            const currentDownload = downloads.findIndex(({ id }) => id == downloadItem.id);
            downloads.splice(currentDownload, 1);
            return downloads.length == 0;
        }).then(isNew => { // isNew if the rest of splicing is empty

            if (isNew) { // No duplicate remaining after splicing
                const newPn = new PnItem(downloadItem);
                PnStore.set(newPn.urlPage, newPn);
                console.log("New Vids :-)");
                return browser.storage.local.set({
                    'pn': PnStore
                });
            } else {
                return Promise.all([
                    browser.downloads.cancel(downloadItem.id),
                    browser.downloads.erase({ id: downloadItem.id })
                ]);
            }

        }).then(_ => _ ? console.log("Cancel & Erased :-)", downloadItem.id, _) : null)
        .catch(e => console.error("Promise.race : ", e))
}


/**
 * 
 * @param {DownloadItem} change an  object that changed
 */
const updateCompleteDownload = function update(change) {
    const { state, id } = change;
    console.log(change);

    if (state.current != 'complete')
        return undefined;

    // Search for the old downloadedItem
    return browser.downloads.search({
        id,
        limit: 1
    }).then(([download]) => {
        if (!download)
            return undefined;

        PnStore.set(download.referrer, new PnItem(download));

        return browser.storage.local.set({
            'pn': PnStore
        });
        return true;
    }).then(ok => ok ? console.log('Updated PnItem : #' + id) : null);

}


browser.downloads.onCreated.addListener(searchForDuplicate);

browser.downloads.onChanged.addListener(updateCompleteDownload);