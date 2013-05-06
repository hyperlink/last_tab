"use strict";

var lastTabs = chrome.extension.getBackgroundPage().lastTabs
var length = lastTabs.length
var ct = chrome.tabs, cw = chrome.windows
var contents = document.getElementById("contents")
var currentWindowId = chrome.windows.WINDOW_ID_CURRENT
var invalidTabs = []

cw.getCurrent(function (w) {
	currentWindowId = w.id
})

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

var MAX_TO_RENDER = 5
function render() {
	var count = 0
	var output = []
	lastTabs.some(function(tab, index) {
		if (~invalidTabs.indexOf(tab.id) || (tooSoon(tab) && index==0)) return
		output.push('<li><a href="#" data-tabid="'+ tab.id +'" data-windowid= "'+ tab.windowId +'">')
		if (tab.favIconUrl && isDisplayable(tab.favIconUrl) ) {
			output.push('<img src="'+ tab.favIconUrl +'" /> ')
		} else {
			output.push('<span></span>')
		}
		output.push(tab.title)
		output.push('</a></li>')
		return ++count == MAX_TO_RENDER
	})

	contents.innerHTML = output.join('')
}

var a = document.createElement("a")
function isDisplayable(imgSrc) {
	a.href = imgSrc
	return (a.protocol != "chrome:")
}

function tooSoon(tab) {
	if (tab.lastActivated == null) return false
	var now = +new Date
	return (now - tab.lastActivated <= 2e3)
}

ct.onRemoved.addListener(onTabRemove)
function onTabRemove() {
	lastTabs = chrome.extension.getBackgroundPage().lastTabs
	render()
}

function handleAnchorClickEvent(anchor, e) {
	console.log("event", e)
	var tabId = +anchor.dataset.tabid
	if (e.which == 2) {
		ct.remove(tabId)
		var li = anchor.parentNode
		li.parentNode.removeChild(li)
	} else {
		var windowId = anchor.dataset.windowid
		console.log("List item ", tabId, " was clicked!")
		if (currentWindowId != windowId) {
			cw.update(+windowId, {focused: true})
		}
		ct.update(tabId, {active:true})
	}
	e.preventDefault()
	return false
}

contents.addEventListener("click", function(e) {
	if(e.target && e.target.nodeName == "A") {
		return handleAnchorClickEvent(e.target, e)
	} else if (e.target.nodeName == "IMG") {
		return handleAnchorClickEvent(e.target.parentNode, e)
	}
});