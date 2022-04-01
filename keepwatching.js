// Disable debug logging
console.debug = function () {};

console.debug("KeepWatching: loaded!");
const PLAYER_STATE = {
    PLAYING: 1,
    PAUSED: 2
}

let player = document.getElementById("movie_player").wrappedJSObject;
let videoID = player.getVideoData()['video_id'];

let storedCurrentTime = browser.storage.sync.get(videoID).then(function onGot(item) {
    if (item.hasOwnProperty(videoID)) {
        item = item[videoID];
        if (item.hasOwnProperty("currentTime")) {
            console.debug("KeepWatching:", item["currentTime"]);
            player.seekTo(item["currentTime"]);        
        } 
    } else {
        console.debug("KeepWatching:", "Couldn't find stored time for this video.");
    }
    
    poll();
});

async function poll() {
    
    while (true) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
            
            let currentTime = player.getCurrentTime();
            
            console.debug("KeepWatching: ", "Storing time", currentTime);
            browser.storage.sync.set({
                [videoID]: { currentTime: currentTime }
            });
            
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
}