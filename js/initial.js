"use strict";

const HOST_LIST = ["http://localhost:3000", "https://cons-meeting-education.herokuapp.com"];
const HOST_INDEX = 0;
const HOST = HOST_LIST[HOST_INDEX];

const $ = (selector, bindObj = document) => {
	return bindObj.querySelector(selector);
};
const $$ = (selector, bindObj = document) => {
	return bindObj.querySelectorAll(selector);
};
const pagesName = ["startPage", "joinPage", "classPage"];

initFontAwsome();

function getLink(filePath) {
	return chrome.runtime.getURL(filePath);
}

function initFontAwsome() {
	const linkElm = document.createElement("link");

	linkElm.rel = "stylesheet";
	linkElm.href = "https://pro.fontawesome.com/releases/v5.10.0/css/all.css";

	document.head.appendChild(linkElm);
}

Array.prototype.toHtml = function (callback = itemTemplate => {}) {
	const arrayToHtml = this;

	const elmToString = element => element.outerHTML;

	const htmlString = arrayToHtml.map(elm => callback(elm, elmToString)).join("");

	return htmlString;
};

Array.prototype.sortObject = function (fieldName, sortType) {
	if (sortType === 0) {
		this.sort((a, b) => a[fieldName] - b[fieldName]);
	} else {
		this.sort((a, b) => b[fieldName] - a[fieldName]);
	}

	return this;
};

// if (HOST_INDEX === 0) {
// 	window.addEventListener("beforeunload", () => {
// 		chrome.runtime.sendMessage({
// 			type: "RELOAD_EXTENSION",
// 		});
// 	});
// }
