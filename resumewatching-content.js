// Disable debug logging
// console.debug = function () {};
// if (typeof PLAYER_STATE === 'undefined') {
    const PLAYER_STATE = {
        PLAYING: 1,
        PAUSED: 2
    }
// }

function log(...string) {
    console.debug("ResumeWatching:", ...string);
}

log("Plugin loaded!");

async function poll(player, videoID, uuid) {
    let randID = Math.floor(Math.random() * 100);
    while (true) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
            let currentTime = Math.floor(player.getCurrentTime());
            
            log(`Storing time ${currentTime} for ${videoID}`);
            let settingItem = browser.storage.sync.set({
                [videoID]: { uuid: uuid, currentTime: currentTime }
            });
            log(settingItem)
            
        }
        
        const url = new URL(window.location.href);
        if (videoID !== url.searchParams.get('v')) {
            log("Breaking loop", randID, videoID, player.getVideoData()['video_id'])
            break;
        }

        await new Promise(r => setTimeout(r, 1000));
    }
}

function waitForElm(selector) {
    log("Waiting for element", selector);
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            log("1 - Found element", document.querySelector(selector));
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                log("2 - Found element", document.querySelector(selector));
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


log("Adding listener")
browser.runtime.onMessage.addListener((data) => {
    log("Message received:", data);
    waitForElm('#movie_player').then((elm) => {
        let uuid = browser.runtime.getURL('/');
        let player = document.getElementById("movie_player").wrappedJSObject;
    
        const url = new URL(window.location.href);
        let videoID = url.searchParams.get('v');

        if (videoID != data.videoID) return;

        browser.storage.sync.get().then((items) => {
            

            // Remove oldest item if we have 512 items in storage
            const maxItemsInStorage = 512;
            let keys = Object.keys(items);
            if (keys.length == maxItemsInStorage) {
                log(`Removing oldest item from storage: ${keys[0]}`);
                browser.storage.sync.remove(keys[0]);
            }

            if (items.hasOwnProperty(videoID)) {
                let item = items[videoID];
                if (item.hasOwnProperty("currentTime")) {
                    log("Found stored time for video", videoID, item["currentTime"]);
                    player.seekTo(item["currentTime"]);
                } 
            } else {
                log("Couldn't find stored time for this video.");
            }
        });

        log("Start polling!");
        poll(player, videoID, uuid);
    });
});