class Attendance {
	startAttendanceAt = undefined;
	endAttendanceAt = undefined;
	totalTimeLearning = undefined;
	attendanceData = undefined;
	domVariables = {
		attendanceListWrapper: () =>
			$(".settings-box__wrapper .tab-list__item.statistical .slide-3__student-wrapper"),
		disabledStatusElm: () =>
			$(".settings-box__wrapper .tab-list__item.statistical .statistical__state-message"),
		disabledStatusContentElm: () =>
			$(".settings-box__wrapper .tab-list__item.statistical .statistical__state-message span"),
		currentClassElm: () =>
			$(
				".settings-box__wrapper .tab-list__item.statistical .slide-1__class-info-name .class-info-name__class-name"
			),
		totalTimeLearningElm: () =>
			$(
				".settings-box__wrapper .tab-list__item.statistical .slide-1__time-learning .time-learning__time"
			),
		studentExistListElm: () =>
			$(
				".settings-box__wrapper .tab-list__item.statistical .slide-1__student-exist-count .student-exist-count__count"
			),
		notExistStudentBoxELm: () =>
			$(
				".settings-box__wrapper .tab-list__item.statistical .slide-2__not-exist-student .not-exist-student__box"
			),
		notExistStudentBoxLabelELm: () =>
			$(
				".settings-box__wrapper .tab-list__item.statistical .slide-2__not-exist-student .not-exist-student__caption"
			),
		turnOnStateMessageElm: () =>
			$(
				".taskbar__left .left__attendance-state .attendance-state__attendance-message .attendance-message__on-state p"
			),
	};

	initial() {
		this.handleChangeClass(appStorageObj.classStorage.getCurrentClassInfoName());
	}

	handleChangeClass(classInfoName) {
		const allGroupInfo = appStorageObj.groupsStorage.getAll();

		this.attendanceData = appStorageObj.classStorage
			.getClass(classInfoName)
			.studentList.map(member => {
				const allWorkingGroupTimes = allGroupInfo
					.filter(groupInfo => groupInfo.membersInfo.includes(member.index))
					.map(groupInfo => ({
						eventId: groupInfo.eventId,
						startAt: groupInfo.startAt,
						endAt: groupInfo.endAt,
					}));

				return {
					id: member.id,
					index: member.index,
					name: member.name,
					googleName: member.googleName,
					timeLearning: 0,
					percentLearning: 0,
					isOnline: false,
					joinAndExitTimers: [],
					chats: [],
					micStatus: false,
					micCount: 0,
					micDuration: 0,
					notExistStatus: 0 /* 0 -> exit, 1 -> not accept, 2 -> accept */,
					acceptNotExist: false,

					// Group working
					isWorkingGroup: false,
					workingGroupTimes: allWorkingGroupTimes,
				};
			});
	}

