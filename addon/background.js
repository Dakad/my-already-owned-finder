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
        mime: 'video/mp4'
    }).then((downloads) => {
        debugger;
        console.log(downloads);

        if (downloads.length > 0)
            console.log(':-) Already IN');
    })
}


browser.downloads.onCreated.addListener(searchForDuplicate)