"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNodeByTabId = getNodeByTabId;
exports.getId = getId;
exports.fadeTreeNode = fadeTreeNode;
exports.treeNodeChildren = treeNodeChildren;
exports.treeNodeNOChildren = treeNodeNOChildren;
exports.treeNodeParent = treeNodeParent;
exports.treeNodeParentStructure = treeNodeParentStructure;
exports.treeNodeChild = treeNodeChild;
exports.addingListenerToTreeNode = addingListenerToTreeNode;
exports.TreeNodeActive = exports.Tab = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function getNodeByTabId(id) {
  var node = document.getElementById(id);
  if (node != null) return node;else return document.getElementById('window-' + id);
}

function getId(treeNode) {
  var idStr = treeNode.id;
  if (idStr.indexOf('-')) return parseInt(idStr.slice(idStr.indexOf('-') + 1));
  return parseInt(idStr);
}

function fadeTreeNode(treeNode) {
  treeNode.classList.add('Faded');
}

function treeNodeChildrenLength(treeNode) {
  var length = treeNode.getElementsByClassName('treeContent').length != 0 ? treeNode.getElementsByClassName('treeContent')[0].children[0].childElementCount : 0;
  return length;
}

function treeNodeChildren(treeNode) {
  return treeNode.querySelector('.treeContent').children[0].children;
}

function treeNodeNOChildren(treeNode) {
  return treeNode.getElementsByClassName('treeContent').length == 0;
}

function treeNodeParent(treeNode) {
  return treeNode.parentElement.parentElement.parentElement;
}

function treeNodeParentStructure(treeNode) {
  return treeNodeParent(treeNode).getElementsByClassName('treeContent')[0].children[0];
}
/* export function treeNodeParent(treeNode) {
    return treeNode.parentElement.parentElement.parentElement;
} */


function makeLastTreeNode(treeNode) {
  treeNode.getElementsByClassName('treeContent').remove();
}

function treeNodeChild(treeNode) {
  return treeNode.getElementsByClassName('treeContent')[0].children[0].children[0];
}