	turnOn() {
		// Connect to socket
		socketObj.disconnect();

		// Check has logged
		const userInfo = appStorageObj.userInfo.get();
		const inputStateAttendance = $(
			".settings-box__wrapper .content__tab-list .tab-list__item.features .features__auto-attendance input"
		);

		if (!userInfo.googleId) {
			classPageObj.settingsBox.loginNotify.show();
			inputStateAttendance.checked = false;

			return;
		}

		// Reset settings info
		settingsObj.setSettings({ autoAttendance: true });

		// Reset statistical style
		this.totalTimeLearning = 0;
		this.startAttendanceAt = generalMethods.getCurrentTime();
		this.handleChangeClass(appStorageObj.classStorage.getCurrentClassInfoName());
		this.initWorkingGroupTimes();

		// Reset all attendance style
		this.setStyleAttendance().on();

		this.interval = setInterval(() => {
			// Check has enabled
			if (!settingsObj.getSettings().autoAttendance) return;

			// GENERAL HANDLE
			const membersExistMeetName = [...$$(classSelectorsObj.MEMBER_NAME_LIST)].map(
				elm => elm.textContent
			);

			const studentsExistInfo = this.attendanceData.filter(member =>
				membersExistMeetName.includes(member.googleName)
			);
			const studentNotExistInfo = this.attendanceData.filter(
				member => !membersExistMeetName.includes(member.googleName)
			);
			const settingsBox = $(".settings-box__wrapper");
			const statisticalNav = $(`.navigation__list .list__item[data-index="2"]`);

			this.totalTimeLearning++;
			this.attendanceData = this.attendanceData.map(member => {
				let memberIsExist;
				let chatContents;
				let currentMicStatus;
				let notExistStatus;
				let isWorkingGroup;

				const isRoomOwner =
					member.googleName === $(classSelectorsObj.MEMBER_NAME_LIST).textContent;

				memberIsExist = membersExistMeetName.includes(member.googleName);

				chatContents = [...$$(classSelectorsObj.CHAT_CONTAINER)]
					.filter(elm => {
						const { textContent: authorNameChatElement } = $(
							classSelectorsObj.CHAT_NAME,
							elm
						);

						return isRoomOwner
							? authorNameChatElement === "Bạn"
							: authorNameChatElement === member.googleName;
					})
					.map(elm => ({
						time: $(classSelectorsObj.CHAT_TIME, elm).textContent,
						contents: [...$$(classSelectorsObj.CHAT_CONTENT_CONTAINER + " > *", elm)].map(
							({ textContent }) => textContent
						),
					}));

				const currentMemberRowInMemberListGoogleMeet = [
					...$$(classSelectorsObj.MEMBER_NAME_LIST),
				].find(
					({ textContent: elementTextContent }) => elementTextContent === member.googleName
				)?.parentNode.parentNode.parentNode.parentNode;

				const turnOffMicElementCondition = $(
					classSelectorsObj.MEMBER_IS_TURN_OFF_MICRO_CONDITION,
					currentMemberRowInMemberListGoogleMeet
				);

				currentMicStatus = turnOffMicElementCondition
					? false
					: currentMemberRowInMemberListGoogleMeet
					? true
					: false;

				notExistStatus = +$(`.not-exist-status__select[data-index="${member.index}"]`).value;

				isWorkingGroup = (() => {
					const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

					const result = member.workingGroupTimes.some(({ startAt, endAt }) => {
						if (
							new Date() >= new Date(startAt) - TIMEZONE_OFFSET &&
							new Date() <= new Date(endAt) - TIMEZONE_OFFSET
						) {
							return true;
						} else {
							return false;
						}
					});

					return result;
				})();

				return {
					...member,
					timeLearning: memberIsExist
						? member.timeLearning + 1
						: isWorkingGroup
						? member.timeLearning + 1
						: member.timeLearning,
					learningPercent: memberIsExist
						? Math.floor(((member.timeLearning + 1) / this.totalTimeLearning) * 100)
						: Math.floor((member.timeLearning / this.totalTimeLearning) * 100),
					isOnline: memberIsExist,
					joinAndExitTimers:
						member.isOnline === memberIsExist
							? member.joinAndExitTimers
							: [
									...member.joinAndExitTimers,
									{
										type: memberIsExist,
										time: generalMethods.getCurrentTime(),
									},
							  ],
					chats: chatContents || [],
					micStatus: currentMicStatus,
					micCount:
						currentMicStatus != member.micStatus && currentMicStatus === true
							? member.micCount + 1
							: member.micCount,
					micDuration: currentMicStatus ? member.micDuration + 1 : member.micDuration,
					notExistStatus,
					isWorkingGroup,
				};
			});

			// RENDER VIEW
			// Taskbar left
			renderTaskbarLeftView.call(this);

			// Settings box
			if (
				settingsBox.className.includes("show") &&
				statisticalNav.className.includes("active")
			) {
				renderSettingsBoxView.call(this);
			}

			function renderTaskbarLeftView() {
				const learningTimeConverted = generalMethods.convertTimeSecond(this.totalTimeLearning);

				this.domVariables.turnOnStateMessageElm().textContent = `${appStorageObj.classStorage.getCurrentClassInfoName()} - ${generalMethods.getTimeStr(
					true,
					false,
					false,
					learningTimeConverted
				)} (${studentsExistInfo.length}/${this.attendanceData.length})`;
			}

			function renderSettingsBoxView() {
				// HANDLE STATISTICAL TAB
				// Time learning handle
				const totalTimeLearningConverted = generalMethods.convertTimeSecond(
					this.totalTimeLearning
				);

				this.domVariables.totalTimeLearningElm().textContent = `${generalMethods.getTimeStr(
					true,
					false,
					false,
					totalTimeLearningConverted
				)}`;

				// Student exist list handle
				this.domVariables.studentExistListElm().textContent = `${studentsExistInfo.length}/${this.attendanceData.length} HS`;

				// Student not exist box handle
				this.domVariables.notExistStudentBoxLabelELm().textContent = `HS hiện chưa có mặt (${studentNotExistInfo.length})`;

				// Student attendance list info handle
				const settings = settingsObj.getSettings();
				const allSortWrapper = $$(
					`.settings-box__wrapper .tab-list__item.statistical .statistical__slide-3 .slide-3__header label[data-sort-type]`
				);

				let columnSort;
				let sortType;

				allSortWrapper.forEach(sortWrapper => {
					const inputSort = $(`input[type="radio"]`, sortWrapper);

					if (inputSort.checked) {
						columnSort = inputSort.value;
						sortType = Number(sortWrapper.dataset.sortType);
					}
				});

				[...this.attendanceData]
					.sortObject(columnSort, sortType)
					.forEach((studentInfo, index) => {
						const studentItemElm = $(
							`.student-wrapper__student[data-index="${studentInfo.index}"]`,
							this.domVariables.attendanceListWrapper()
						);
						if (!studentItemElm) return;

						studentItemElm.style.order = index;

						const statusElm = $(".student__index > div", studentItemElm);
						const existBarElm = $(".main-bar__current", studentItemElm);
						const existBarContentElm = $(".current__percent", studentItemElm);
						const firstMeetElm = $(".join-and-exit-timers__first p", studentItemElm);
						const meetTimeList = $(".join-and-exit-timers__list", studentItemElm);
						const timeLearningElm = $(".student__time-learning > p", studentItemElm);
						const timeLearningConverted = generalMethods.convertTimeSecond(
							studentInfo.timeLearning
						);

						if (studentInfo.isOnline) {
							statusElm.classList.add("circle--online");
							statusElm.classList.remove("circle--offline");
							statusElm.classList.remove("circle--working-group");
						}

						if (!studentInfo.isOnline) {
							if (studentInfo.isWorkingGroup) {
								statusElm.classList.add("circle--working-group");
								statusElm.classList.remove("circle--online");
								statusElm.classList.remove("circle--offline");
							}

							if (!studentInfo.isWorkingGroup) {
								statusElm.classList.add("circle--offline");
								statusElm.classList.remove("circle--online");
								statusElm.classList.remove("circle--working-group");
							}
						}

						if (studentInfo.learningPercent < settings.timingExistPercent) {
							studentItemElm.classList.add("mark");
						} else {
							studentItemElm.classList.remove("mark");
						}

						existBarElm.style.width = `${studentInfo.learningPercent}%`;
						existBarContentElm.textContent = `${studentInfo.learningPercent}%`;
						firstMeetElm.textContent = `${
							studentInfo.joinAndExitTimers.length
								? generalMethods.getTimeStr(
										true,
										false,
										false,
										studentInfo.joinAndExitTimers[0].time
								  )
								: "Chưa vào"
						}`;

						// In and Out time
						meetTimeList.innerHTML = "";
						studentInfo.joinAndExitTimers.forEach(joinAndExitTime => {
							const timerItem = document.createElement("li");

							timerItem.className = `list__timers ${
								joinAndExitTime.type === true ? "join" : "exit"
							}`;
							timerItem.innerHTML = `
									<p>${generalMethods.getTimeStr(true, false, false, joinAndExitTime.time)}</p>
									<i class="${joinAndExitTime.type === true ? "far fa-sign-in-alt" : "far fa-sign-out-alt"}"></i>
							`;

							meetTimeList.appendChild(timerItem);
						});
						timeLearningElm.textContent = `${generalMethods.getTimeStr(
							true,
							false,
							false,
							timeLearningConverted
						)}`;

						// Exist state select
						const notExistSelectElm = $(
							`[js-elm="not-exist-status__select"][data-index="${studentInfo.index}"]`
						);

						if (studentInfo.isOnline) {
							notExistSelectElm.innerHTML = `
								<option value="0">Có mặt</option>
							`;

							notExistSelectElm.value = 0;
						}

						if (!studentInfo.isOnline) {
							if (studentInfo.acceptNotExist) {
								notExistSelectElm.innerHTML = `
									<option value="1">K.Phép</option>
									<option value="2">C.Phép</option>
								`;

								notExistSelectElm.value = 2;
							}

							if (!studentInfo.acceptNotExist) {
								notExistSelectElm.innerHTML = `
									<option value="1">K.Phép</option>
									<option value="2">C.Phép</option>
								`;

								notExistSelectElm.value = 1;
							}
						}
					});

				// Slide 4 render view
				const interactiveCtn = $(
					".statistical__slide-4 .slide-4__interactive-ctn .body__interactive-list"
				);

				interactiveCtn.innerHTML = "";

				this.attendanceData.forEach(member => {
					const newItem = document.createElement("li");

					newItem.className = "interactive-list__item";
					newItem.innerHTML = `
						<div class="item__img-ctn">
							<img src="${getLink("img/student.png")}" alt="" class="item__avatar" data-iml="4769.5">
						</div>
						<div class="item__info-ctn">
							<div class="info-ctn__info">
								<i class="fal fa-graduation-cap"></i>
								<span>Tên: <b>${member.name} (${member.index})</b></span>
							</div>
							<div class="info-ctn__mic">
								<i class="far fa-microphone"></i>
								<span>Mic: <b>${member.micCount}</b> lần - <b>${generalMethods.getTimeStr(
						true,
						false,
						false,
						generalMethods.convertTimeSecond(member.micDuration)
					)}</b></span>
							</div>
							<div class="info-ctn__comment" data-index="${member.index}" data-name="${member.name}">
								<p style="display: none">${JSON.stringify(member.chats)}</p>
								<i class="far fa-comments-alt"></i>
								<span>
									Chat: <b>${member.chats.reduce(
										(preValue, curValue) => preValue + curValue.contents.length,
										0
									)}</b> lần - Nội dung
									<i class="fas fa-arrow-alt-right" style="margin-right: 3px"></i>
								</span>
							</div>
						</div>`;

					interactiveCtn.appendChild(newItem);
				});
			}
		}, 1000);
	}

