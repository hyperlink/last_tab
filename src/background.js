"use strict";chrome.runtime.onInstalled.addListener(function(e){console.log("previousVersion",e.previousVersion)});

var ct = chrome.tabs, lastTabs = []

var lastTabLimit = 50

setTimeout(populateInitialTabs, 5e3)

ct.onActivated.addListener(function onTabActivated (info) {
	console.log("tabId onActivated", info.tabId, info.windowId)

	var index = indexOf(lastTabs, info.tabId)

	if (index > -1 ) {
		var lastTab = lastTabs.splice(index, 1)[0]
		updateTab(lastTab)
		lastTabs.unshift(lastTab)
	} else {
		ct.get(info.tabId, function(tab){
			console.log(tab)
			updateTab(tab)
			lastTabs.unshift(tab)
			if (lastTabs.length > lastTabLimit) {
				lastTabs.length = lastTabLimit
			}
		})
	}
})

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
})

ct.onRemoved.addListener(function onTabRemoved(tabId) {
	var removeIndex = null
	for (var i = 0; i < lastTabs.length; i++) {
		if (tabId == lastTabs[i].id) {
			removeIndex = i
			break
		}
	}

	if (removeIndex != null) {
		console.log(lastTabs)
		lastTabs.splice(removeIndex, 1)
		console.log("Removing tabIndex ", removeIndex, tabId)
		console.log(lastTabs)
	}
})

function indexOf(tabs, id) {
	for (var i = 0; i < tabs.length; i++) {
		if (tabs[i].id == id) {
			return i
		}
	};
	return -1
}

function updateTab (tab) {
	tab.lastActivated = +new Date
}

function populateInitialTabs() {
	console.log("populateInitialTabs")
	ct.query({
		windowType: "normal"
	}, function(tabs) {
		console.log("contains ", tabs.length)
		if (lastTabs.length == 0) {
			for (var i = 0; i < tabs.length; i++) {
				if ( tabs[i].active ) {
					lastTabs.unshift(tabs[i])
				}
				else {
					lastTabs.push(tabs[i])
				}
			};
		}
	})
}
