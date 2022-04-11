class AppStorage {
	storageKeys = {
		refreshTokenCookie: "googleMeetExtension__RefreshToken",
		accessTokenCookie: "googleMeetExtension__AccessToken",
		userIdCookie: "googleMeetExtension__UserIdCookie",
		userInfo: "googleMeetExtension___UserInfo",
		members: "googleMeetExtension___Members",
		settings: "googleMeetExtension___Settings",
		currentClass: "googleMeetExtension___Members__CurrentClass",
		groups: "googleMeetExtension___GroupStorage",
		attendances: "googleMeetExtension___Attendance",
	};

	async initAllStorage() {
		// Init student list
		this.classStorage.initStorage();

		// Init attendance history
		this.attendanceHistoryStorage.initStorage();

		this.groupsStorage.initStorage();
	}

	async handleUpdateToken() {
		if (this.getNewRefreshTokenInterval) {
			clearInterval(this.getNewRefreshTokenInterval);
		}

		this.getNewRefreshTokenInterval = setInterval(() => {
			this.cookieStorage.token.refreshToken.set(
				tokenObj.getNewToken({ tokenTypeToGet: "refreshToken" })
			);
		}, 2 * 60 * 60 * 1000);
	}

	cookieStorage = {
		token: {
			accessToken: {
				get() {
					return appStorageObj.cookieStorage.getCookie(
						appStorageObj.storageKeys.accessTokenCookie
					);
				},

				set(newAccessToken) {
					appStorageObj.cookieStorage.setCookie(
						appStorageObj.storageKeys.accessTokenCookie,
						newAccessToken,
						3 * 60 * 1000
					);
				},

				delete() {
					appStorageObj.cookieStorage.deleteCookie(
						appStorageObj.storageKeys.accessTokenCookie
					);
				},
			},

			refreshToken: {
				get() {
					return appStorageObj.cookieStorage.getCookie(
						appStorageObj.storageKeys.refreshTokenCookie
					);
				},

				set(newRefreshToken) {
					appStorageObj.cookieStorage.setCookie(
						appStorageObj.storageKeys.refreshTokenCookie,
						newRefreshToken,
						3 * 60 * 60 * 1000
					);
				},

				delete() {
					appStorageObj.cookieStorage.deleteCookie(
						appStorageObj.storageKeys.refreshTokenCookie
					);
				},
			},
		},

		getCookie(fieldName) {
			const allCookie = document.cookie;

			const hasRefreshToken = allCookie.includes(fieldName);

			const refreshTokenCookieValue = hasRefreshToken
				? allCookie.slice(allCookie.indexOf(fieldName)).split(";")[0].split("=")[1]
				: null;

			return refreshTokenCookieValue;
		},

		setCookie(fieldName, newCookieValue, milliSecondsToExpired = 1 * 60 * 60 * 1000) {
			const expiresTime = new Date();
			const time = expiresTime.getTime() + milliSecondsToExpired;
			expiresTime.setTime(time);

			document.cookie = `${fieldName}=${newCookieValue}; expires=${expiresTime.toUTCString()}; path=/`;
		},

		deleteCookie(fieldName) {
			document.cookie = `${fieldName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
		},
	};

	classStorage = {
		currentClassDefault: "default",
		classInfoStorageDefault: [
			{
				classInfoName: "default",
				studentList: [],
			},
		],

		currentClass: "default",
		classInfoStorage: [
			{
				classInfoName: "default",
				studentList: [],
			},
		],

		initStorage() {
			const allClassInfoURL = `${HOST}/resources/class-info/get-all`;

			tokenObj.handleCallApi(allClassInfoURL).then(allClassInfo => {
				const classCount = allClassInfo.length;
				const defaultClassNameInfoToInit =
					classCount < 2
						? "default"
						: allClassInfo.find(({ classInfoName }) => classInfoName !== "default")
								.classInfoName;

				this.setAllClass(allClassInfo);
				this.setCurrentClassInfoName(defaultClassNameInfoToInit);

				attendanceObj.initial();

				classPageObj.allClassInfoView.renderStudentListInClass();
				classPageObj.undoAndRedoMembersList.reset();
				classPageObj.settingsBox.addStudentBoxWithLink.resetView();
			});
		},

		reset() {
			this.setAllClass(
				this.classInfoStorageDefault,
				true,
				false,
				() => {
					this.setCurrentClassInfoName("default");
				},
				true
			);
		},

		getCurrentClassInfoName() {
			return JSON.parse(JSON.stringify(this.currentClass));
		},

		getCurrentClassInfoId() {
			const currentClassInfo = this.getClass();

			return currentClassInfo._id;
		},

		setCurrentClassInfoName(newClassInfoName) {
			this.currentClass = newClassInfoName;
		},

		getAllClassInfo() {
			return JSON.parse(JSON.stringify(this.classInfoStorage));
		},

		getAllClassName() {
			const classListInfo = this.getAllClassInfo();

			return classListInfo.map(classInfo => classInfo.classInfoName);
		},

		getClass(classInfoName) {
			classInfoName = classInfoName || this.getCurrentClassInfoName();

			const classListInfo = this.getAllClassInfo();

			return classListInfo.find(classInfo => classInfo.classInfoName === classInfoName);
		},

		getClassById(id) {
			const classListInfo = this.getAllClassInfo();

			return classListInfo.find(({ _id }) => _id === id);
		},

		addClassInfo(classInfo) {
			this.classInfoStorage.push(classInfo);
		},

		setClass(classInfoName, newClassList) {
			const allClassInfo = this.getAllClassInfo();

			const newAllClassInfo = allClassInfo.map(classInfo =>
				classInfo.classInfoName === classInfoName ? newClassList : classInfo
			);

			this.setAllClass(newAllClassInfo);
		},

		setAllClass(newAllClassInfo) {
			this.classInfoStorage = newAllClassInfo;
		},

		deleteClass(classInfoNameToDelete) {
			const currentClass = this.getCurrentClassInfoName();
			const allClassInfo = this.getAllClassInfo();

			const newAllClassInfo = allClassInfo.filter(
				classInfo => classInfo.classInfoName !== classInfoNameToDelete
			);

			if (currentClass === classInfoNameToDelete) {
				this.setCurrentClassInfoName("default");
			}

			this.setAllClass(newAllClassInfo);
		},
	};

	attendanceHistoryStorage = {
		storage: [],

		initStorage() {
			const attendanceHistoryURL = `${HOST}/resources/attendance-history/get-all`;

			tokenObj.handleCallApi(attendanceHistoryURL).then(allAttendanceData => {
				const allAttendanceDataToSetHistory = allAttendanceData.map(attendanceData => ({
					attendanceId: attendanceData._id,
					...attendanceData,
				}));

				this.setAll(allAttendanceDataToSetHistory);

				classPageObj.attendanceHistoryView.render();
			});
		},

		reset() {
			this.storage = [];
		},

		getAll() {
			return JSON.parse(JSON.stringify(this.storage));
		},

		add(newHistory) {
			const allHistory = this.getAll();

			const newAllHistory = [...allHistory, newHistory];

			this.setAll(newAllHistory);
		},

		setAll(attendanceHistoryList) {
			this.storage = attendanceHistoryList;
		},

		delete(attendanceId) {
			this.storage = this.storage.filter(
				({ attendanceId: currentAttendanceId }) => attendanceId !== currentAttendanceId
			);
		},
	};

	groupsStorage = {
		storage: [],

		initStorage() {
			// Init groups data
			const getGroupDataUrl = `${HOST}/resources/calendar/get-all`;

			tokenObj.handleCallApi(getGroupDataUrl).then(allGroups => {
				this.setAll(allGroups);
				classPageObj.groupListView.render(allGroups);
			});
		},

		getAll() {
			return JSON.parse(JSON.stringify(this.storage));
		},

		setAll(newData) {
			this.storage = newData;
		},

		get(eventId) {
			const currentData = this.getAll();
			const event = currentData.find(
				({ eventId: currentEventId }) => currentEventId === eventId
			);

			if (!event) console.error("Không tìm thấy sự kiện này!");

			return event;
		},

		update(eventId, newGroup) {
			const currentData = this.getAll();
			const newData = currentData.map(groupInfo =>
				groupInfo.eventId === eventId ? { ...groupInfo, ...newGroup } : groupInfo
			);

			this.setAll(newData);
		},

		add(group) {
			const currentData = this.getAll();

			currentData.push(group);

			this.setAll(currentData);
		},

		delete(eventId) {
			const oldAllGroupData = this.getAll();
			const newAllGroupData = oldAllGroupData.filter(groupInfo => groupInfo.eventId !== eventId);

			this.setAll(newAllGroupData);
		},

		reset() {
			this.storage = [];
		},
	};

	userInfo = {
		storage: {},

		reset() {
			this.set({
				googleId: null,
				googleName: null,
				name: null,
				gmail: null,
				avatar: null,
			});
		},

		get() {
			return JSON.parse(JSON.stringify(this.storage));
		},

		set(newInfo) {
			const currentUserInfo = this.get();

			currentUserInfo.googleId = newInfo.hasOwnProperty("googleId")
				? newInfo.googleId
				: currentUserInfo.googleId;

			currentUserInfo.googleName = newInfo.hasOwnProperty("googleName")
				? newInfo.googleName
				: currentUserInfo.googleName;

			currentUserInfo.name = newInfo.hasOwnProperty("name")
				? newInfo.name
				: currentUserInfo.name;

			currentUserInfo.gmail = newInfo.hasOwnProperty("gmail")
				? newInfo.gmail
				: currentUserInfo.gmail;

			currentUserInfo.avatar = newInfo.hasOwnProperty("avatar")
				? newInfo.avatar
				: currentUserInfo.avatar;

			this.storage = currentUserInfo;
		},
	};
}

var appStorageObj = new AppStorage();
