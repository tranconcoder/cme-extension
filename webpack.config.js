const path = require("path");

module.exports = {
	entry: [
		"./js/initial.js",
		"./js/classSelectors.js",
		"./js/generalMethods.js",
		"./js/token.js",
		"./js/appStorage.js",
		"./js/socket.js",
		"./js/authenticate.js",
		"./js/settings.js",
		"./js/attendance.js",
		"./js/attendanceHistory.js",
		"./js/speaker.js",
		"./js/navigation.js",
		"./js/main.js",
		"./js/joinPage.js",
		"./js/htmlString.js",
		"./js/classPage.js",
	],
	output: {
		filename: "bundle.min.js",
		path: path.resolve(__dirname, "build"),
	},
};