	async turnOff() {
		// Attendance history handle
		clearInterval(this.interval);

		// Connect to socket
		socketObj.connect();

		classPageObj.attendanceHistoryView.add(
			{
				classInfoName: appStorageObj.classStorage.getCurrentClassInfoName(),
				startAttendanceAt: this.startAttendanceAt,
				endAttendanceAt: generalMethods.getCurrentTime(),
				totalTimeLearning: this.totalTimeLearning,
				attendanceData: this.attendanceData,
				chats: (function getChats() {
					const allChats = [];
					const allChatsElement = $$(classSelectorsObj.CHAT_CONTAINER);

					allChatsElement.forEach(chatElement => {
						const chatName = $(classSelectorsObj.CHAT_NAME, chatElement).textContent;
						const chatTime = $(classSelectorsObj.CHAT_TIME, chatElement).textContent;
						const chatContents = Array.from(
							$$(classSelectorsObj.CHAT_CONTENT_CONTAINER + " > *", chatElement)
						).map(elm => elm.textContent);

						allChats.push({
							name: chatName,
							time: chatTime,
							content: chatContents,
						});
					});

					return allChats;
				})(),
			},
			true
		);

		// Reset attendance data
		this.attendanceData = this.attendanceData.map(studentInfo => ({
			index: studentInfo.index,
			name: studentInfo.name,
			googleName: studentInfo.googleName,
			timeLearning: 0,
			percentLearning: 0,
			isOnline: false,
			joinAndExitTimers: [],
			chats: [],
			micStatus: false,
			micCount: 0,
			micDuration: 0,
			notExistStatus: 0 /* 0 -> exit, 1 -> not accept, 2 -> accept */,

			// Group working
			isWorkingGroup: false,
			workingGroupTimes: studentInfo.workingGroupTimes,
		}));

		settingsObj.setSettings({ autoAttendance: false });
		const allExistStatusElm = $$(
			".settings-box__wrapper .table__student-table .student-table__body .body__row .row__exist-status"
		);

		allExistStatusElm.forEach(elm => {
			elm.textContent = "Chưa bật";
			elm.classList.remove("exist", "not-exist");
		});

		// Reset all attendance style
		this.setStyleAttendance().off();
	}

