// Disable debug logging
// console.debug = function () {};

function print(...string) {
    console.debug("ResumeWatching:", ...string);
}

print("loaded!");
print(browser.runtime.getURL('/'));
let uuid = browser.runtime.getURL('/');
const PLAYER_STATE = {
    PLAYING: 1,
    PAUSED: 2
}

let player = document.getElementById("movie_player").wrappedJSObject;
let videoID = player.getVideoData()['video_id'];
let currentTime = Math.floor(player.getCurrentTime());

browser.storage.sync.get(videoID).then(function onGot(item) {
    if (item.hasOwnProperty(videoID)) {
        item = item[videoID];
        if (item.hasOwnProperty("currentTime")) {
            print("Found stored time for this video", item["currentTime"]);
            player.seekTo(item["currentTime"]);        
        } 
    } else {
        print("Couldn't find stored time for this video.");
    }
    
    poll();
});

browser.storage.sync.onChanged.addListener((changes) => {
    if (changes.hasOwnProperty(videoID)) {
        let changeUUID = Math.floor(changes[videoID].newValue.uuid);
        let newTime = Math.floor(changes[videoID].newValue.currentTime);
        if (uuid != changeUUID && newTime != currentTime) {
            print("New synced time", newTime);
            player.seekTo(newTime);
        }  
    }
});

async function poll() {
    
    while (true) {
        if (player.getPlayerState() === PLAYER_STATE.PLAYING) {
            
            currentTime = Math.floor(player.getCurrentTime());
            
            print("Storing time", currentTime);
            browser.storage.sync.set({
                [videoID]: { uuid: uuid, currentTime: currentTime }
            });
            
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
}