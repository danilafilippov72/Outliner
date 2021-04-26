import $, { data, event } from 'jquery';
import "../../styles/style.scss";
import * as treeNodeModule from './Modules/treeNodeModule';



document.addEventListener("DOMContentLoaded", DOMIsReady);
var treeMainNode;

function DOMIsReady() {
      treeMainNode = document.getElementById("InitialNode");

      createTreeHierarchy();

      function createTreeHierarchy() {
            chrome.runtime.sendMessage({ Message: "Structure" }, (response) => addListenersToTreeNodes());

            function addListenersToTreeNodes() {
                  Array.from(document.getElementsByClassName('treeNode')).forEach((treeNode) => treeNodeModule.addingListenerToTreeNode(treeNode));
            }
      }

      

      Main();
}


function Main() {
      document.addEventListener('keydown', event => addListenerToKeyDown(event));

      function saveData(treeNode) {
            function download(content, fileName, contentType) {
                  var file = new Blob([content], { type: contentType });
                  var data = URL.createObjectURL(file);
                  chrome.downloads.download({ url: data,  filename: fileName}, function (downloadId) {
                        console.log("download begin, the downId is:" + downloadId);
                  });
            }
            console.log('!!!!!!!!!!!!!!!!');
            download(JSON.stringify(dataSaving(treeNode)), 'Outliner/json.txt', 'text/plain');

            function dataSaving(treeNode) {
                  if (treeNodeModule.treeNodeNOChildren(treeNode))
                        return {};

                  let data = {};

                  Array.from(treeNodeModule.treeNodeChildren(treeNode)).forEach(saveTreeNodeInfo);

                  function saveTreeNodeInfo(treeNodeChild) {
                        data[treeNodeChild.id] = {
                              label: getLabelOfTreeNode(),
                              title: treeNodeChild.querySelector('.font').textContent,
                              link: getUrlOfTreeNode(treeNodeChild),
                              children: dataSaving(treeNodeChild)
                        };


                        function getLabelOfTreeNode() {
                              let label = treeNodeChild.querySelector('.label');
                              if (label != null)
                                    return label;
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
      $.ajax({
            type: "POST",
            url: "~/main.py",
            data: { param: text }
      });


      function addListenerToKeyDown(event) {
            if (event.key == 'q' && event.ctrlKey) {
                  Array.from(document.getElementsByClassName('treeNode')).forEach(element => {
                        var treeNode = $('#' + element.id);
                        if (treeNode.getElementsByClassName('treeContent').length > 0 && !treeNode.children().eq(1).children().eq(1).is(":visible")) {
                              treeNode.children().eq(3).stop().slideUp();
                              treeNode.children().eq(4).stop().slideUp();
                              treeNode.children().eq(1).children().eq(1).stop().fadeIn();
                        }
                  });
            }
            if (event.key == 'e' && event.ctrlKey)
                  Array.from(document.getElementsByClassName('selectableConstantly')).forEach((treeNode) => removeTreeNode(treeNode));
            if (event.key === "Enter") {
                  console.log('enter');
                  if ("activeElement" in document)
                        document.activeElement.blur();
            }
      }
      function removeTreeNode(treeNode) {
            chrome.tabs.remove(treeNodeModule.getId(treeNode));

            if (!treeNodeModule.treeNodeNOChildren(treeNode)) {
                  let treeNodeParentStructure = treeNodeModule.treeNodeParentStructure(treeNode);
                  Array.from(treeNodeModule.treeNodeChildren(treeNode)).forEach(treeNode => {
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
            if (treeNodeModule.getNodeByTabId(tab.id) == null)
                  addTreeNode(tab, tab.isWindow, tab.lastTreeNode);
      }
      else if (tab.purpose == "change") {
            treeNodeModule.getNodeByTabId(tab.id).querySelector('.font').textContent = tab.title;
      }
      else if (tab.purpose == "remove") {
            makeTabFaded(tab);
      }

      else if (tab.purpose == "createWindow") {
            document.getElementById(tab.id).remove();
      }

      function addTreeNode(tabOpen, isWindow = false, lastTreeNode = true) {
            let tab = new treeNodeModule.Tab(tabOpen);
            let tabParentNode = new treeNodeModule.TreeNodeActive(treeMainNode);

            if (tab.isOpennedFromAnother() && tab.opennedTabIsOpenned()) tabParentNode.setToOpennedFromTab(tab.tab.opennedFromId);
            if (tabParentNode.doesntHaveContentChild()) tabParentNode.addContentChild();

            tabParentNode.addTab(tab.tab, isWindow, lastTreeNode);

            treeNodeModule.addingListenerToTreeNode(tabParentNode.treeNode);
            treeNodeModule.addingListenerToTreeNode(treeNodeModule.treeNodeChild(tabParentNode.treeNode));
      }

      function makeTabFaded(tab) {
            let treeNode = treeNodeModule.getNodeByTabId(tab.id);

            treeNodeModule.fadeTreeNode(treeNode);
      }
}

