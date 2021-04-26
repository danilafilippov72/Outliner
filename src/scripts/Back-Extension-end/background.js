import * as treeNodeModule from '../Front-end/Modules/treeNodeModule';
openingOutliner();

var tabMainId;

chrome.runtime.onMessage.addListener(addListener_CreatingOutliner);
addListeners_Tabs();


function openingOutliner() {

  chrome.runtime.onInstalled.addListener(openOutliner);
  chrome.action.onClicked.addListener(addListener_IconOpenOutliner);


  function openOutliner() {
    chrome.windows.create(
      {
        type: "panel",
        url: chrome.runtime.getURL("popup.html")
      }
    );
    chrome.tabs.query({ windowType: 'popup' }, (tabs) => { tabMainId = tabs[0].id; console.log(tabMainId); });
  }


  function addListener_IconOpenOutliner() {
    chrome.tabs.query({ windowType: 'popup' }, (tabs) => {
      console.log(tabs.length);
      if (tabs.length == 0) openOutliner();
    });
  }

}


function addListener_CreatingOutliner(request, sender, sendResponse) {
  if (request.Message == "Structure") {

    chrome.windows.getAll({ populate: true }, createOutlinerSctructure);

    return true;
  }

  function createOutlinerSctructure(windows) {

    windows.forEach(function (window) {

      chrome.tabs.sendMessage(tabMainId, {
        purpose: "create",
        opennedFromId: -100,
        title: "Window",
        id: window.id,
        isWindow: true, lastTreeNode: false
      });

      window.tabs.forEach(function (tab) {

        chrome.tabs.sendMessage(tabMainId, {
          purpose: "create",
          opennedFromId: window.id,
          title: tab.title,
          url: tab.url,
          id: tab.id,
          isWindow: false, lastTreeNode: true
        });

      });

    });
    sendResponse('GOOD');
  }
}



function addListeners_Tabs() {

  chrome.windows.onCreated.addListener((window) => CreateWindow(window, "create"));
  chrome.tabs.onCreated.addListener((opennedTab) => CreateTab(opennedTab, "create"));

  chrome.tabs.onUpdated.addListener((tabId) => {
    chrome.tabs.get(tabId, (tab) => CreateTab(tab, "change"));
  });

  chrome.tabs.onRemoved.addListener((closedTabId) => {

    chrome.tabs.sendMessage(tabMainId, {
      purpose: "remove",
      id: closedTabId
    });
  });

  function CreateWindow(window, purp) {

    chrome.tabs.sendMessage(
      tabMainId,
      {
        purpose: purp,
        opennedFromId: "InitialNode",
        title: "Window",
        id: window.id,
        isWindow: true, lastTreeNode: false
      });


  }

  function CreateTab(tab, purp) {
    var opennedFromId = -100;

    if (typeof tab.openerTabId != 'undefined') opennedFromId = tab.openerTabId;
    else if (typeof tab.windowId != 'undefined') opennedFromId = tab.windowId;
    chrome.tabs.query({ windowType: 'popup' }, (tabs) => { tabMainId = tabs[0].id; });

    chrome.tabs.sendMessage(
      tabMainId,
      {
        purpose: purp,
        opennedFromId: opennedFromId,
        title: tab.title,
        id: tab.id,
        isWindow: false, lastTreeNode: true
      });
  }

}

