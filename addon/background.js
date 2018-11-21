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
            const currentDownload = downloads.findIndex(({ id }) => id == downloadItem.id);
            downloads.splice(currentDownload, 1);

            console.log('After splicing : ', downloads);
            return downloads.length == 0;
        }).then(isNew => {
            // No matching download

            if (isNew) {
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
const updateCompleteDownload = function update({ state, exists, id }) {
    if (state.current != 'complete')
        return undefined;

    // Search for the old downloadedItem
    return browser.downloads.search({
        id,
        limit: 1
    }).then(([download]) => {
        if (!download)
            return undefined;

        console.log(download);
    })

}


browser.downloads.onCreated.addListener(searchForDuplicate);

browser.downloads.onChanged.addListener(updateCompleteDownload);