"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var treeNodeModule = _interopRequireWildcard(require("../Front-end/Modules/treeNodeModule"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

openingOutliner();
var tabMainId;
chrome.runtime.onMessage.addListener(addListener_CreatingOutliner);
addListeners_Tabs();

function openingOutliner() {
  chrome.runtime.onInstalled.addListener(openOutliner);
  chrome.action.onClicked.addListener(addListener_IconOpenOutliner);

  function openOutliner() {
    chrome.windows.create({
      type: "panel",
      url: chrome.runtime.getURL("popup.html")
    });
    chrome.tabs.query({
      windowType: 'popup'
    }, function (tabs) {
      tabMainId = tabs[0].id;
      console.log(tabMainId);
    });
  }

  function addListener_IconOpenOutliner() {
    chrome.tabs.query({
      windowType: 'popup'
    }, function (tabs) {
      console.log(tabs.length);
      if (tabs.length == 0) openOutliner();
    });
  }
}

function addListener_CreatingOutliner(request, sender, sendResponse) {
  if (request.Message == "Structure") {
    chrome.windows.getAll({
      populate: true
    }, createOutlinerSctructure);
    return true;
  }

  function createOutlinerSctructure(windows) {
    windows.forEach(function (window) {
      chrome.tabs.sendMessage(tabMainId, {
        purpose: "create",
        opennedFromId: -100,
        title: "Window",
        id: window.id,
        isWindow: true,
        lastTreeNode: false
      });
      window.tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tabMainId, {
          purpose: "create",
          opennedFromId: window.id,
          title: tab.title,
          url: tab.url,
          id: tab.id,
          isWindow: false,
          lastTreeNode: true
        });
      });
    });
    sendResponse('GOOD');
  }
}

function addListeners_Tabs() {
  chrome.windows.onCreated.addListener(function (window) {
    return CreateWindow(window, "create");
  });
  chrome.tabs.onCreated.addListener(function (opennedTab) {
    return CreateTab(opennedTab, "create");
  });
  chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.tabs.get(tabId, function (tab) {
      return CreateTab(tab, "change");
    });
  });
  chrome.tabs.onRemoved.addListener(function (closedTabId) {
    chrome.tabs.sendMessage(tabMainId, {
      purpose: "remove",
      id: closedTabId
    });
  });

  function CreateWindow(window, purp) {
    chrome.tabs.sendMessage(tabMainId, {
      purpose: purp,
      opennedFromId: "InitialNode",
      title: "Window",
      id: window.id,
      isWindow: true,
      lastTreeNode: false
    });
  }

  function CreateTab(tab, purp) {
    var opennedFromId = -100;
    if (typeof tab.openerTabId != 'undefined') opennedFromId = tab.openerTabId;else if (typeof tab.windowId != 'undefined') opennedFromId = tab.windowId;
    chrome.tabs.query({
      windowType: 'popup'
    }, function (tabs) {
      tabMainId = tabs[0].id;
    });
    chrome.tabs.sendMessage(tabMainId, {
      purpose: purp,
      opennedFromId: opennedFromId,
      title: tab.title,
      id: tab.id,
      isWindow: false,
      lastTreeNode: true
    });
  }
}