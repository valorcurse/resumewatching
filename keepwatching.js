// Disable debug logging
// console.debug = function () {};

console.debug("ResumeWatching: loaded!");
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
            console.debug("ResumeWatching:", "Found stored time for this video", item["currentTime"]);
            player.seekTo(item["currentTime"]);        
        } 
    } else {
        console.debug("ResumeWatching:", "Couldn't find stored time for this video.");
    }
    
    poll();
});

browser.storage.sync.onChanged.addListener((changes) => {

    let currentTime = Math.floor(player.getCurrentTime());
    if (changes.hasOwnProperty(videoID)) {
        let newTime = Math.floor(changes[videoID].newValue.currentTime);
        
        if (newTime != currentTime) {
            player.seekTo(newTime);      
        }  
    }
});
async function poll() {
    
    while (true) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
            
            let currentTime = Math.floor(player.getCurrentTime());
            
            console.debug("ResumeWatching:", "Storing time", currentTime);
            browser.storage.sync.set({
                [videoID]: { currentTime: currentTime }
            });
            
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
}