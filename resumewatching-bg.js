browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Browser tab reloaded!");
  if (changeInfo.status == "complete") {
    const url = new URL(tab.url);
    console.log("creating url", url);
    const videoParam = url.searchParams.get('v');
    console.log("comparing videoParam", videoParam);
    if (videoParam) {
      console.log("sending message");
      browser.tabs.sendMessage(tabId, {videoID: videoParam});
    }
  }
});

function onError(error) {
  console.error(`Error: ${error}`);
}


browser.webNavigation.onHistoryStateUpdated.addListener(history => {
  console.error("History updated!");
    const url = new URL(history.url);
    const videoParam = url.searchParams.get('v');
    console.log("videoParam" , videoParam)
    if (!videoParam) {
        // not a video
        return;
    }

    browser.tabs
      .sendMessage(history.tabId, {videoID: videoParam});
  },
  {url: [{urlMatches: '^https://www.youtube.com/watch\?.+'}]}
);

