export function getNodeByTabId(id) {
    let node = document.getElementById(id);
    if (node != null)
        return node;
    else
        return document.getElementById('window-' + id);
}

export function getId(treeNode) {
    let idStr = treeNode.id;
    if (idStr.indexOf('-'))
        return parseInt(idStr.slice(idStr.indexOf('-') + 1));
    return parseInt(idStr);
}

export function fadeTreeNode(treeNode) {
    treeNode.classList.add('Faded');
}

function treeNodeChildrenLength(treeNode) {
    let length = treeNode.getElementsByClassName('treeContent').length != 0 ? treeNode.getElementsByClassName('treeContent')[0].children[0].childElementCount : 0;
    return length;
}

export function treeNodeChildren(treeNode) {
    return treeNode.querySelector('.treeContent').children[0].children;
}

export function treeNodeNOChildren(treeNode) {
    return treeNode.getElementsByClassName('treeContent').length == 0;
}

export function treeNodeParent(treeNode) {
    return treeNode.parentElement.parentElement.parentElement;
}

export function treeNodeParentStructure(treeNode) {
    return treeNodeParent(treeNode).getElementsByClassName('treeContent')[0].children[0];
}

/* export function treeNodeParent(treeNode) {
    return treeNode.parentElement.parentElement.parentElement;
} */

function makeLastTreeNode(treeNode) {
    treeNode.getElementsByClassName('treeContent').remove();

}

export function treeNodeChild(treeNode) {
    return treeNode.getElementsByClassName('treeContent')[0].children[0].children[0];
}

