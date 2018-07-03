// When the context menu is triggered, save the current tab id so we can refer
// to it back. Save the new tab id as well so we know if we first removed that
// tab. This is to imitate the same functionality of "Open new tab"
var currid = null;
var newid = null;

// Settings.
var settings = {
  get version() {
    return localStorage['version'];
  },
  set version(val) {
    localStorage['version'] = val;
  },
};

/**
 * Callback for context menu that opens link in the foreground tab.
 * @param {dictionary<OnClickData>} info Information about the item clicked and
                                    the context where the click happened.
 * @param {dictionary<Tab>} tab The details of the tab where the click took place.
 */
function openLinkOnForeground(info, tab) {
  // Save tab index of current page.
  currid = tab.id;
  chrome.tabs.create({url: info.linkUrl, index: tab.index + 1}, function(tab) {
    newid = tab.id;
  });
}

/**
 * Listens on tab removals. Update 
 */
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (newid && tabId == newid) {
    chrome.tabs.update(currid, {selected: true})
  } else {
    newid = null; 
  }
});

/**
* Initialization routine.
*/ 
function init() {
  // Check if the version has changed. In case we want to do something in the
  // future.
  var currVersion = chrome.app.getDetails().version;
  var prevVersion = settings.version
  if (currVersion != prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion == 'undefined') {
      // Do nothing now.
    }
    // Update the version incase we want to do something in future.
    settings.version = currVersion;
  }
  
  // Whether we are using Linux or a Mac, we display the correct text case.
  var isUnix = /Mac|Linux/.test(navigator.platform);
  var title = isUnix ? 'Open Link in Foreground Tab' : 'Open link in foreground tab';

  chrome.contextMenus.removeAll();
  
  // Install context menus on links.
  chrome.contextMenus.create({
    id: 'thislink',
    title: title,
    contexts: ['link']
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    openLinkOnForeground(info, tab);
  });
}

init();
