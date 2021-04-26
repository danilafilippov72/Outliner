"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _jquery = _interopRequireWildcard(require("jquery"));

require("../../styles/style.scss");

var treeNodeModule = _interopRequireWildcard(require("./Modules/treeNodeModule"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

document.addEventListener("DOMContentLoaded", DOMIsReady);
var treeMainNode;

function DOMIsReady() {
  treeMainNode = document.getElementById("InitialNode");
  createTreeHierarchy();

  function createTreeHierarchy() {
    chrome.runtime.sendMessage({
      Message: "Structure"
    }, function (response) {
      return addListenersToTreeNodes();
    });

    function addListenersToTreeNodes() {
      Array.from(document.getElementsByClassName('treeNode')).forEach(function (treeNode) {
        return treeNodeModule.addingListenerToTreeNode(treeNode);
      });
    }
  }

  Main();
}

function Main() {
  document.addEventListener('keydown', function (event) {
    return addListenerToKeyDown(event);
  });

  function saveData(treeNode) {
    function download(content, fileName, contentType) {
      var file = new Blob([content], {
        type: contentType
      });
      var data = URL.createObjectURL(file);
      chrome.downloads.download({
        url: data,
        filename: fileName
      }, function (downloadId) {
        console.log("download begin, the downId is:" + downloadId);
      });
    }

    console.log('!!!!!!!!!!!!!!!!');
    download(JSON.stringify(dataSaving(treeNode)), 'Outliner/json.txt', 'text/plain');

    function dataSaving(treeNode) {
      if (treeNodeModule.treeNodeNOChildren(treeNode)) return {};
      var data = {};
      Array.from(treeNodeModule.treeNodeChildren(treeNode)).forEach(saveTreeNodeInfo);

      function saveTreeNodeInfo(treeNodeChild) {
        data[treeNodeChild.id] = {
          label: getLabelOfTreeNode(),
          title: treeNodeChild.querySelector('.font').textContent,
          link: getUrlOfTreeNode(treeNodeChild),
          children: dataSaving(treeNodeChild)
        };

        function getLabelOfTreeNode() {
          var label = treeNodeChild.querySelector('.label');
          if (label != null) return label;
          return '';
        }

        function getUrlOfTreeNode() {
          return treeNodeChild.getAttribute('url');
        }
      }

      return data;
    }
  }

  saveData(document.getElementById("InitialNode"));

  _jquery["default"].ajax({
    type: "POST",
    url: "~/main.py",
    data: {
      param: text
    }
  });

  function addListenerToKeyDown(event) {
    if (event.key == 'q' && event.ctrlKey) {
      Array.from(document.getElementsByClassName('treeNode')).forEach(function (element) {
        var treeNode = (0, _jquery["default"])('#' + element.id);

        if (treeNode.getElementsByClassName('treeContent').length > 0 && !treeNode.children().eq(1).children().eq(1).is(":visible")) {
          treeNode.children().eq(3).stop().slideUp();
          treeNode.children().eq(4).stop().slideUp();
          treeNode.children().eq(1).children().eq(1).stop().fadeIn();
        }
      });
    }

    if (event.key == 'e' && event.ctrlKey) Array.from(document.getElementsByClassName('selectableConstantly')).forEach(function (treeNode) {
      return removeTreeNode(treeNode);
    });

    if (event.key === "Enter") {
      console.log('enter');
      if ("activeElement" in document) document.activeElement.blur();
    }
  }

  function removeTreeNode(treeNode) {
    chrome.tabs.remove(treeNodeModule.getId(treeNode));

    if (!treeNodeModule.treeNodeNOChildren(treeNode)) {
      var treeNodeParentStructure = treeNodeModule.treeNodeParentStructure(treeNode);
      Array.from(treeNodeModule.treeNodeChildren(treeNode)).forEach(function (treeNode) {
        treeNodeParentStructure.append(treeNode);
      });
    }

    treeNode.remove();
  }
}
/* setInterval(saveData(document.getElementById('InitialNode')), 5000); */


chrome.runtime.onMessage.addListener(changesTabOrWindow);

function changesTabOrWindow(tab) {
  if (tab.purpose == "create") {
    if (treeNodeModule.getNodeByTabId(tab.id) == null) addTreeNode(tab, tab.isWindow, tab.lastTreeNode);
  } else if (tab.purpose == "change") {
    treeNodeModule.getNodeByTabId(tab.id).querySelector('.font').textContent = tab.title;
  } else if (tab.purpose == "remove") {
    makeTabFaded(tab);
  } else if (tab.purpose == "createWindow") {
    document.getElementById(tab.id).remove();
  }

  function addTreeNode(tabOpen) {
    var isWindow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var lastTreeNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var tab = new treeNodeModule.Tab(tabOpen);
    var tabParentNode = new treeNodeModule.TreeNodeActive(treeMainNode);
    if (tab.isOpennedFromAnother() && tab.opennedTabIsOpenned()) tabParentNode.setToOpennedFromTab(tab.tab.opennedFromId);
    if (tabParentNode.doesntHaveContentChild()) tabParentNode.addContentChild();
    tabParentNode.addTab(tab.tab, isWindow, lastTreeNode);
    treeNodeModule.addingListenerToTreeNode(tabParentNode.treeNode);
    treeNodeModule.addingListenerToTreeNode(treeNodeModule.treeNodeChild(tabParentNode.treeNode));
  }

  function makeTabFaded(tab) {
    var treeNode = treeNodeModule.getNodeByTabId(tab.id);
    treeNodeModule.fadeTreeNode(treeNode);
  }
}