	setStyleAttendance() {
		const taskbarLeftAttendanceInput = $(".taskbar__left .left__attendance-state input");
		const taskbarLeftTurnOnMessageElm = $(
			".taskbar__left .left__attendance-state .attendance-state__attendance-message .attendance-message__on-state p"
		);
		const featuresAttendanceInput = $(
			".settings-box__wrapper .content__tab-list .tab-list__item.features .features__auto-attendance input"
		);

		return {
			on: () => {
				// Reset style statistical tab
				this.domVariables.currentClassElm().textContent =
					appStorageObj.classStorage.getCurrentClassInfoName();
				this.domVariables.disabledStatusContentElm().textContent = `Bắt đầu học lúc ${generalMethods.getTimeStr(
					true,
					true,
					true,
					this.startAttendanceAt
				)}`;

				// Reset style attendance btn in features tab
				featuresAttendanceInput.checked = true;

				// Reset style taskbar left
				taskbarLeftAttendanceInput.checked = true;

				this.renderStatisticalAttendanceList();
			},

			off: () => {
				//
				// Reset style statistical tab
				//
				const allStudentsAttendance = $$(
					".slide-3__student-wrapper > *",
					this.domVariables.attendanceListWrapper().parentNode
				);
				const studentsAttendanceWrapper = $$(
					".settings-box__wrapper .tab-list__item.statistical .statistical__slide-3 .slide-3__student-wrapper"
				);
				const statisticalSlide4Elm = $(
					".settings-box__wrapper .slide-4__interactive-ctn .body__interactive-list"
				);

				this.domVariables.disabledStatusContentElm().textContent =
					"Bật điểm danh tự động để bắt đầu thống kê!";
				this.domVariables.currentClassElm().textContent = "...";
				this.domVariables.totalTimeLearningElm().textContent = "00:00:00";
				this.domVariables.studentExistListElm().textContent = `... HS`;
				this.domVariables.notExistStudentBoxLabelELm().textContent = `HS hiện chưa có mặt`;
				this.domVariables.attendanceListWrapper().innerHTML = "";
				statisticalSlide4Elm.innerHTML = "";

				allStudentsAttendance.forEach(studentELm => {
					const studentProgressBar = $(".main-bar__current", studentELm);
					const studentProgressBarText = $("span.current__percent", studentELm);
					const timeLearningText = $(".student__time-learning", studentELm);

					studentProgressBar.style.width = 0;
					studentProgressBarText.innerText = "0%";
					timeLearningText.innerText = "Chưa điểm danh";
				});

				// Reset style attendance btn in features tab
				featuresAttendanceInput.checked = false;

				// Reset style taskbar left
				taskbarLeftAttendanceInput.checked = false;
				taskbarLeftTurnOnMessageElm.textContent = `Đã học 00:00:00 (0/${this.attendanceData.length})`;
			},
		};
	}

