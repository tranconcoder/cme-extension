class Socket {
	initial() {
		this.groupSocket.initial();
		this.classSocket.initial();
		this.attendanceHistory.initial();
	}

	disconnect() {
		this.groupSocket.socket.disconnect();
		this.classSocket.socket.disconnect();
		this.attendanceHistory.socket.disconnect();
	}

	connect() {
		this.groupSocket.socket.connect();
		this.classSocket.socket.connect();
		this.attendanceHistory.socket.connect();
	}

	groupSocket = {
		socket: io(`${HOST}/group`, {
			path: "/socket",
			transports: ["websocket"],
			auth: cb => {
				cb({
					accessToken: appStorageObj.cookieStorage.token.accessToken.get(),
				});
			},
		}).disconnect(),

		initial() {
			const { socket } = this;

			socket.on("connect", () => {
				appStorageObj.groupsStorage.initStorage();
			});

			socket.on("connect_error", async () => {
				await tokenObj.getNewToken({
					tokenTypeToGet: "access",
					refreshToken: appStorageObj.cookieStorage.token.refreshToken.get(),
				});

				socket.connect();
			});

			socket.on("create-group", createdGroup => {
				classPageObj.groupListView.add(createdGroup, true, false);
			});

			socket.on("change-group", changedGroup => {
				const { eventId } = changedGroup;

				classPageObj.groupListView.update(eventId, changedGroup, true, false);
			});

			socket.on("delete-group", eventId => {
				const oldGroupInfo = appStorageObj.classStorage.getClassById(eventId);

				classPageObj.groupListView.delete(eventId, oldGroupInfo, true, false);
			});
		},
	};

	classSocket = {
		socket: io(`${HOST}/class-info`, {
			path: "/socket",
			transports: ["websocket"],
			auth: cb => {
				cb({
					accessToken: appStorageObj.cookieStorage.token.accessToken.get(),
				});
			},
		}).disconnect(),

		initial() {
			const { socket } = this;

			socket.on("connect", () => {
				appStorageObj.classStorage.initStorage();
			});

			socket.on("connect_error", async () => {
				await tokenObj.getNewToken({
					tokenTypeToGet: "access",
					refreshToken: appStorageObj.cookieStorage.token.refreshToken.get(),
				});

				socket.connect();
			});

			socket.on("create-class", newClassInfo => {
				// Add new class info to storage
				appStorageObj.classStorage.addClassInfo(newClassInfo);

				// Update online form in view
				classPageObj.settingsBox.addStudentBoxWithLink.resetView();

				// Render class buttons
				classPageObj.allClassInfoView.renderClassBtn();
			});

			socket.on("change-class", updatedClassInfo => {
				const { classInfoNameBeforeUpdate, classInfoName } = updatedClassInfo;
				const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

				if (classInfoName === currentClassInfoName) {
					// Update new student list into view
					classPageObj.allClassInfoView.update(
						classInfoNameBeforeUpdate,
						updatedClassInfo,
						false
					);
				} else {
					// Update new data to storage
					appStorageObj.classStorage.setClass(classInfoNameBeforeUpdate, updatedClassInfo);

					// Render class buttons
					classPageObj.allClassInfoView.renderClassBtn();

					// Update online form in view
					classPageObj.settingsBox.addStudentBoxWithLink.resetView();
				}
			});

			socket.on("delete-class", classDeletedInfoName => {
				classPageObj.allClassInfoView.delete(classDeletedInfoName, false);
			});
		},
	};

	attendanceHistory = {
		socket: io(`${HOST}/attendance-history`, {
			path: "/socket",
			transports: ["websocket"],
			auth: cb => {
				cb({
					accessToken: appStorageObj.cookieStorage.token.accessToken.get(),
				});
			},
		}).disconnect(),

		initial() {
			const { socket } = this;

			// Connect
			socket.on("connect", () => {
				appStorageObj.attendanceHistoryStorage.initStorage();
			});

			socket.on("connect_error", async () => {
				await tokenObj.getNewToken({
					tokenTypeToGet: "access",
					refreshToken: appStorageObj.cookieStorage.token.refreshToken.get(),
				});

				socket.connect();
			});

			// Add attendance history
			socket.on("add-attendance-history", newAttendanceHistory => {
				const attendanceData = {
					attendanceId: newAttendanceHistory._id,
					...newAttendanceHistory,
				};

				classPageObj.attendanceHistoryView.add(attendanceData);
			});

			// Delete attendance history
			socket.on("delete-attendance-history", attendanceIdDeleted => {
				classPageObj.attendanceHistoryView.delete(attendanceIdDeleted);
			});
		},
	};
}

var socketObj = new Socket();
socketObj.initial();
