// Disable debug logging
// console.debug = function () {};

const PLAYER_STATE = {
    PLAYING: 1,
    PAUSED: 2
}
function log(...string) {
    console.debug("ResumeWatching:", ...string);
}

log("content loaded!");

async function poll(player, videoID, uuid) {
    let randID = Math.floor(Math.random() * 100);
    while (true) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
            let currentTime = Math.floor(player.getCurrentTime());
            
            log("Storing time", currentTime);
            browser.storage.sync.set({
                [videoID]: { uuid: uuid, currentTime: currentTime }
            });
            
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
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
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



browser.runtime.onMessage.addListener((data) => {
    waitForElm('#movie_player').then((elm) => {
        let uuid = browser.runtime.getURL('/');
        let player = document.getElementById("movie_player").wrappedJSObject;
    
        const url = new URL(window.location.href);
        let videoID = url.searchParams.get('v');

        if (videoID != data.videoID) return;

        browser.storage.sync.get().then(function onGot(item) {
            if (item.hasOwnProperty(videoID)) {
                item = item[videoID];
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