function addingListenerToTreeNode(treeNode) {
  var treeNodeParts = selectableNodes(treeNode);

  for (var count = 0; count < treeNodeParts.length; count++) {
    /*  treeNodeParts[count].addEventListener('click', lClick);
     treeNodeParts[count].addEventListener('dblclick', dblClick); */
    LAndDoubleclick(treeNodeParts[count]);
    treeNodeParts[count].addEventListener("mouseenter", selectTreeNode);
    treeNodeParts[count].addEventListener('mouseout', unSelectTreeNode);

    window.oncontextmenu = function () {
      return false;
    };

    treeNodeParts[count].addEventListener('mousedown', chekingRClick);
    treeNodeParts[count].addEventListener('mouseup', rightMouseUp);
  }

  var posX = -1;
  var posY = -1;

  function chekingRClick(e) {
    if (e.button == 2) {
      posX = e.clientX;
      posY = e.clientY;
    }
  }

  function rightMouseUp(e) {
    if (e.button == 2 && Math.abs(posX - e.clientX) <= 10 && Math.abs(posY - e.clientY) <= 10) {
      selectConstantlyTreeNode(e);
    }

    posX = -1;
    posY = -1;
  }

  function selectConstantlyTreeNode(e) {
    var treeNode = findParetTreeNode(e.target);
    if (e.ctrlKey != true) clearSelecting();
    selectTreeNode(e);
    treeNode.classList.add('selectableConstantly');

    function clearSelecting() {
      Array.from(document.getElementsByClassName('selectableConstantly')).forEach(function (node) {
        findParetTreeNode(node).querySelector('.treeNodeBorder').classList.remove('selectable');
        node.classList.remove('selectableConstantly');
      });
    }
  }

  function LAndDoubleclick(node) {
    node.addEventListener('click', click);
    var oneClick = false;
    var timeout;

    function click(e) {
      if (oneClick == false) {
        oneClick = true;
        lClick(e);
        timeout = setTimeout(function () {
          oneClick = false;
        }, 300);
      } else {
        clearTimeout(timeout);
        dblClick(e);
        oneClick = false;
      }
    }
  }

  addListener_DragElement(treeNodeParts, treeNode);

  function lClick(e) {
    var treeNode = findParetTreeNode(e.target);

    if (treeNode.classList.contains('Faded')) {
      openTab();
      treeNode.classList.remove('Faded');
    } else {
      goToTab();
    }

    function openTab() {
      chrome.tabs.create({
        url: treeNode.getAttribute('url'),
        windowId: getParentId(treeNode)
      }, function (tab) {
        return ChangeFadedId(tab);
      });

      function ChangeFadedId(tab) {
        treeNode.id = tab.id;
      }

      function getParentId(treeNode) {
        var idStr = treeNodeParent(treeNode).id;
        if (idStr.indexOf('-')) return parseInt(idStr.slice(idStr.indexOf('-') + 1));
        return parseInt(idStr);
      }
    }

    function goToTab() {
      chrome.tabs.get(Number.parseInt(treeNode.id), function (tab) {
        chrome.windows.update(tab.windowId, {
          focused: true
        });
        chrome.tabs.update(tab.id, {
          selected: true
        });
      });
    }
  }

  function selectableNodes(treeNode) {
    return [treeNode.querySelector('.selectableMargin'), treeNode.querySelector('.dragging'), treeNode.querySelector('.selectableBottomMargin')];
  }

  function dblClick(e) {
    rename(findParetTreeNode(e.target));

    function rename(treeNode) {
      if (treeNode.getElementsByClassName('nodeName')[0].childElementCount == 1) {
        treeNode.getElementsByClassName('nodeName')[0].insertAdjacentElement('afterbegin', document.createElement('input'));
        var _label = treeNode.getElementsByClassName('nodeName')[0].children[0];

        _label.classList.add('label');
      }

      var label = treeNode.getElementsByClassName('nodeName')[0].children[0];
      label.readOnly = false;
      label.style.pointerEvents = "all";
      label.addEventListener('input', resizeInput);
      resizeInput.call(label);
      label.addEventListener('focusout', listenerFocusOut_makeInputReadOnly);
      label.focus();

      function resizeInput() {
        this.style.width = this.value.length + 1 + "ch";
      }

      function listenerFocusOut_makeInputReadOnly(e) {
        label.style.pointerEvents = "none";
        label.readOnly = true;
        label.style.width = this.value.length + 1 + "ch";
        /* label.value  += " - "; */
      }
    }
  }

  function selectTreeNode(e) {
    var treeNode = findParetTreeNode(e.target);
    if (!treeNode.classList.contains('selectableConstantly')) treeNode.querySelector('.treeNodeBorder').classList.add('selectable');
  }

  function unSelectTreeNode(e) {
    var treeNode = findParetTreeNode(e.target);
    if (!treeNode.classList.contains('selectableConstantly')) treeNode.querySelector('.treeNodeBorder').classList.remove('selectable');
  }

  function addListener_DragElement(treeNodeParts, treeNode) {
    for (var node in treeNodeParts) {
      treeNodeParts[node].onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      if (e.button == 0) leftMouseDown(e);
    }

    function leftMouseDown(e) {
      var drag = setTimeout(dragStart, 3000);
      document.onmousemove = initialCheckingMoving;

      document.onmouseup = function () {
        clearTimeout(drag);
        stopDragging();
      };

      function initialCheckingMoving() {
        clearTimeout(drag);
        var initialElementPositionX = e.clientX;
        var initialElementPositionY = e.clientY;
        document.onmousemove = checkMoving;

        function checkMoving(e) {
          if (Math.abs(e.clientX - initialElementPositionX) > 5 || Math.abs(e.clientY - initialElementPositionY) > 5) document.onmousemove = dragStart;
        }
      }

      function dragStart() {
        var initialPositionX = e.clientX;
        var initialPositionY = e.clientY;
        var changeInPosititonsX;
        var changeInPosititonsY;
        cssInitialForDragging(treeNode);
        if (treeNodeChildrenLength(treeNodeParent(treeNode)) == 0) makeLastTreeNode();
        document.getElementById('draggingELement').appendChild(treeNode);
        document.onmousemove = dragging;
        document.onmouseup = dragMouseUp;

        function cssInitialForDragging(element) {
          changeInPosititonsX = e.clientX - element.getBoundingClientRect().left;
          changeInPosititonsY = e.clientY - element.getBoundingClientRect().top;
          element.style.setProperty('top', initialPositionY - changeInPosititonsY + 'px');
          element.style.setProperty('left', initialPositionX - changeInPosititonsX + 'px');
        }

        function dragging(e) {
          initialPositionX = e.clientX;
          initialPositionY = e.clientY;
          treeNode.style.setProperty('top', initialPositionY + (e.clientY - initialPositionY) - changeInPosititonsY + window.scrollY + 'px');
          treeNode.style.setProperty('left', initialPositionX + (e.clientX - initialPositionX) - changeInPosititonsX + 'px');
          var treeNodeClosestTo = marginTreeNode();
          if (treeNodeClosestTo == null || e.clientY > treeNodeClosestTo.getBoundingClientRect().bottom || e.clientY < treeNodeClosestTo.getBoundingClientRect().top) treeNodeClosestTo = findClosestTreeNodeByXYPosition(document.getElementById("InitialNode"), e.clientY);
          var innerSpaceForChildPlacement = 7;
          var elementMiddle = treeNodeClosestTo.getBoundingClientRect().bottom - treeNodeClosestTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height - (treeNodeClosestTo.getBoundingClientRect().height - treeNodeClosestTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height - treeNodeClosestTo.querySelector('.selectableMargin').getBoundingClientRect().height) / 2;

          if (e.clientY >= innerSpaceForChildPlacement + elementMiddle) {
            treeNodeClosestTo.classList.remove('addUp');
            treeNodeClosestTo.classList.add('addBottom');
          } else if (e.clientY <= -innerSpaceForChildPlacement + elementMiddle) {
            treeNodeClosestTo.classList.remove('addBottom');
            treeNodeClosestTo.classList.add('addUp');
          } else {
            treeNodeClosestTo.classList.remove('addUp');
            treeNodeClosestTo.classList.remove('addBottom');
          }
        }

        function dragMouseUp(e) {
          clearTimeout(drag);
          stopDragging();
          PlaceTreeNode(e);

          function PlaceTreeNode(e) {
            var YPosition = e.clientY;
            var treeNodeAppendTo = marginTreeNode();
            if (treeNodeAppendTo == null || e.clientY > treeNodeAppendTo.getBoundingClientRect().bottom || e.clientY < treeNodeAppendTo.getBoundingClientRect().top) treeNodeAppendTo = findClosestTreeNodeByXYPosition(document.getElementById("InitialNode"), e.clientY);
            Array.from(document.getElementsByClassName('addUp')).forEach(clearSpacesForPlacementUp);

            function clearSpacesForPlacementUp(element) {
              element.classList.remove('addUp');
            }

            Array.from(document.getElementsByClassName('addBottom')).forEach(clearSpacesForPlacementBottom);

            function clearSpacesForPlacementBottom(element) {
              element.classList.remove('addBottom');
            }

            var innerSpaceForChildPlacement = 7;
            var elementMiddle = treeNodeAppendTo.getBoundingClientRect().bottom - treeNodeAppendTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height - (treeNodeAppendTo.getBoundingClientRect().height - treeNodeAppendTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height - treeNodeAppendTo.querySelector('.selectableMargin').getBoundingClientRect().height) / 2;

            if (e.clientY >= innerSpaceForChildPlacement + elementMiddle) {
              treeNodeAppendTo.insertAdjacentElement('afterend', treeNode);
              console.log(22);
              $(treeNodeAppendTo.nextSibling).hide();
              $(treeNodeAppendTo.nextSibling).fadeIn(1000);
            } else if (e.clientY <= -innerSpaceForChildPlacement + elementMiddle) {
              treeNodeAppendTo.insertAdjacentElement('beforebegin', treeNode);
              $(treeNodeAppendTo.previousSibling).hide();
              $(treeNodeAppendTo.previousSibling).fadeIn(1000);
            } else {
              var tabParentNode = new TreeNodeActive(treeNodeAppendTo);
              if (tabParentNode.doesntHaveContentChild()) tabParentNode.addContentChild();
              treeNodeAppendTo.getElementsByClassName('treeContent')[0].children[0].insertAdjacentElement('afterbegin', treeNode);
            }

            treeNode.classList.remove('dragElement');
            treeNode.style = "";
            addingListenerToTreeNode(treeNode);
            addingListenerToTreeNode(treeNodeParent(treeNode));
          }

          function findInitialTreeNode(element) {
            while (!treeNodeIsInitial(element)) {
              element = element.parentElement;
              if (element.className == "treeNode") return element;
            }
          }
        }

        function marginTreeNode() {
          if (document.querySelector('.addUp') == null) return document.querySelector('.addBottom');else return document.querySelector('.addUp');
        }

        function findClosestTreeNodeByXYPosition(treeNodeElement, YPosition) {
          if (treeNodeChildrenLength(treeNodeElement) == 1 && treeNodeElement.id != treeNode.id) return findClosestTreeNodeByXYPosition(treeNodeChild(treeNodeElement), YPosition);else if (treeNodeChildrenLength(treeNodeElement) == 0) return treeNodeElement;else {
            var closestTreeNode = getClosestTreeNode(treeNodeElement, YPosition);
            if (closestTreeNode.isReady) return closestTreeNode.treeNodeInner;else return findClosestTreeNodeByXYPosition(closestTreeNode.treeNodeInner, YPosition);
          }

          function getClosestTreeNode(treeNodeElement, YPosition) {
            for (var index = 0; index < treeNodeChildrenLength(treeNodeElement); index++) {
              var treeNodeInner = treeNodeChildren(treeNodeElement)[index];
              if (treeNodeInner.id == treeNode.id) continue;
              var treeNodeTopPosition = treeNodeInner.getBoundingClientRect().top;
              var treeNodeBottomPosition = treeNodeInner.getBoundingClientRect().bottom;

              if (treeNodeTopPosition >= YPosition && treeNodeBottomPosition >= YPosition && treeNodeInner.id != treeNodeElement.id) {
                return {
                  treeNodeInner: treeNodeInner,
                  isReady: true
                };
              } else if (treeNodeTopPosition <= YPosition && YPosition <= treeNodeBottomPosition && treeNodeInner.id != treeNodeElement.id) return {
                treeNodeInner: treeNodeInner,
                isReady: false
              };else continue;
            }

            return {
              treeNodeInner: treeNodeElement,
              isReady: true
            };
          }
        }
      }

      function stopDragging() {
        document.onmousemove = null;
        document.onmouseup = null;
      }
    }
  }

  function addListener_hidingElement(treeNode) {
    if (!treeNode.children().eq(1).children().eq(1).is(":visible")) {
      treeNode.children().eq(3).slideUp();
      treeNode.children().eq(4).slideUp();
      treeNode.children().eq(1).children().eq(1).fadeIn();
    } else {
      treeNode.children().eq(3).slideDown();
      treeNode.children().eq(4).slideDown();
      treeNode.children().eq(1).children().eq(1).fadeOut();
    }
  }

  function treeNodeIsInitial(treeNode) {
    return treeNode.id == "InitialNode";
  }

  function findParetTreeNode(element) {
    if (element.classList.contains('treeNode')) return element;else return findParetTreeNode(element.parentElement);
  }
}

