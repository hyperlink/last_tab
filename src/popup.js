"use strict";

var lastTabs = chrome.extension.getBackgroundPage().lastTabs
var length = lastTabs.length
var ct = chrome.tabs, cw = chrome.windows
var contents = document.getElementById("contents")
var currentWindowId = chrome.windows.WINDOW_ID_CURRENT
var invalidTabs = []
var selectedIndex = 0
var indexOfproto = Array.prototype.indexOf

cw.getCurrent(function (w) {
	currentWindowId = w.id
})

Mousetrap.bind(['down', 'tab', 'right'], selectNext)
Mousetrap.bind(['up', 'shift+tab', 'left'], selectPrev)
Mousetrap.bind('enter', goToActive)
Mousetrap.bind(['backspace', 'del'], removeActive)

if (length == 0) {
	contents.innerText = "No Tabs Selected"
} else {
	lastTabs.forEach(function(tab) {
		ct.get(tab.id, function(tabInfo) {
			if (tabInfo == null) {
				console.error("no info for tab", tab)
				invalidTabs.push(tab.id)
			}
			for(var i in tabInfo) {
				tab[i] = tabInfo[i]
			}
			dec()
		})
	})
}

function dec() {
	if (--length == 0) {
		render()
	}
}

function getSelectedEl() {
	return document.querySelector(".selected")
}

function getSelectedIndex() {
	var index = indexOfproto.call(contents.children, getSelectedEl())
	if (index == -1) return 0
	return index
}

function selectNext (e, key) {
	console.log("select Next", key)
	var currentlySelected = getSelectedEl()
	currentlySelected.classList.remove("selected")

	var next = currentlySelected.nextSibling
	if ( next == null ) {
		next = currentlySelected.parentNode.firstChild
	}
	next.classList.add("selected")
	return false
}

function selectPrev(e, key) {
	console.log("select Previous", key)
	var currentlySelected = getSelectedEl()
	currentlySelected.classList.remove("selected")

	var prev = currentlySelected.previousSibling
	if ( prev == null ) {
		prev = currentlySelected.parentNode.lastChild
	}
	prev.classList.add("selected")
	return false
}

function goToActive(e, key) {
	console.log("go to Active", key)
	activateTab(getSelectedItem(true))
	return false
}

function removeActive(e, key) {
	console.log("remove Active", key)
	removeActiveFromEl(getSelectedItem(false))
}

function getSelectedItem(fetchDataset) {
	var anchor = document.querySelector(".selected a")
	if (fetchDataset === true) return anchor.dataset
	return anchor
}

var MAX_TO_RENDER = 5
function render() {
	var count = 0
	var output = []
	lastTabs.some(function(tab, index) {
		if (~invalidTabs.indexOf(tab.id) || (tooSoon(tab) && index==0)) return
		output.push('<li '+ (count == selectedIndex ? 'class=selected' : '') +'><a href="#" data-tabid="'+ tab.id +'" data-windowid= "'+ tab.windowId +'">')
		output.push('<img src="chrome://favicon/'+ tab.url +'" /> ')
		output.push(tab.title)
		output.push('</a></li>')
		return ++count == MAX_TO_RENDER
	})

	contents.innerHTML = output.join('')
	setTimeout(function(){
		getSelectedItem(false).focus()
	}, 50)
}

function tooSoon(tab) {
	if (tab.lastActivated == null) return false
	var now = +new Date
	return (now - tab.lastActivated <= 2e3)
}

ct.onRemoved.addListener(onTabRemove)
function onTabRemove() {
	setTimeout(function() {
		lastTabs = chrome.extension.getBackgroundPage().lastTabs
		if (lastTabs.length <= selectedIndex) {
			selectedIndex = lastTabs.length-1
		}
		render()
	}, 30)
}

function handleAnchorClickEvent(anchor, e) {
	console.log("event", e)
	if (e.which == 2) {
		removeActiveFromEl(anchor)
	} else {
		activateTab(anchor.dataset)
	}
	e.preventDefault()
	return false
}

function removeActiveFromEl(anchor) {
	ct.remove(+anchor.dataset.tabid)
	selectedIndex = getSelectedIndex()
	var li = anchor.parentNode
	li.parentNode.removeChild(li)
}

function activateTab(tabInfo) {
	var windowId = tabInfo.windowid
	var tabId = tabInfo.tabid
	console.log("List item ", tabId, " was activated!")
	if (currentWindowId != windowId) {
		cw.update(+windowId, {focused: true})
	}
	ct.update(+tabId, {active:true})
}

contents.addEventListener("click", function(e) {
	if(e.target && e.target.nodeName == "A") {
		return handleAnchorClickEvent(e.target, e)
	} else if (e.target.nodeName == "IMG") {
		return handleAnchorClickEvent(e.target.parentNode, e)
	}
});