export function addingListenerToTreeNode(treeNode) {
    let treeNodeParts = selectableNodes(treeNode);
    for (let count = 0; count < treeNodeParts.length; count++) {
        /*  treeNodeParts[count].addEventListener('click', lClick);
         treeNodeParts[count].addEventListener('dblclick', dblClick); */
        LAndDoubleclick(treeNodeParts[count]);

        treeNodeParts[count].addEventListener("mouseenter", selectTreeNode);
        treeNodeParts[count].addEventListener('mouseout', unSelectTreeNode);

        window.oncontextmenu = function () { return false; };

        treeNodeParts[count].addEventListener('mousedown', chekingRClick);
        treeNodeParts[count].addEventListener('mouseup', rightMouseUp);


    }
    let posX = -1;
    let posY = -1;
    function chekingRClick(e) { if (e.button == 2) { posX = e.clientX; posY = e.clientY; } }
    function rightMouseUp(e) {
        if (e.button == 2 && Math.abs(posX - e.clientX) <= 10 && Math.abs(posY - e.clientY) <= 10) {
            selectConstantlyTreeNode(e);
        }
        posX = -1;
        posY = -1;
    }

    function selectConstantlyTreeNode(e) {
        let treeNode = findParetTreeNode(e.target);

        if (e.ctrlKey != true)
            clearSelecting();

        selectTreeNode(e);
        treeNode.classList.add('selectableConstantly');


        function clearSelecting() {
            Array.from(document.getElementsByClassName('selectableConstantly')).forEach((node) => {
                findParetTreeNode(node).querySelector('.treeNodeBorder').classList.remove('selectable');
                node.classList.remove('selectableConstantly');
            });
        }
    }

    function LAndDoubleclick(node) {
        node.addEventListener('click', click);

        let oneClick = false;
        let timeout;

        function click(e) {
            if (oneClick == false) {
                oneClick = true;
                lClick(e);
                timeout = setTimeout(() => {
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
        let treeNode = findParetTreeNode(e.target);
        if (treeNode.classList.contains('Faded')) {
            openTab();
            treeNode.classList.remove('Faded');
        }
        else { goToTab(); }

        function openTab() {
            chrome.tabs.create({
                url: treeNode.getAttribute('url'),
                windowId: getParentId(treeNode)
            }, (tab) => ChangeFadedId(tab));

            function ChangeFadedId(tab) {
                treeNode.id = tab.id;
            }

            function getParentId(treeNode) {
                let idStr = treeNodeParent(treeNode).id;
                if (idStr.indexOf('-'))
                    return parseInt(idStr.slice(idStr.indexOf('-') + 1));
                return parseInt(idStr);
            }
        }

        function goToTab() {
            chrome.tabs.get(Number.parseInt(treeNode.id), (tab) => {
                chrome.windows.update(tab.windowId, { focused: true });
                chrome.tabs.update(tab.id, { selected: true });
            });
        }
    }
    function selectableNodes(treeNode) {
        return [treeNode.querySelector('.selectableMargin'),
        treeNode.querySelector('.dragging'),
        treeNode.querySelector('.selectableBottomMargin')
        ];

    }
    function dblClick(e) {
        rename(findParetTreeNode(e.target));

        function rename(treeNode) {
            if (treeNode.getElementsByClassName('nodeName')[0].childElementCount == 1) {
                treeNode.getElementsByClassName('nodeName')[0].insertAdjacentElement('afterbegin', document.createElement('input'));
                let label = treeNode.getElementsByClassName('nodeName')[0].children[0];
                label.classList.add('label');
            }

            let label = treeNode.getElementsByClassName('nodeName')[0].children[0];
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
        let treeNode = findParetTreeNode(e.target);
        if (!treeNode.classList.contains('selectableConstantly'))
            treeNode.querySelector('.treeNodeBorder').classList.add('selectable');
    }

    function unSelectTreeNode(e) {
        let treeNode = findParetTreeNode(e.target);
        if (!treeNode.classList.contains('selectableConstantly'))
            treeNode.querySelector('.treeNodeBorder').classList.remove('selectable');
    }



    function addListener_DragElement(treeNodeParts, treeNode) {
        for (var node in treeNodeParts)
            treeNodeParts[node].onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.button == 0)
                leftMouseDown(e);
        }

        function leftMouseDown(e) {
            let drag = setTimeout(dragStart, 3000);

            document.onmousemove = initialCheckingMoving;
            document.onmouseup = function () {
                clearTimeout(drag);
                stopDragging();
            };

            function initialCheckingMoving() {
                clearTimeout(drag);

                let initialElementPositionX = e.clientX;
                let initialElementPositionY = e.clientY;
                document.onmousemove = checkMoving;

                function checkMoving(e) {
                    if (Math.abs(e.clientX - initialElementPositionX) > 5 || Math.abs(e.clientY - initialElementPositionY) > 5)
                        document.onmousemove = dragStart;
                }
            }
            function dragStart() {
                let initialPositionX = e.clientX;
                let initialPositionY = e.clientY;

                let changeInPosititonsX;
                let changeInPosititonsY;

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

                    let treeNodeClosestTo = marginTreeNode();
                    if (treeNodeClosestTo == null ||
                        e.clientY > treeNodeClosestTo.getBoundingClientRect().bottom ||
                        e.clientY < treeNodeClosestTo.getBoundingClientRect().top)
                        treeNodeClosestTo = findClosestTreeNodeByXYPosition(document.getElementById("InitialNode"), e.clientY);

                    let innerSpaceForChildPlacement = 7;
                    let elementMiddle = (treeNodeClosestTo.getBoundingClientRect().bottom -
                        treeNodeClosestTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height -
                        (
                            (treeNodeClosestTo.getBoundingClientRect().height -
                                treeNodeClosestTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height -
                                treeNodeClosestTo.querySelector('.selectableMargin').getBoundingClientRect().height) / 2));


                    if (e.clientY >= innerSpaceForChildPlacement + elementMiddle) {
                        treeNodeClosestTo.classList.remove('addUp');
                        treeNodeClosestTo.classList.add('addBottom');
                    }
                    else if (e.clientY <= - innerSpaceForChildPlacement + elementMiddle) {
                        treeNodeClosestTo.classList.remove('addBottom');
                        treeNodeClosestTo.classList.add('addUp');
                    }
                    else {
                        treeNodeClosestTo.classList.remove('addUp');
                        treeNodeClosestTo.classList.remove('addBottom');
                    }
                }
                function dragMouseUp(e) {
                    clearTimeout(drag);
                    stopDragging();

                    PlaceTreeNode(e);


                    function PlaceTreeNode(e) {
                        let YPosition = e.clientY;
                        let treeNodeAppendTo = marginTreeNode();
                        if (treeNodeAppendTo == null ||
                            e.clientY > treeNodeAppendTo.getBoundingClientRect().bottom ||
                            e.clientY < treeNodeAppendTo.getBoundingClientRect().top)
                            treeNodeAppendTo = findClosestTreeNodeByXYPosition(document.getElementById("InitialNode"), e.clientY);

                        Array.from(document.getElementsByClassName('addUp')).forEach(clearSpacesForPlacementUp);
                        function clearSpacesForPlacementUp(element) {
                            element.classList.remove('addUp');
                        }
                        Array.from(document.getElementsByClassName('addBottom')).forEach(clearSpacesForPlacementBottom);
                        function clearSpacesForPlacementBottom(element) {
                            element.classList.remove('addBottom');
                        }

                        let innerSpaceForChildPlacement = 7;
                        let elementMiddle = (treeNodeAppendTo.getBoundingClientRect().bottom -
                            treeNodeAppendTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height -
                            (
                                (treeNodeAppendTo.getBoundingClientRect().height -
                                    treeNodeAppendTo.querySelector('.selectableBottomMargin').getBoundingClientRect().height -
                                    treeNodeAppendTo.querySelector('.selectableMargin').getBoundingClientRect().height) / 2));

                        if (e.clientY >= innerSpaceForChildPlacement + elementMiddle) {
                            treeNodeAppendTo.insertAdjacentElement('afterend', treeNode);
                            console.log(22);
                            $(treeNodeAppendTo.nextSibling).hide();
                            $(treeNodeAppendTo.nextSibling).fadeIn(1000);
                        }
                        else if (e.clientY <= - innerSpaceForChildPlacement + elementMiddle) {
                            treeNodeAppendTo.insertAdjacentElement('beforebegin', treeNode);
                            $(treeNodeAppendTo.previousSibling).hide();
                            $(treeNodeAppendTo.previousSibling).fadeIn(1000);
                        }
                        else {
                            let tabParentNode = new TreeNodeActive(treeNodeAppendTo);
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
                    if (document.querySelector('.addUp') == null)
                        return document.querySelector('.addBottom');
                    else
                        return document.querySelector('.addUp');
                }
                function findClosestTreeNodeByXYPosition(treeNodeElement, YPosition) {
                    if (treeNodeChildrenLength(treeNodeElement) == 1 && treeNodeElement.id != treeNode.id)
                        return findClosestTreeNodeByXYPosition(treeNodeChild(treeNodeElement), YPosition);
                    else if (treeNodeChildrenLength(treeNodeElement) == 0)
                        return treeNodeElement;
                    else {
                        let closestTreeNode = getClosestTreeNode(treeNodeElement, YPosition);
                        if (closestTreeNode.isReady) return closestTreeNode.treeNodeInner;
                        else return findClosestTreeNodeByXYPosition(closestTreeNode.treeNodeInner, YPosition);
                    }

                    function getClosestTreeNode(treeNodeElement, YPosition) {
                        for (let index = 0; index < treeNodeChildrenLength(treeNodeElement); index++) {

                            let treeNodeInner = treeNodeChildren(treeNodeElement)[index];
                            if (treeNodeInner.id == treeNode.id) continue;

                            let treeNodeTopPosition = treeNodeInner.getBoundingClientRect().top;
                            let treeNodeBottomPosition = treeNodeInner.getBoundingClientRect().bottom;

                            if (treeNodeTopPosition >= YPosition &&
                                treeNodeBottomPosition >= YPosition &&
                                treeNodeInner.id != treeNodeElement.id) {
                                return { treeNodeInner: treeNodeInner, isReady: true, };
                            }
                            else if (treeNodeTopPosition <= YPosition &&
                                YPosition <= treeNodeBottomPosition &&
                                treeNodeInner.id != treeNodeElement.id)
                                return { treeNodeInner: treeNodeInner, isReady: false };
                            else continue;
                        }
                        return { treeNodeInner: treeNodeElement, isReady: true };
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
        }
        else {
            treeNode.children().eq(3).slideDown();
            treeNode.children().eq(4).slideDown();
            treeNode.children().eq(1).children().eq(1).fadeOut();
        }
    }
    function treeNodeIsInitial(treeNode) { return treeNode.id == "InitialNode"; }

    function findParetTreeNode(element) {
        if (element.classList.contains('treeNode'))
            return element;
        else
            return findParetTreeNode(element.parentElement);
    }
}

export class Tab {
    constructor(tab) {
        this.tab = tab;
    }

    isOpennedFromAnother() {
        return this.tab.opennedFromId != -100;
    }

    opennedTabIsOpenned() {
        return document.getElementById(this.tab.opennedFromId) != null || document.getElementById('window-' + this.tab.opennedFromId) != null;
    }
}



export class TreeNodeActive {
    constructor(tabParentNode) {
        this.treeNode = tabParentNode;
    }

    setDefaultValue() {
        this.treeNode = treeMainNode;
    }

    setToOpennedFromTab(tabOpennedFromId) {
        if (document.getElementById(tabOpennedFromId) != null)
            this.treeNode = document.getElementById(tabOpennedFromId);
        else
            this.treeNode = document.getElementById('window-' + tabOpennedFromId);
    }

    doesntHaveContentChild() {
        return (this.treeNode.getElementsByClassName('treeContent').length == 0);
    }

    addContentChild() {
        this.treeNode.innerHTML += ` 
                <div class="structureLine container">
                <div></div>
                </div>
          
          
                <div class="treeContent container">
                <div></div>
                </div>
                `;

    }

    addTab(tab, isWindow, lastTreeNode) {
        var tabCSSProperties = {
            nodeNameClass: isWindow ? 'nodeName__window' : '',
            inRouterClass: lastTreeNode ? 'inRouter__point' : '',
            nodeStructure: lastTreeNode ? '' : ` 
                <div class="structureLine container">
                <div></div>
                </div>
          
          
                <div class="treeContent container">
                <div></div>
                </div>
                `,
            windowId: isWindow ? 'window-' : ''
        };

        let childTreeNode = document.createElement("div");
        childTreeNode.classList.add('treeNode');
        childTreeNode.id = tabCSSProperties.windowId + tab.id;
        childTreeNode.setAttribute('url', tab.url);
        childTreeNode.innerHTML =
            `
            <div class="treeNodeBorder"></div>

            <div class="leftLine"></div>
        
            <div class="router">
            <div class="inRouterMinus ` + tabCSSProperties.inRouterClass + `"></div>
            <div class="inRouterPlus"></div>
            </div>
        
            <div class="nodeName ` + tabCSSProperties.nodeNameClass + `">
            <p class="font">` + tab.title + `</p>
            </div>
        
            ` + tabCSSProperties.nodeStructure + `
        
            <div class="toggle"></div>
            <div class="dragging"></div>
            <div class="selectableMargin"></div>
            <div class="selectableBottomMargin"></div>
            `;

        this.treeNode.getElementsByClassName('treeContent')[0].children[0].append(childTreeNode);
    }
}