var Tab =
/*#__PURE__*/
function () {
  function Tab(tab) {
    _classCallCheck(this, Tab);

    this.tab = tab;
  }

  _createClass(Tab, [{
    key: "isOpennedFromAnother",
    value: function isOpennedFromAnother() {
      return this.tab.opennedFromId != -100;
    }
  }, {
    key: "opennedTabIsOpenned",
    value: function opennedTabIsOpenned() {
      return document.getElementById(this.tab.opennedFromId) != null || document.getElementById('window-' + this.tab.opennedFromId) != null;
    }
  }]);

  return Tab;
}();

exports.Tab = Tab;

var TreeNodeActive =
/*#__PURE__*/
function () {
  function TreeNodeActive(tabParentNode) {
    _classCallCheck(this, TreeNodeActive);

    this.treeNode = tabParentNode;
  }

  _createClass(TreeNodeActive, [{
    key: "setDefaultValue",
    value: function setDefaultValue() {
      this.treeNode = treeMainNode;
    }
  }, {
    key: "setToOpennedFromTab",
    value: function setToOpennedFromTab(tabOpennedFromId) {
      if (document.getElementById(tabOpennedFromId) != null) this.treeNode = document.getElementById(tabOpennedFromId);else this.treeNode = document.getElementById('window-' + tabOpennedFromId);
    }
  }, {
    key: "doesntHaveContentChild",
    value: function doesntHaveContentChild() {
      return this.treeNode.getElementsByClassName('treeContent').length == 0;
    }
  }, {
    key: "addContentChild",
    value: function addContentChild() {
      this.treeNode.innerHTML += " \n                <div class=\"structureLine container\">\n                <div></div>\n                </div>\n          \n          \n                <div class=\"treeContent container\">\n                <div></div>\n                </div>\n                ";
    }
  }, {
    key: "addTab",
    value: function addTab(tab, isWindow, lastTreeNode) {
      var tabCSSProperties = {
        nodeNameClass: isWindow ? 'nodeName__window' : '',
        inRouterClass: lastTreeNode ? 'inRouter__point' : '',
        nodeStructure: lastTreeNode ? '' : " \n                <div class=\"structureLine container\">\n                <div></div>\n                </div>\n          \n          \n                <div class=\"treeContent container\">\n                <div></div>\n                </div>\n                ",
        windowId: isWindow ? 'window-' : ''
      };
      var childTreeNode = document.createElement("div");
      childTreeNode.classList.add('treeNode');
      childTreeNode.id = tabCSSProperties.windowId + tab.id;
      childTreeNode.setAttribute('url', tab.url);
      childTreeNode.innerHTML = "\n            <div class=\"treeNodeBorder\"></div>\n\n            <div class=\"leftLine\"></div>\n        \n            <div class=\"router\">\n            <div class=\"inRouterMinus " + tabCSSProperties.inRouterClass + "\"></div>\n            <div class=\"inRouterPlus\"></div>\n            </div>\n        \n            <div class=\"nodeName " + tabCSSProperties.nodeNameClass + "\">\n            <p class=\"font\">" + tab.title + "</p>\n            </div>\n        \n            " + tabCSSProperties.nodeStructure + "\n        \n            <div class=\"toggle\"></div>\n            <div class=\"dragging\"></div>\n            <div class=\"selectableMargin\"></div>\n            <div class=\"selectableBottomMargin\"></div>\n            ";
      this.treeNode.getElementsByClassName('treeContent')[0].children[0].append(childTreeNode);
    }
  }]);

  return TreeNodeActive;
}();

exports.TreeNodeActive = TreeNodeActive;