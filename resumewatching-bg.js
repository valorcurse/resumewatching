function onError(error) {
  console.error(`Error: ${error}`);
}

function getVideoID(tabUrl) {
  const url = new URL(tabUrl);
  console.log("Creating url", url);
  
  const videoParam = url.searchParams.get('v');
  console.log("Getting videoParam", videoParam);
  
  return videoParam;
}

// function sendMessage(tabId, videoParam) {
//   browser.tabs.executeScript(tabId, {
//     file: "resumewatching-content.js"
//   }).then(() => {
//     browser.tabs.sendMessage(tabId, {videoID: videoParam});
//   }).catch(onError);
// }

function sendMessage(tabId, videoParam) {
  browser.tabs.executeScript(tabId, {
    code: 'typeof PLAYER_STATE !== "undefined";'
  }).then((results) => {
    if (!results[0]) {
      return browser.tabs.executeScript(tabId, {
        file: "resumewatching-content.js"
      });
    }
  }).then(() => {
    browser.tabs.sendMessage(tabId, {videoID: videoParam});
  }).catch(onError);
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Browser tab reloaded!");
  if (changeInfo.status == "complete") {
    
    let videoParam = getVideoID(tab.url);
    if (videoParam) {
      console.log("Sending message:", tabId, {videoID: videoParam});
      sendMessage(tabId, videoParam);
    }
  }
});

browser.webNavigation.onHistoryStateUpdated.addListener(history => {
  console.error("History updated!");
  const videoParam = getVideoID(history.url);
  
  if (videoParam) {
    // browser.tabs.sendMessage(history.tabId, {videoID: videoParam});
    sendMessage(history.id, videoParam);
  }
},
{url: [{urlMatches: '^https://www.youtube.com/watch\?.+'}]}
);

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed or updated", details);
  
  // Query all active tabs
  browser.tabs.query({active: true, currentWindow: false}).then((tabs) => {
    tabs.forEach((tab) => {
      console.log("tab:", tab.id, tab.url);
      
      const videoParam = getVideoID(tab.url);
      if (videoParam) {
        console.log("Sending message:", tab.id, {videoID: videoParam});
        sendMessage(tab.id, videoParam);
      }
      
    });
  }).catch(onError);
});