	renderStatisticalAttendanceList(membersList) {
		if (!membersList) {
			membersList = appStorageObj.classStorage.getClass().studentList;
		}

		// Render attendance list
		const attendanceListWrapper = this.domVariables.attendanceListWrapper();

		attendanceListWrapper.innerHTML = ``;
		membersList.forEach(studentInfo => {
			const newStudentAttendanceItem = document.createElement("li");

			newStudentAttendanceItem.dataset.index = studentInfo.index;
			newStudentAttendanceItem.className = "student-wrapper__student";
			newStudentAttendanceItem.innerHTML = `
				<span class="student__is-online">
				</span>
				<span class="student__index">
					<div class="circle circle--offline"></div>
					${studentInfo.index}
				</span>
				<span class="student__name">${studentInfo.name}</span>
				<span class="student__exist-bar">
					<div class="exist-bar__main-bar">
						<div class="main-bar__current" style="width: 0%;"><span class="current__percent">0</span></div>
					</div>
				</span>
				<span class="student__join-and-exit-timers">
					<span class="join-and-exit-timers__first">
						<p>Chưa vào</p>
						<i class="far fa-angle-down"></i>
					</span>
					<ul class="join-and-exit-timers__list">
						<li class="list__timers join">
								<p>00:00:00</p>
								<i class="fas fa-sign-in-alt"></i>
						</li>
						<li class="list__timers exit">
								<p>00:00:00</p>
								<i class="fas fa-sign-out-alt"></i>
						</li>
					</ul>
				</span>
				<span class="student__time-learning"><p>00:00:00</p></span>
				<span class="student__not-exist-status">
					<select js-elm="not-exist-status__select" class="not-exist-status__select" data-index="${studentInfo.index}">
						
					</select>
				</span>
			`;

			attendanceListWrapper.appendChild(newStudentAttendanceItem);
		});
	}

	initWorkingGroupTimes() {
		this.attendanceData = this.attendanceData.map(attendanceItem => {
			attendanceItem.workingGroupTimes = [];

			return attendanceItem;
		});

		const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

		const allGroup = appStorageObj.groupsStorage.getAll();

		const notTimeoutGroups = allGroup.filter(
			({ endAt }) => new Date() <= new Date(endAt) - TIMEZONE_OFFSET
		);

		notTimeoutGroups.forEach(({ eventId, membersInfo, startAt, endAt }) => {
			const membersInfoIndex = membersInfo.map(member => member.index);

			this.attendanceData.forEach((attendanceItem, arrayIndex, arrayOrigin) => {
				const { index: memberIndex } = attendanceItem;

				if (membersInfoIndex.includes(memberIndex)) {
					attendanceItem.workingGroupTimes.push({
						eventId,
						startAt,
						endAt,
					});
				}
			});
		});
	}
}
var attendanceObj = new Attendance();
