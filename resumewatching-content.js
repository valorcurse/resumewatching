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

browser.runtime.onMessage.addListener((dataender) => {
    let uuid = browser.runtime.getURL('/');
    let player = document.getElementById("movie_player").wrappedJSObject;
    
    const url = new URL(window.location.href);
    let videoID = url.searchParams.get('v');

    log("videoID", videoID, data.videoID);
    
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

    poll(player, videoID, uuid);
});