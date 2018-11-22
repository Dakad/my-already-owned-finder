const _getName = (filename) => filename.split('\\').reverse()[0].replace(/(-[0-9]+).*/, '');

const _getDomain = function(url) {
    return new URL(url).hostname;
    // const link = document.createElement('a');
    // link.href = url;
    // return link.hostname;
}

// Get the store Map for PnItem
let PnStore = new Map();
browser.storage.local.get('pn')
    .then(({ pn }) => (pn != undefined ? PnStore = pn : null));

/**
 * Represent a download item stored in DB.
 */
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

/**
 * 
 * @param {DownloadItem} download 
 */
const searchForDuplicate = function(download) {
    const name = _getName(download.filename);
    let newPn;

    // console.log(download, name);

    // Only handle the download of type video
    if (download.mime && !download.mime.startsWith('video')) {
        return;
    }

    return browser.downloads.search({
            query: [name],
            // url: download.url
            mime: 'video/mp4'
        }).then((downloads) => {
            // Remove the current download item
            const currentDownload = downloads.findIndex(({ id }) => id == download.id);
            if(currentDownload != -1){
                downloads.splice(currentDownload, 1);
            }
            return downloads.length == 0;
        }).then(isNew => { // isNew if the rest of splicing is empty

            if (isNew) { // No duplicate remaining after splicing
                newPn = new PnItem(download);
                PnStore.set(newPn.urlPage, newPn);
                console.log("New Vids :-)", newPn.name);
                return browser.storage.local.set({
                    'pn': PnStore
                });
            } else {
                return Promise.all([
                    browser.downloads.cancel(download.id),
                    browser.downloads.erase({ id: download.id })
                ]).catch(e => console.error("Promise.race : ", e));
            }
        }).then(_ => _ ? _notify({ msg: name }) : null)
        .catch(e => console.error(e))
}


/**
 * 
 * @param {DownloadItem} change an  object that changed
 */
const updateCompleteDownload = function update(change) {
    const { state, id } = change;
    console.log(change.state);

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
        }).then(_ => true);
    }).then(ok => ok ? console.log('Updated PnItem : #' + id ) : null);
};

const _notify = function({ title, msg }) {
    return browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icons/finder.svg"),
        "title": 'Alreay Owned Finder',
        "message": msg,
        eventTime:  Date.now() + (1000 * 3)
    });
};


// Get the last 10 completed download
browser.downloads.search({
    state: 'complete',
    orderBy: ['-startTime'],
    limit: 10
}).then((downloads) => {
    console.log(downloads);
});

browser.downloads.onCreated.addListener(searchForDuplicate);

browser.downloads.onChanged.addListener(updateCompleteDownload);