class ClassPage {
	async initial() {
		if (this.extensionWasUsed()) throw new Error("Extension is used by other tab.");

		console.clear();

		this.openTabs();
		this.setEvent();
		this.turnOffMedia();
		this.taskBar.initial();
		this.settingsBox.initial();
		this.cmtListContainer.initial();
		this.createGroupBoxView.initial();
		this.undoAndRedoMembersList.initial();
	}

	extensionWasUsed() {
		const usedStateIdStorage = "googleMeetExtension___classPageState";
		const lastExistTime = JSON.parse(localStorage.getItem(usedStateIdStorage));

		if (lastExistTime === null) {
			localStorage.setItem(usedStateIdStorage, JSON.stringify(new Date().getTime()));

			updateLastExistTimeInterval();

			return false;
		}

		if (new Date() - lastExistTime < 1500) {
			return true;
		} else {
			updateLastExistTimeInterval();

			return false;
		}

		function updateLastExistTimeInterval() {
			return setInterval(handleUpdate, 1000);

			function handleUpdate() {
				localStorage.setItem(usedStateIdStorage, JSON.stringify(new Date().getTime()));
			}
		}
	}

	async openTabs() {
		const OPEN_MEMBER_LIST_BTN_CLASS = classSelectorsObj.OPEN_MEMBER_LIST_BTN;
		const CLOSE_MENU_LIST_BTN_CLASS = classSelectorsObj.MEMBER_LIST_CLOSE_BTN;

		await generalMethods.domHandleWithCondition(
			OPEN_MEMBER_LIST_BTN_CLASS,
			() => {
				const closeMenuListBtn = $(CLOSE_MENU_LIST_BTN_CLASS);

				return closeMenuListBtn;
			},
			1000,
			element => element.click()
		);

		const OPEN_CHAT_BTN_CLASS =
			".r6xAKc:nth-child(3) .VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.JsuyRc.boDUxc";
		const CLOSE_CHAT_BTN_CLASS = `.WUFI9b[data-tab-id="2"] .VfPpkd-Bz112c-LgbsSe`;

		await generalMethods.domHandleWithCondition(
			OPEN_CHAT_BTN_CLASS,
			() => {
				const closeChatBoardBtn = $(CLOSE_CHAT_BTN_CLASS);

				return closeChatBoardBtn;
			},
			1000,
			element => element.click()
		);
	}

	turnOffMedia() {
		// check
		const settings = settingsObj.getSettings();
		if (!settings.autoTurnOffMedia) return;

		// handle
		const microBtnClass = classSelectorsObj.CLASS_PAGE_MICRO_BTN;
		const microBtnDisabledClass = classSelectorsObj.CLASS_PAGE_MICRO_DISABLED_BTN;

		const videoBtnClass = classSelectorsObj.CLASS_PAGE_CAMERA_BTN;
		const videoBtnDisabledClass = classSelectorsObj.CLASS_PAGE_CAMERA_DISABLED_BTN;

		// micro
		generalMethods.domHandleWithCondition(
			microBtnClass,
			() => $(microBtnDisabledClass),
			100,
			microBtn => microBtn.click()
		);

		// video
		generalMethods.domHandleWithCondition(
			videoBtnClass,
			() => $(videoBtnDisabledClass),
			100,
			videoBtn => videoBtn.click()
		);
	}

	async setEvent() {
		// Submit attendance when called end
		const END_CALL_BTN_CLASS = classSelectorsObj.END_CALL_BTN;

		let endCallBtnElm = $(END_CALL_BTN_CLASS);

		if (!endCallBtnElm) {
			await generalMethods.domHandleWithCondition(
				END_CALL_BTN_CLASS,
				() => {
					return $(END_CALL_BTN_CLASS);
				},
				50,
				endCallBtn => {
					endCallBtnElm = endCallBtn;
				}
			);
		}

		window.addEventListener("beforeunload", submitAttendanceHandle);

		endCallBtnElm.addEventListener("click", async e => {
			const myRowInMembersList = $(classSelectorsObj.MEMBER_INFO_LIST);
			const isRoomOwner = !!(
				myRowInMembersList && $(classSelectorsObj.ADMIN_ROOM_TITLE, myRowInMembersList)
			);

			if (isRoomOwner) {
				const QUIT_CLASS_ROOM = classSelectorsObj.QUIT_CLASS_ROOM_BTN;

				const QUIT_AND_CLOSE_CLASS_ROOM = classSelectorsObj.QUIT_AND_CLOSE_CLASS_ROOM_BTN;

				const BACKGROUND_ELM_CLASS = classSelectorsObj.BACKGROUND_END_CALL_BOX;

				let quitClassRoomBtn = await generalMethods.getDom(QUIT_CLASS_ROOM, false, 30);

				let quitAndCloseClassRoomBtn = await generalMethods.getDom(
					QUIT_AND_CLOSE_CLASS_ROOM,
					false,
					30
				);

				let backgroundElm = await generalMethods.getDom(BACKGROUND_ELM_CLASS, false, 30);

				quitClassRoomBtn.addEventListener("click", submitAttendanceHandle);

				quitAndCloseClassRoomBtn.addEventListener("click", submitAttendanceHandle);

				backgroundElm.addEventListener("click", notEndCallHandle);

				function notEndCallHandle() {
					quitAndCloseClassRoomBtn.removeEventListener("click", notEndCallHandle);

					backgroundElm.removeEventListener("click", notEndCallHandle);

					quitClassRoomBtn.removeEventListener("click", submitAttendanceHandle);
				}
			} else {
				submitAttendanceHandle();
			}
		});

		function submitAttendanceHandle() {
			const settings = settingsObj.getSettings();

			if (settings.autoAttendance) {
				const accessToken = appStorageObj.cookieStorage.token.accessToken.get();
				const userInfo = appStorageObj.userInfo.get();

				// Turn off auto attendance if it was turned on
				settingsObj.setSettings({ autoAttendance: false });

				chrome.runtime.sendMessage({
					type: "UPLOAD_ATTENDANCE",
					googleId: userInfo.googleId,
					accessToken: accessToken,
					data: {
						classInfoName: appStorageObj.classStorage.getCurrentClassInfoName(),
						startAttendanceAt: attendanceObj.startAttendanceAt,
						endAttendanceAt: generalMethods.getCurrentTime(),
						totalTimeLearning: attendanceObj.totalTimeLearning,
						attendanceData: attendanceObj.attendanceData,
						chats: (() => {
							const allChats = [];
							const allChatsElement = $$(".z38b6 .GDhqjd");

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
				});
			}
		}
	}

	cmtListContainer = {
		initial() {
			const body = document.body;
			const cmtBoxContainer = document.createElement("div");

			cmtBoxContainer.className = "cmt-box-wrapper";
			cmtBoxContainer.innerHTML = `
				<div class="cmt-box-wrapper__background"></div>
				<div class="cmt-box-wrapper__box">
					<header class="box__header">
						<p>Lịch sử tin nhắn</p>
						<p>Trần Văn Còn</p>
					</header>

					<div class="box__body">
						<ul class="body__cmt-list"></ul>
					</div>
				</div>
			`;

			const background = $(".cmt-box-wrapper__background", cmtBoxContainer);

			background.addEventListener("click", () => {
				cmtBoxContainer.classList.remove("show");
			});

			body.appendChild(cmtBoxContainer);
		},
	};

	groupListView = {
		TIMEZONE_OFFSET: new Date().getTimezoneOffset() * 60 * 1000,

		render(allGroupList = appStorageObj.groupsStorage.getAll()) {
			this.clear();

			allGroupList.forEach(group => {
				this.add(group, false, false);
			});
		},

		add(group, addToStorage = false, addToCloud = false) {
			let { eventId } = group;

			const resetViewHandle = group => {
				const { name, classInfoName, startAt, endAt, membersInfo, googleMeetLink } = group;

				const groupListElm = $("#group-tab__group-list");
				const groupTimeoutListElm = $("#group-tab__group-timeout-list");

				const groupIsTimeout = new Date() > new Date(endAt) - this.TIMEZONE_OFFSET;

				if (!groupIsTimeout) {
					// Init new group element
					const newGroupElm = document.createElement("tr");

					const timeStartString = generalMethods.getTimeStringLocal(startAt);
					const timeEndString = generalMethods.getTimeStringLocal(endAt);

					const memberCount = membersInfo.length;

					newGroupElm.className = "body__row";
					newGroupElm.setAttribute("js-elm", "group-body-row");
					newGroupElm.dataset.eventId = eventId;
					newGroupElm.innerHTML = `
						<td class="row__group-name">${name}</td>
						<td class="row__group-class">${classInfoName}</td>
						<td class="row__group-start">${timeStartString}</td>
						<td class="row__group-end">${timeEndString}</td>
						<td class="row__group-members">
							<div js-elm="group-member-count" class="members-count">
								<i class="far fa-user"></i>
								<span>${memberCount}</span>
								<i class="far fa-long-arrow-right"></i>
							</div>
						</td>
						<td class="row__group-meet-link">
							<a href="${googleMeetLink}" target="_blank" rel="noopener noreferrer">Truy cập phòng</a>
						</td>
						<td class="row__group-edit">
							<i js-elm="group-share-btn" class="fas fa-share"></i>
							<i js-elm="group-edit-btn" class="fas fa-edit"></i>
							<i js-elm="group-delete-btn" class="fas fa-trash"></i>
						</td>
					`;

					groupListElm.prepend(newGroupElm);

					// Set timeout to move to timeout group list
					const reamingToTimeout = new Date(endAt) - this.TIMEZONE_OFFSET - new Date();

					const moveGroupToTimeoutGroupList = () => {
						this.delete(eventId, group, false, false);
						this.add(group, false, false);
					};

					const timeoutIdToMoveToGroupTimeoutList = setTimeout(
						moveGroupToTimeoutGroupList,
						reamingToTimeout
					);

					newGroupElm.dataset.timeoutId = timeoutIdToMoveToGroupTimeoutList;
				}

				if (groupIsTimeout) {
					const newGroupElm = document.createElement("tr");

					newGroupElm.className = "body__row";
					newGroupElm.setAttribute("js-elm", "group-body-row");
					newGroupElm.dataset.eventId = eventId;
					newGroupElm.innerHTML = `
						<td class="row__group-name">${name}</td>
						<td class="row__group-class">${classInfoName}</td>
						<td class="row__group-timeout">00:00:00</td>
						<td class="row__group-members">
							<div js-elm="group-member-count" class="members-count">
								<i class="far fa-user"></i>
								<span>${membersInfo.length}</span>
								<i class="far fa-long-arrow-right"></i>
							</div>
						</td>
						<td class="row__group-edit">
							<i js-elm="group-edit-btn" class="fas fa-edit"></i>
							<i js-elm="group-delete-btn" class="fas fa-trash"></i>
						</td>
					`;

					groupTimeoutListElm.prepend(newGroupElm);

					const intervalIdToUpdateTimeoutDuration = this.setIntervalToUpdateTimeoutDuration(
						eventId,
						endAt
					);

					newGroupElm.dataset.intervalIdToUpdateTimeoutDuration =
						intervalIdToUpdateTimeoutDuration;
				}

				// Add group to storage
				if (addToStorage) appStorageObj.groupsStorage.add(group);
			};

			if (addToCloud) {
				const { name, classInfoName, startAt, endAt, duration, membersInfo, subject } = group;

				const addGroupUrl = `${HOST}/resources/calendar/create`;
				const addGroupOptions = {
					method: "POST",
					body: {
						classInfoName,
						name,
						startAt,
						endAt,
						duration,
						membersInfo,
						subject,
					},
				};

				tokenObj
					.handleCallApi(addGroupUrl, addGroupOptions)
					.catch(errors => console.error(errors));
			} else {
				if (!eventId) return console.error("Missing eventId.");

				resetViewHandle(group);
			}
		},

		update(
			eventId,
			newGroup,
			updateInStorage = false,
			updateInCloud = false,
			oldGroup = appStorageObj.groupsStorage.get(eventId)
		) {
			const resetViewHandle = group => {
				const {
					name: newGroupName,
					classInfoName: newGroupClassInfoName,
					membersInfo: newGroupMemberList,
					startAt: newGroupStartAt,
					endAt: newGroupEndAt,
				} = group;

				const { membersInfo: oldGroupMemberList, endAt: oldGroupEndAt } = oldGroup;

				const groupElmToUpdate = $(`*[data-event-id="${eventId}"]`);

				const oldGroupIsTimeout = new Date() > new Date(oldGroupEndAt) - this.TIMEZONE_OFFSET;
				const newGroupIsTimeout = new Date() > new Date(newGroupEndAt) - this.TIMEZONE_OFFSET;

				if (oldGroupIsTimeout) {
					if (newGroupIsTimeout) {
						// Clear old intervalIdToUpdateTimeoutDuration
						const intervalIdToUpdateTimeoutDuration =
							groupElmToUpdate.dataset.intervalIdToUpdateTimeoutDuration;

						clearInterval(intervalIdToUpdateTimeoutDuration);

						// Replace old group old info with new group info
						const nameElm = $(".row__group-name", groupElmToUpdate);
						const classInfoNameElm = $(".row__group-class", groupElmToUpdate);
						const memberCountElm = $(
							".row__group-members > .members-count > span",
							groupElmToUpdate
						);

						const newGroupMemberCount = newGroupMemberList.length;

						nameElm.textContent = newGroupName;
						classInfoNameElm.textContent = newGroupClassInfoName;
						memberCountElm.textContent = newGroupMemberCount;

						// Set new interval to update timeout duration

						const newIntervalIdToUpdateTimeoutDuration =
							this.setIntervalToUpdateTimeoutDuration(eventId, newGroupEndAt);

						groupElmToUpdate.dataset.intervalIdToUpdateTimeoutDuration =
							newIntervalIdToUpdateTimeoutDuration;
					}

					if (!newGroupIsTimeout) {
						// delete old group
						this.delete(eventId, oldGroup, false, false);

						// add new group
						this.add(group);
					}
				}

				if (!oldGroupIsTimeout) {
					// Set member attendance old group to normal status
					const oldGroupMemberIndexList = oldGroupMemberList.map(member => member.index);

					if (newGroupIsTimeout) {
						// delete old group
						this.delete(eventId, oldGroup, false, false);

						// add new group
						this.add(group, false, false);
					}

					if (!newGroupIsTimeout) {
						// clear timeout to handle timeout group
						const timeoutIdToHandleTimeoutGroup = groupElmToUpdate.dataset.timeoutId;

						clearTimeout(timeoutIdToHandleTimeoutGroup);

						// update new information to view
						const nameElm = $(".row__group-name", groupElmToUpdate);
						const classInfoNameElm = $(".row__group-class", groupElmToUpdate);
						const timeStartElm = $(".row__group-start", groupElmToUpdate);
						const timeEndElm = $(".row__group-end", groupElmToUpdate);
						const memberCountElm = $(".row__group-members > .members-count > span");

						nameElm.textContent = newGroupName;
						classInfoNameElm.textContent = newGroupClassInfoName;
						timeStartElm.textContent = generalMethods.getTimeStringLocal(newGroupStartAt);
						timeEndElm.textContent = generalMethods.getTimeStringLocal(newGroupEndAt);
						memberCountElm.textContent = newGroupMemberList.length;

						// Set timeout to handle timeout new group
						const newGroupReamingToTimeout =
							new Date(newGroupEndAt) - this.TIMEZONE_OFFSET - new Date();
						const newTimeoutIdToHandleTimeoutGroup = setTimeout(() => {
							this.delete(eventId, group);
							this.add(group);
						}, newGroupReamingToTimeout);

						groupElmToUpdate.dataset.timeoutId = newTimeoutIdToHandleTimeoutGroup;
					}
				}

				if (updateInStorage) appStorageObj.groupsStorage.update(eventId, group);
			};

			if (updateInCloud) {
				const {
					name: newGroupName,
					classInfoName: newGroupClassInfoName,
					membersInfo: newGroupMemberList,
					endAt: newGroupEndAt,
					startAt: newGroupStartAt,
					duration: newGroupDuration,
					subject: newGroupSubject,
				} = newGroup;

				const updateGroupUrl = `${HOST}/resources/calendar/update`;
				const updateGroupOptions = {
					method: "PATCH",
					body: {
						googleId: appStorageObj.userInfo.get().googleId,
						eventId,
						objFieldsToUpdate: {
							name: newGroupName,
							classInfoName: newGroupClassInfoName,
							startAt: newGroupStartAt,
							endAt: newGroupEndAt,
							duration: newGroupDuration,
							membersInfo: newGroupMemberList,
							subject: newGroupSubject,
						},
					},
				};

				tokenObj
					.handleCallApi(updateGroupUrl, updateGroupOptions)
					.catch(errors => console.error(errors));
			} else {
				resetViewHandle(newGroup);
			}
		},

		delete(
			eventId,
			group = appStorageObj.groupsStorage.get(eventId),
			deleteInStorage = false,
			deleteInCloud = false
		) {
			const resetViewHandle = () => {
				const { endAt } = group;

				const memberIndexList = group.membersInfo.map(member => member.index);

				const groupElmToRemove = $(`*[data-event-id="${eventId}"]`);

				const groupIsTimeout = new Date() > new Date(endAt) - this.TIMEZONE_OFFSET;

				if (!groupIsTimeout) {
					// Clear old timeout (to move to group timeout list)
					const timeoutId = groupElmToRemove.dataset.timeoutId;

					clearTimeout(timeoutId);
				}

				if (groupIsTimeout) {
					const intervalIdToUpdateTimeoutDuration =
						groupElmToRemove.dataset.intervalIdToUpdateTimeoutDuration;

					clearInterval(intervalIdToUpdateTimeoutDuration);
				}

				groupElmToRemove.remove();

				// Delete group in localStorage
				if (deleteInStorage) appStorageObj.groupsStorage.delete(eventId);
			};

			const deleteGroupUrl = `${HOST}/resources/calendar/delete`;
			const deleteGroupOptions = {
				method: "DELETE",
				responseType: "unset",
				queryBody: {
					eventId,
				},
			};

			if (deleteInCloud) {
				tokenObj
					.handleCallApi(deleteGroupUrl, deleteGroupOptions)
					.catch(errors => console.error(errors));
			} else {
				resetViewHandle();
			}
		},

		clear() {
			const groupListElm = $("#group-tab__group-list");
			const groupTimeoutListElm = $("#group-tab__group-timeout-list");

			const allEventIdGroup = [
				...groupListElm.childNodes,
				...groupTimeoutListElm.childNodes,
			].map(groupElm => groupElm.dataset.eventId);

			allEventIdGroup.forEach(eventId => {
				this.delete(eventId);
			});
		},

		setIntervalToUpdateTimeoutDuration(eventId, endAt) {
			return setInterval(() => {
				const groupElmToUpdate = $(`*[data-event-id="${eventId}"] > .row__group-timeout`);

				const timeoutDuration = (new Date() - (new Date(endAt) - this.TIMEZONE_OFFSET)) / 1000;
				const timeoutDurationObject = generalMethods.convertTimeSecond(timeoutDuration);
				const timeoutDurationString = `${timeoutDurationObject.hours}:${timeoutDurationObject.minutes}:${timeoutDurationObject.seconds}`;

				groupElmToUpdate.textContent = timeoutDurationString;
			}, 1000);
		},
	};

	createGroupBoxView = {
		validateErrorsEnum: {
			groupName: "GROUP_NAME_ERROR",
			groupMember: "GROUP_MEMBER_ERROR",
		},
		validateErrors: new Set(), // Finish initial in createGroupBox.initial()
		storageKey: appStorageObj.storageKeys.groups,

		initial() {
			for (const value of Object.values(this.validateErrorsEnum)) {
				this.validateErrors.add(value);
			}

			const body = document.body;

			const createGroupBox = document.createElement("div");

			classPageObj.addMissionBox.initial();

			createGroupBox.id = "create-group-box";
			createGroupBox.className = "create-group-box";
			createGroupBox.innerHTML = htmlStringObj.createGroupBox.box;

			body.append(createGroupBox);

			this.createGroupBox = createGroupBox;
			this.initEvent();
			this.createGroupHandle();
		},

		initEvent() {
			// GROUP BOX
			// Change group name handle
			const groupNameInput = $("#group-name-input");
			groupNameInput.addEventListener("focusout", e => {
				const value = e.target.value;

				if (!value) {
					this.addValidateError("groupName");
				} else {
					this.deleteValidateError("groupName");
				}
			});

			// Change group class handle
			const groupClassSelect = $("#create-group-box .group-info__group-class select");
			groupClassSelect.addEventListener("change", e => this.renderMembersList(e.target.value));

			// Listen event while select and unSelect member
			const groupMemberContainerElm = $("#create-group-member-container");
			groupMemberContainerElm.addEventListener("change", e => {
				const target = e.target;

				if (!(target.tagName === "INPUT" && target.type === "checkbox")) {
					return;
				}

				const memberSelectedCount = $$("input:checked", groupMemberContainerElm)?.length || 0;

				if (memberSelectedCount === 0) {
					this.addValidateError("groupMember");
				} else {
					this.deleteValidateError("groupMember");
				}
			});

			// GROUP TAB
			// Listen event click in list group wrapper
			const handleClickAllGroupList = ({ target }) => {
				let tableRow = target;

				while (tableRow.getAttribute("js-elm") !== "group-body-row") {
					tableRow = tableRow.parentNode;
				}

				const { eventId } = tableRow.dataset;

				while (true) {
					switch (true) {
						// Member count button
						case target.getAttribute("js-elm") === "group-member-count": {
							if (stopWhileAutoAttendanceOn()) return;

							this.openToChange(eventId);

							return;
						}

						// Delete button handle
						case target.getAttribute("js-elm") === "group-delete-btn": {
							if (stopWhileAutoAttendanceOn()) return;

							const groupToDelete = appStorageObj.groupsStorage.get(eventId);

							classPageObj.groupListView.delete(eventId, groupToDelete, true, true);

							return;
						}

						// Edit button handle
						case target.getAttribute("js-elm") === "group-edit-btn": {
							if (stopWhileAutoAttendanceOn()) return;

							this.openToChange(eventId);

							return;
						}

						// Share button handle
						case target.getAttribute("js-elm") === "group-share-btn": {
							const textToShare = this.getIntroduceText(eventId);

							navigator.clipboard.writeText(textToShare);

							alert(
								"Tin nhắn chia sẻ đã được copy vào bộ nhớ máy!\n\nChuột phải chọn Dán(Paste) hoặc nhấn Crtl + V để chia sẻ!"
							);

							return;
						}

						// Stop
						case target.getAttribute("js-elm") === "group-table-body": {
							return;
						}

						default: {
							target = target.parentNode;
						}
					}
				}

				function stopWhileAutoAttendanceOn() {
					const { autoAttendance: isTurnOnAutoAttendance } = settingsObj.getSettings();

					if (isTurnOnAutoAttendance) {
						alert("Vui lòng tắt điểm danh tự động trước khi thực hiện thao tác này.");

						return true;
					}

					return false;
				}
			};

			const groupListBody = $("#group-tab .group__table-wrapper .table__body");
			const groupTimeoutBody = $("#group-tab .group__table-timeout-wrapper .table__body");

			groupListBody.addEventListener("click", handleClickAllGroupList);
			groupTimeoutBody.addEventListener("click", handleClickAllGroupList);

			// Listen event type of search box
			const createGroupSearchBox = $(
				"#create-group-box .create-group-box__box .body__search-box input"
			);
			createGroupSearchBox.addEventListener("input", e => {
				const value = e.target.value.toLowerCase();

				const allStudentRowToSearch = [
					...$$(
						"#create-group-box .create-group-box__box .student-list-ctn__list .list__student"
					),
				];
				const allStudentSearchContent = allStudentRowToSearch.map(studentRow => ({
					index: +studentRow.dataset.index,
					searchContent: $("span", studentRow).textContent,
				}));

				const studentsIndexShowed = allStudentSearchContent
					.filter(searchContent => searchContent.searchContent.toLowerCase().includes(value))
					.map(searchContent => searchContent.index);

				allStudentRowToSearch.forEach(studentRow => {
					const studentIndex = +studentRow.dataset.index;

					if (studentsIndexShowed.includes(studentIndex)) {
						studentRow.style.height = "40px";
					} else {
						studentRow.style.height = "0px";
					}
				});
			});
		},

		createGroupHandle() {
			const createGroupBtn = $("#create-group-btn");

			createGroupBtn.addEventListener("click", async e => {
				const groupNameInput = $("#group-name-input");
				const groupClassInput = $("#group-class-select");
				const meetingDuration =
					+$(".group-info__group-end-time select", this.createGroupBox).value || 0;

				let startAt = new Date($("#group-time-start-input").value);
				startAt.setMinutes(startAt.getMinutes() + startAt.getTimezoneOffset());
				startAt = startAt.getTime();

				let endAt = new Date(startAt.valueOf());
				endAt.setMinutes(endAt.getMinutes() + +meetingDuration);
				endAt = endAt.getTime();

				const memberEmailSelectedList = [
					...$$(
						`.body__student-list-ctn .student-list-ctn__list .list__student`,
						this.createGroupBox
					),
				]
					.filter(elm => $(`input[type="checkbox"]`, elm).checked)
					.map(elm => elm.dataset.email);

				const currentSubject = $("#group-subjects-select").value;
				const membersListInfo = appStorageObj.classStorage
					.getClass($("#group-class-select").value)
					.studentList.filter(({ email }) => memberEmailSelectedList.includes(email))
					.map(student => ({
						index: student.index,
						googleName: student.googleName,
						email: student.email,
					}));

				createGroupBtn.style.pointerEvents = "none";

				const groupBoxTypeInput = $("#group-box-type");

				if (!groupBoxTypeInput.value) {
					classPageObj.groupListView.add(
						{
							name: groupNameInput.value,
							membersInfo: membersListInfo,
							classInfoName: groupClassInput.value,
							duration: meetingDuration,
							subject: currentSubject,
							startAt,
							endAt,
						},
						true,
						true
					);

					this.close();
				}

				if (groupBoxTypeInput.value) {
					const eventId = groupBoxTypeInput.value;

					classPageObj.groupListView.update(
						eventId,
						{
							eventId,
							name: groupNameInput.value,
							classInfoName: groupClassInput.value,
							membersInfo: membersListInfo,
							duration: meetingDuration,
							subject: currentSubject,
							startAt,
							endAt,
						},
						true,
						true
					);

					this.close();
				}

				createGroupBtn.style.pointerEvents = "unset";
			});
		},

		open() {
			const { autoAttendance: isTurnOnAutoAttendance } = settingsObj.getSettings();

			if (isTurnOnAutoAttendance) {
				return alert("Vui lòng tắt điểm danh tự động trước khi thực hiện thao tác này.");
			}

			// Check has logged in
			const userInfo = appStorageObj.userInfo.get();

			if (!userInfo.googleId) {
				return classPageObj.settingsBox.loginNotify.show();
			}

			const nowDate = new Date();

			// Disable create btn
			const createGroupBtn = $("#create-group-btn");
			createGroupBtn.disabled = true;

			// Set group type to "create"
			const groupTypeInput = $("#group-box-type");
			const headerTitleElm = $("#create-group-box .create-group-box__box .box__header p");
			const footerButtonElm = $(
				"#create-group-box .create-group-box__box .box__footer .footer__create-btn"
			);

			groupTypeInput.value = "";
			headerTitleElm.textContent = "Tạo nhóm mới";
			footerButtonElm.textContent = "Tạo";

			// Show create group box
			const inputStatus = $("#create-group-box-status");
			inputStatus.checked = true;

			// Set group name to blank
			const groupNameInput = $("#group-name-input");
			groupNameInput.value = "";

			// Render and select default group class
			const currentClassNameInfo = appStorageObj.classStorage.getCurrentClassInfoName();
			const groupClassSelect = $("#group-class-select");
			const classList = appStorageObj.classStorage.getAllClassInfo();

			groupClassSelect.innerHTML = `${classList
				.map(
					classInfo =>
						`<option value="${classInfo.classInfoName}">${classInfo.classInfoName}</option>`
				)
				.join("")}`;
			groupClassSelect.value = currentClassNameInfo;

			// Set start time and min time to now
			const startMeetingTimeInput = $("#group-time-start-input");

			const YYYY = `${nowDate.getFullYear()}`;
			const MM =
				`${nowDate.getMonth() + 1}`.length === 2
					? `${nowDate.getMonth() + 1}`
					: `0${nowDate.getMonth() + 1}`;
			const DD =
				`${nowDate.getDate()}`.length === 2 ? `${nowDate.getDate()}` : `0${nowDate.getDate()}`;
			const hh =
				`${nowDate.getHours()}`.length === 2
					? `${nowDate.getHours()}`
					: `0${nowDate.getHours()}`;
			const mm =
				`${nowDate.getMinutes()}`.length === 2
					? `${nowDate.getMinutes()}`
					: `0${nowDate.getMinutes()}`;

			const defaultTimeAndMinTimeString = `${YYYY}-${MM}-${DD}T${hh}:${mm}`;

			startMeetingTimeInput.value = defaultTimeAndMinTimeString;
			startMeetingTimeInput.min = defaultTimeAndMinTimeString;

			// Set end time to first value
			const endMeetingTimeSelect = $(".group-info__group-end-time select");
			endMeetingTimeSelect.value = $("option", endMeetingTimeSelect).value;

			// Render members list
			this.renderMembersList();
		},

		openToChange(eventId) {
			const { autoAttendance: isTurnOnAutoAttendance } = settingsObj.getSettings();

			if (isTurnOnAutoAttendance) {
				return alert("Vui lòng tắt điểm danh tự động trước khi thực hiện thao tác này.");
			}

			// Enable create group btn
			const createGroupBtn = $("#create-group-btn");
			createGroupBtn.disabled = false;

			const groupBoxTypeInput = $("#group-box-type");
			groupBoxTypeInput.value = eventId;

			const oldGroupInfo = appStorageObj.groupsStorage.get(eventId);

			// Set group type to "change"
			const groupTypeInput = $("#group-box-type");
			const headerTitleElm = $("#create-group-box .create-group-box__box .box__header p");
			const footerButtonElm = $(
				"#create-group-box .create-group-box__box .box__footer .footer__create-btn"
			);

			groupTypeInput.value = eventId;
			headerTitleElm.textContent = "Chỉnh sửa thông tin";
			footerButtonElm.textContent = "Sửa";

			// Show create group box
			const inputStatus = $("#create-group-box-status");
			inputStatus.checked = true;

			// Set group name to blank
			const groupNameInput = $("#group-name-input");
			groupNameInput.value = oldGroupInfo.name;

			// Render and select default group classInfoName
			const groupClassSelect = $("#group-class-select");
			const classList = appStorageObj.classStorage.getAllClassInfo();

			groupClassSelect.innerHTML = `${classList
				.map(
					classInfo =>
						`<option value="${classInfo.classInfoName}">${classInfo.classInfoName}</option>`
				)
				.join("")}`;
			groupClassSelect.value = oldGroupInfo.classInfoName;

			// Set start time to value saved
			const nowDate = new Date();
			const startMeetingTimeInput = $("#group-time-start-input");
			const YYYY = `${nowDate.getFullYear()}`;
			const MM =
				`${nowDate.getMonth() + 1}`.length === 2
					? `${nowDate.getMonth() + 1}`
					: `0${nowDate.getMonth() + 1}`;
			const DD =
				`${nowDate.getDate()}`.length === 2 ? `${nowDate.getDate()}` : `0${nowDate.getDate()}`;
			const hh =
				`${nowDate.getHours()}`.length === 2
					? `${nowDate.getHours()}`
					: `0${nowDate.getHours()}`;
			const mm =
				`${nowDate.getMinutes()}`.length === 2
					? `${nowDate.getMinutes()}`
					: `0${nowDate.getMinutes()}`;

			const defaultTimeAndMinTimeString = `${YYYY}-${MM}-${DD}T${hh}:${mm}`;

			startMeetingTimeInput.value = defaultTimeAndMinTimeString;
			startMeetingTimeInput.min = defaultTimeAndMinTimeString;

			// Set end time to first value
			const endMeetingTimeSelect = $(".group-info__group-end-time select");

			endMeetingTimeSelect.value = oldGroupInfo.duration;

			// Render members list
			this.renderMembersList();

			// Check to checkbox student
			const { studentList } = appStorageObj.classStorage.getClass(oldGroupInfo.classInfoName);

			const memberEmailSelectedList = oldGroupInfo.membersInfo.map(({ email }) => email);

			studentList.forEach(student => {
				const { email } = student;

				const checkBoxInput = $(
					`#create-group-box .student-list-ctn__list .list__student[data-email="${email}"] input`
				);

				if (memberEmailSelectedList.includes(email)) {
					checkBoxInput.checked = true;
				}
			});
		},

		close() {
			const inputStatus = $("#create-group-box-status");
			inputStatus.checked = false;
		},

		renderMembersList(classNameInfo = $("#group-class-select").value) {
			const membersList = appStorageObj.classStorage.getClass(classNameInfo).studentList;
			const membersListElm = $(
				"#create-group-box .body__student-list-ctn .student-list-ctn__list"
			);

			membersListElm.innerHTML = membersList
				.filter(({ email }) => generalMethods.validateEmail(email))
				.toHtml(
					({ index, name, email }) => `
						<li class="list__student" data-email="${email}">
							<label>
								<span>${index} - ${name}</span>
								<div>
									<input type="checkbox" />
									<i class="fas fa-check"></i>
								</div>
							</label>
						</li>
					`
				);
		},

		getIntroduceText(eventId) {
			const groupInfo = appStorageObj.groupsStorage.get(eventId);
			const introduceText = `Tên nhóm: ${groupInfo.name}\nLớp: ${
				groupInfo.classInfoName
			}\nBắt đầu: ${(() => {
				const startAt = new Date(groupInfo.startAt);
				startAt.setMinutes(startAt.getMinutes() - startAt.getTimezoneOffset());

				return startAt.toLocaleString("vn-VN", {
					timeZone: "Asia/Ho_Chi_Minh",
					hour12: false,
				});
			})()}\nKết thúc: ${(() => {
				const endAt = new Date(groupInfo.endAt);
				endAt.setMinutes(endAt.getMinutes() - endAt.getTimezoneOffset());

				return endAt.toLocaleString("vn-VN", {
					timeZone: "Asia/Ho_Chi_Minh",
					hour12: false,
				});
			})()}\nDS thành viên theo STT: ${groupInfo.membersInfo
				.map((info, index) => (index === 0 ? `${info.index}` : `, ${info.index}`))
				.join("")}\nLink meet: ${
				groupInfo.googleMeetLink
			}\n=========================================`;

			return introduceText;
		},

		addValidateError(errorType) {
			errorType = this.validateErrorsEnum[errorType];

			if (!errorType) {
				return console.error("Can not found this error type in validateErrorEnum.");
			}

			this.validateErrors.add(errorType);

			const createGroupBtn = $("#create-group-btn");

			if (this.validateErrors.size === 0) {
				createGroupBtn.disabled = false;
			} else {
				createGroupBtn.disabled = true;
			}
		},

		deleteValidateError(errorType) {
			errorType = this.validateErrorsEnum[errorType];

			if (!errorType) {
				return console.error("Can not found this error type in validateErrorEnum.");
			}

			this.validateErrors.delete(errorType);

			const createGroupBtn = $("#create-group-btn");

			if (this.validateErrors.size === 0) {
				createGroupBtn.disabled = false;
			} else {
				createGroupBtn.disabled = true;
			}
		},
	};

	addMissionBox = {
		initial() {
			const bodyElm = document.body;

			const addMissionBoxElm = document.createElement("div");

			addMissionBoxElm.id = "add-mission-box-wrapper";
			addMissionBoxElm.className = "add-mision-box-wrapper";
			addMissionBoxElm.innerHTML = `
				<div class="add-mission-box">
					<header class="head">
						<p>Tải lên tài liệu</p>
						<i class="far fa-times"></i>
					</header>

					<div class="body">
						<label class="select-file">
							<p>
								<span>Chọn tài liệu</span>
								<i class="far fa-arrow-to-top"></i>
							</p>

							<input
								id="mission-file-input"
								type="file"
								accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf, image/*"
							/>
						</label>
					</div>
				</div>
			`;

			bodyElm.append(addMissionBoxElm);
		},
	};

	allClassInfoView = {
		updateStudentListIntervalId: null,
		studentsSelectedIndex: [],

		initial() {
			const classButtonContainer = $(`[js-elm="class-button-container"]`);

			classButtonContainer.addEventListener("click", ({ target }) => {
				while (true) {
					switch (true) {
						case target === classButtonContainer:
							return;

						case target.getAttribute("js-elm") === "class-button": {
							const { classInfoName } = target.dataset;
							const { autoAttendance } = settingsObj.getSettings();

							if (autoAttendance) {
								return alert("Vui lòng tắt điểm danh tự động trước khi đổi lớp học!");
							}

							if (target.classList.contains("active")) {
								appStorageObj.classStorage.setCurrentClassInfoName("default");
							} else {
								appStorageObj.classStorage.setCurrentClassInfoName(classInfoName);
							}

							this.studentsSelectedIndex = [];
							this.renderClassBtn();
							this.renderStudentListInClass();

							return;
						}

						default:
							target = target.parentNode;
					}
				}
			});
		},

		renderClassBtn(allClassInfoName = appStorageObj.classStorage.getAllClassName()) {
			const classButtonContainer = $(`[js-elm="class-button-container"]`);

			const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

			classButtonContainer.innerHTML = "";

			allClassInfoName.forEach(classInfoName => {
				if (classInfoName === "default") return;

				// Create new className button
				const classBtnElm = document.createElement("li");

				// Set style
				classBtnElm.className = `class-list__class ${
					currentClassInfoName === classInfoName ? "active" : ""
				}`;
				classBtnElm.setAttribute("js-elm", "class-button");
				classBtnElm.dataset.classInfoName = classInfoName;
				classBtnElm.innerHTML = `
					<div class="nav-ctn">

					<div class="nav-ctn__edit">
						<img src="${getLink("img/editIcon.png")}" alt="" />
					</div>

					<div class="nav-ctn__close">
						<img src="${getLink("img/closeIcon(2).png")}" alt=""/></div>
					</div>

					<img src="${getLink("img/listContactIcon.png")}" alt="" />

					<p>${classInfoName}</p>
				`;

				// Push to HTML View
				classButtonContainer.appendChild(classBtnElm);

				// Delete btn handle
				const deleteCurrentClassBtn = $(".nav-ctn__close", classBtnElm);

				const handleDeleteCurrentClass = e => {
					e.stopPropagation();

					const { autoAttendance: autoAttendanceSettingState } = settingsObj.getSettings();

					if (autoAttendanceSettingState) {
						return alert("Vui lòng tắt điểm danh tự động trước khi chỉnh sửa thông tin này!");
					}

					classPageObj.undoAndRedoMembersList.deleteClass(classInfoName);
				};

				deleteCurrentClassBtn.addEventListener("click", handleDeleteCurrentClass);

				// Edit btn handle
				const editCurrentClassBtn = $(".nav-ctn__edit", classBtnElm);

				const handleEditCurrentClass = e => {
					e.stopPropagation();

					const { autoAttendance: autoAttendanceSettingState } = settingsObj.getSettings();

					if (autoAttendanceSettingState) {
						return alert("Vui lòng tắt điểm danh tự động trước khi chỉnh sửa thông tin này!");
					}

					const newClassInfoName = prompt("Nhập tên mới của lớp này:", classInfoName);

					if (newClassInfoName === null || !newClassInfoName) {
						return alert("Không nhận được giá trị vừa nhập.");
					}

					const oldClassInfo = appStorageObj.classStorage.getClass();
					const newClassInfo = { ...oldClassInfo, classInfoName: newClassInfoName };

					classPageObj.undoAndRedoMembersList.changeClass(classInfoName, newClassInfo);
				};

				editCurrentClassBtn.addEventListener("click", handleEditCurrentClass);
			});
		},

		renderStudentListInClass(classInfo = appStorageObj.classStorage.getClass()) {
			if (!classInfo) throw new Error("Missing classInfo.");

			const { studentList } = classInfo;

			const studentListElm = $(".settings-box__wrapper .student-table__body");
			const allMemberRows = [];

			studentListElm.innerHTML = "";
			studentList
				.sort((firstElm, secondElm) => firstElm.index - secondElm.index)
				.toHtml(member => {
					const { index, name, googleName, email } = member;

					const memberRow = document.createElement("tr");

					const html = `
						<td class="row__index">
							<input
								value="${index}"
								spellcheck="false"
							/>
							<div></div>
						</td>

						<td class="row__name">
							<input
								value="${name}"
								spellcheck="false"
							/>
							<div></div>
						</td>

						<td class="row__meet-name">
							<input value="${googleName}" spellcheck="false" />
							<div></div>
						</td>

						<td class="row__gmail">
							<input value="${email}" placeholder="Chưa nhập Gmail" spellcheck="false" />
							<div></div>
						</td>

						<td class="row__exist-state"><p>Chưa vào</p></td>

						<td class="row__select">
							<label class="select__icon">
								<input type="checkbox" ${this.studentsSelectedIndex.includes(index) ? "checked" : ""}/>
								<img class="icon__checked" src="${getLink("img/checkIcon.png")}" alt="" />
							</label>
						</td>			  
					`;

					memberRow.dataset.studentIndex = index;
					memberRow.className = "body__row";
					memberRow.innerHTML = html;

					allMemberRows.push(memberRow);
					studentListElm.appendChild(memberRow);

					return html;
				});

			// Reset view online form
			classPageObj.settingsBox.addStudentBoxWithLink.resetView();

			// Reset view student list table tools bar
			classPageObj.settingsBox.resetStyleToolbarBtnStudentList();

			// Update table student list per second
			const setIntervalHandle = () => {
				clearInterval(this.updateStudentListIntervalId);

				handleUpdate();

				this.updateStudentListIntervalId = setInterval(handleUpdate, 1000);

				function handleUpdate() {
					const allStudentsNameExist = Array.from($$(classSelectorsObj.MEMBER_NAME_LIST)).map(
						elm => elm.textContent
					);

					const existStatesArray = studentList.map(studentInfo =>
						allStudentsNameExist.includes(studentInfo.googleName) ? "Đang học" : "Chưa vào"
					);

					existStatesArray.forEach((stateMessage, index) => {
						const currentMemberRow = allMemberRows[index];
						const stateContentElm = $(".row__exist-state", currentMemberRow);

						stateContentElm.textContent = stateMessage;

						if (stateMessage === "Đang học") {
							currentMemberRow.classList.remove("not-exist");
						} else {
							currentMemberRow.classList.add("not-exist");
						}
					});
				}
			};
			setIntervalHandle();

			this.renderClassBtn();
		},

		async add(classInfo, addInCloud = false) {
			const allClassInfoName = appStorageObj.classStorage.getAllClassName();
			const classInfoNameWasExisted = allClassInfoName.includes(classInfo.classInfoName);

			if (classInfoNameWasExisted) {
				throw new Error("This classInfoName was existed.");
			}

			const handleAdd = classInfo => {
				if (!classInfo) return;

				const allClassInfo = appStorageObj.classStorage.getAllClassInfo();

				allClassInfo.push(classInfo);

				appStorageObj.classStorage.addClassInfo(classInfo);

				this.renderStudentListInClass(classInfo);
			};

			if (addInCloud) {
				const addClassInfoUrl = `${HOST}/resources/class-info/add`;
				const addClassInfoOptions = {
					method: "POST",
					body: {
						classInfoToAdd: classInfo,
					},
				};

				await tokenObj.handleCallApi(addClassInfoUrl, addClassInfoOptions).catch(console.error);
			} else {
				handleAdd(classInfo);
			}
		},

		async update(classInfoNameToUpdate, newClassInfo, changeInCloud = false) {
			const handleUpdate = (classInfoNameToUpdate, newClassInfo) => {
				// update classInfo in storage
				appStorageObj.classStorage.setClass(classInfoNameToUpdate, newClassInfo);

				this.renderStudentListInClass(newClassInfo);

				classPageObj.settingsBox.addStudentBoxWithLink.resetView();
			};

			if (changeInCloud) {
				const changeClassInfoUrl = `${HOST}/resources/class-info/update`;
				const changeClassInfoOptions = {
					method: "PATCH",
					body: {
						classInfoNameToUpdate,
						newClassInfo,
					},
				};

				await tokenObj
					.handleCallApi(changeClassInfoUrl, changeClassInfoOptions)
					.then(updatedClassInfo => {
						newClassInfo = updatedClassInfo;
					});
			} else {
				handleUpdate(classInfoNameToUpdate, newClassInfo);
			}
		},

		async delete(classInfoNameToDelete, deleteInCloud = false) {
			const handleDelete = classInfoNameToDelete => {
				// Delete classInfo in storage
				appStorageObj.classStorage.deleteClass(classInfoNameToDelete);

				this.renderStudentListInClass();
			};

			if (deleteInCloud) {
				const deleteClassInfoUrl = `${HOST}/resources/class-info/delete`;
				const deleteClassInfoOptions = {
					method: "DELETE",
					responseType: "text",
					queryBody: {
						classInfoNameToDelete,
					},
				};

				await tokenObj
					.handleCallApi(deleteClassInfoUrl, deleteClassInfoOptions)
					.catch(errors => console.error(errors));
			} else {
				handleDelete(classInfoNameToDelete);
			}
		},
	};

	attendanceHistoryView = {
		render(attendanceHistoryList = appStorageObj.attendanceHistoryStorage.getAll()) {
			const attendanceHistoryWrapperElm = $('[js-elm="attendance-history-wrapper"]');

			const attendanceHistoryListData = attendanceHistoryList.reverse();

			const imagesLink = [
				getLink("img/teacher-0.png"),
				getLink("img/teacher-1.png"),
				getLink("img/teacher-2.png"),
				getLink("img/teacher-3.png"),
				getLink("img/teacher-4.png"),
			];

			attendanceHistoryWrapperElm.innerHTML = "";

			attendanceHistoryListData.forEach(
				({
					attendanceId,
					classInfoName,
					totalTimeLearning,
					startAttendanceAt,
					endAttendanceAt,
				}) => {
					const newHistoryItem = document.createElement("li");

					const timeLearningConverted = generalMethods.convertTimeSecond(totalTimeLearning);

					const imageLink = imagesLink[Math.floor(Math.random() * (4 - 0 + 1) + 0)];

					const startLearningTimeStr =
						startAttendanceAt.dates === endAttendanceAt.dates
							? generalMethods.getTimeStr(true, false, false, startAttendanceAt)
							: generalMethods.getTimeStr(true, true, true, startAttendanceAt);

					const endLearningTimeStr = generalMethods.getTimeStr(
						true,
						true,
						true,
						endAttendanceAt
					);

					newHistoryItem.dataset.attendanceId = attendanceId;

					newHistoryItem.className = "wrapper__item";

					newHistoryItem.innerHTML = `<img src="${imageLink}" alt=""/><div class="item__right-slide"> <div class="right-slide__class-name-info"> <span>Lớp học:</span> <p>${classInfoName}</p> </div> <div class="right-slide__time"> <span>Học từ:</span> <p>${startLearningTimeStr} - ${endLearningTimeStr}</p> </div> <div class="right-slide__time-learning"> <span>Thời gian:</span> <p>${
						timeLearningConverted.hours
					}:${timeLearningConverted.minutes}:${
						timeLearningConverted.seconds
					}</p> </div> <div class="right-slide__btn-ctn"> <button class="right-slide__to-excel-btn"> <img src="${getLink(
						"img/excelIcon.png"
					)}" alt=""/> </button> <button class="right-slide__to-pdf-btn"> <img src="${getLink(
						"img/pdfIcon.png"
					)}" alt=""/> </button> <button class="right-slide__delete-btn"> <img src="${getLink(
						"img/attendanceHistoryCloseItem.png"
					)}" alt=""/> </button> </div></div>`;

					attendanceHistoryWrapperElm.appendChild(newHistoryItem);
				}
			);
		},

		add(attendanceHistoryToAdd, addToCloud = false) {
			if (addToCloud) {
				// Upload new history to server
				const addHistoryUrl = `${HOST}/resources/attendance-history/add`;
				const addHistoryOptions = {
					method: "POST",
					body: attendanceHistoryToAdd,
				};

				tokenObj.handleCallApi(addHistoryUrl, addHistoryOptions).catch(console.error);
			} else {
				appStorageObj.attendanceHistoryStorage.add(attendanceHistoryToAdd);

				this.render();
			}
		},

		delete(attendanceHistoryIdToDelete, deleteOnCloud = false) {
			if (deleteOnCloud) {
				const deleteHistoryUrl = `${HOST}/resources/attendance-history/delete`;
				const deleteHistoryOptions = {
					method: "DELETE",
					responseType: "text",
					queryBody: {
						attendanceHistoryIdToDelete,
					},
				};

				tokenObj
					.handleCallApi(deleteHistoryUrl, deleteHistoryOptions)
					.catch(errors => console.error(errors));
			} else {
				appStorageObj.attendanceHistoryStorage.delete(attendanceHistoryIdToDelete);

				this.render();
			}
		},
	};

	taskBar = {
		initial() {
			// Taskbar left
			// Attendance button
			const taskBarLeft = $(classSelectorsObj.TASKBAR_LEFT);
			const attendanceBtnElm = document.createElement("div");

			taskBarLeft.classList.add("taskbar__left");
			attendanceBtnElm.className = "left__attendance-state";

			attendanceBtnElm.innerHTML = `<input type="checkbox" id="attendance-state" /><div class="attendance-state__btn-wrapper"><label for="attendance-state" class="btn-wrapper__btn"><p class="btn__off-state">OFF</p><div class="btn__slide"></div><p class="btn__on-state">ON</p></label></div><div class="attendance-state__attendance-message"><span class="attendance-message__off-state"><p>Chưa bật điểm danh</p></span><span class="attendance-message__on-state"><p>12A12 - 00:00:00 (42/42)</p></span></div>`;

			const attendanceStateInput = $("input#attendance-state", attendanceBtnElm);

			attendanceStateInput.addEventListener("click", e => {
				const isLogged = appStorageObj.userInfo.get().googleId;

				if (!isLogged) {
					e.preventDefault();

					return alert("Vui lòng đăng nhập trước khi sử dụng tính năng này.");
				}
			});

			attendanceStateInput.addEventListener("change", e => {
				const { checked: isTurnOn } = e.target;

				if (isTurnOn) {
					attendanceObj.turnOn();
				} else {
					attendanceObj.turnOff();
				}
			});

			taskBarLeft.appendChild(attendanceBtnElm);

			// Taskbar center
			const taskbarCenter = $(classSelectorsObj.TASKBAR_CENTER);
			const taskbarCenterContainer = $(classSelectorsObj.TASKBAR_CENTER_CONTAINER);
			const speakerBtn = document.createElement("label");

			taskbarCenter.classList.add("taskbar__center");

			speakerBtn.className = "center__speaker-btn";
			speakerBtn.innerHTML = `
				<input id="speaker-input" type="checkbox" checked />
				<i class="fas fa-volume-down"></i>
				<i class="fas fa-volume-mute"></i>
			`;

			taskbarCenterContainer.prepend(speakerBtn);

			speakerObj.initial();

			// Taskbar right
			const taskBarRight = $(classSelectorsObj.TASKBAR_RIGHT);
			const newBtn = document.createElement("div");

			newBtn.innerHTML = `<div class="right__btn"><img src="${getLink(
				"img/settingsIcon.png"
			)}" alt="" class="btn__img"/></div>`;

			taskBarRight.classList.add("taskbar__right");
			taskBarRight.appendChild(newBtn);

			newBtn.addEventListener("click", classPageObj.settingsBox.open);
		},
	};

	settingsBox = {
		settingsBoxElm: null,
		studentsSelectedIndex: [],

		initial() {
			const bodyElm = document.body;
			const settingsBox = document.createElement("div");

			this.settingsBoxElm = settingsBox;

			const navigationListHtml = `
				<ul class="navigation__list">
				<li class="list__item" data-index="0"> <i class="far fa-wrench"></i> <span class="item__label">Tính năng</span></li>
				<li class="list__item" data-index="1"> <i class="far fa-users-class"></i> <span class="item__label">Chia nhóm</span></li>
				<li class="list__item" data-index="2"> <i class="far fa-table"></i> <span class="item__label">Thống kê</span></li>
				<li class="list__item" data-index="3"> <i class="far fa-list-alt"></i> <span class="item__label">Danh sách HS</span></li>
				<li class="list__item" data-index="4"> <i class="far fa-history"></i>  <span class="item__label"> Lịch sử điểm danh </span></li>
				<li class="list__item active" data-index="5"> <i class="far fa-user-lock"></i> <span class="item__label">Tài khoản</span></li>
				<li class="list__item" data-index="6"> <i class="far fa-sliders-h"></i> <span class="item__label">Cài đặt</span></li>
				</ul>
			`;

			const tabListContentFeaturesHtml = htmlStringObj.settingsBox.tabList.feature;
			const tabListContentGroupHtml = htmlStringObj.settingsBox.tabList.group;
			const tabListContentStatisticalHtml = htmlStringObj.settingsBox.tabList.statistical;
			const tabListContentStudentListHtml = htmlStringObj.settingsBox.tabList.allClassInfo;
			const tabListContentHistoryHtml = htmlStringObj.settingsBox.tabList.history;
			const tabListContentAuthenticateHtml = htmlStringObj.settingsBox.tabList.authenticate;
			const tabListContentSettingsHtml = htmlStringObj.settingsBox.tabList.setting;

			settingsBox.className = "settings-box__wrapper";
			settingsBox.innerHTML = `
				<div class="wrapper__box">
					<div class="box__header"><span class="header__title">Tính năng</span> <img src="${getLink(
						"img/closeIcon.png"
					)}" alt="" class="header__close-btn" /></div>
					<div class="box__body">
						<div class="body__navigation">${navigationListHtml}</div>
						<div class="body__content">
							<div class="content__login-reminder">
								<div class="login-reminder__ctn">
									<header>Đăng nhập</header>
									<div>
										<p>Bắt buộc để sử dụng tiện ích!</p>
										<button>
											<img src="${getLink("img/google.png")}" alt="" />
											<span>Đăng nhập bằng Google</span>
										</button>
									</div>
								</div>
							</div>
							<ul class="content__tab-list">
								${tabListContentFeaturesHtml} ${tabListContentGroupHtml} ${tabListContentStatisticalHtml} ${tabListContentStudentListHtml} ${tabListContentHistoryHtml} ${tabListContentAuthenticateHtml} ${tabListContentSettingsHtml}
							</ul>
						</div>
					</div>
				</div>	  
			`;

			bodyElm.appendChild(settingsBox);

			classPageObj.allClassInfoView.initial();

			this.resetStyleToolbarBtnStudentList();
			this.intervalHandle();
			this.initEvent();
			this.loginNotify.initial();

			// Set event handlers for settingsBox
			{
				// FOR SETTINGS BOX
				const closeBtn = $(
					".settings-box__wrapper .wrapper__box .box__header .header__close-btn"
				);
				closeBtn.addEventListener("click", this.close);

				const indexSortWrapper = $(
					".tab-list__item.statistical .slide-3__header .index__sort",
					settingsBox
				);
				const timeLearningSortWrapper = $(
					".tab-list__item.statistical .slide-3__header .time-learning__sort",
					settingsBox
				);

				const sortWrapperClickHandle = e => {
					// UI Style
					e.preventDefault();

					let currentElm = e.target;

					while (currentElm.tagName != "LABEL") {
						currentElm = currentElm.parentNode;
					}

					const inputSort = $(`input[type="radio"]`, currentElm);
					const allSortWrapper = Array.from(
						$$(".tab-list__item.statistical .slide-3__header label")
					);

					allSortWrapper
						.filter(labelElm => {
							const inputSortInCurrentLabel = $(`input[type="radio"]`, labelElm);

							return !(inputSort === inputSortInCurrentLabel);
						})
						.forEach(labelElm => {
							labelElm.dataset.sortType = 0;
						});

					if (!inputSort.checked) {
						inputSort.checked = !inputSort.checked;
					} else {
						currentElm.dataset.sortType = currentElm.dataset.sortType == 0 ? 1 : 0;
					}
				};

				// Handle reRender to sort
				indexSortWrapper.addEventListener("click", sortWrapperClickHandle);
				timeLearningSortWrapper.addEventListener("click", sortWrapperClickHandle);

				// CREATE GROUP TAB
				const createNewGroupBtn = $("#group-tab .group__create-meeting-btn");
				createNewGroupBtn.addEventListener("click", () =>
					classPageObj.createGroupBoxView.open()
				);

				// STATISTICAL TAB SLIDE 4
				const interactiveCtn = $(
					".tab-list__item.statistical .statistical__slide-4 .slide-4__interactive-ctn"
				);
				interactiveCtn.addEventListener("click", e => {
					let target = e.target;

					while (
						target.classList.contains("info-ctn__comment")
							? false
							: target.classList.contains("slide-4__interactive-ctn")
							? false
							: true
					) {
						target = target.parentNode;
					}

					if (target.classList.contains("slide-4__interactive-ctn")) {
						return;
					}

					const cmtBoxElm = $(".cmt-box-wrapper");
					const headerNameElm = $(".box__header p:last-child", cmtBoxElm);
					const cmtListElm = $(".body__cmt-list", cmtBoxElm);
					const chatsData = JSON.parse($("p", target).textContent);
					let cmtItemsHtml = "";

					headerNameElm.textContent = target.dataset.name;
					chatsData.forEach(chat => {
						const time = chat.time;

						cmtItemsHtml += chat.contents
							.map(
								(content, index, originArr) =>
									`<li class="cmt-list__cmt ${index === 0 ? "first" : ""} ${
										index === originArr.length - 1 ? "last" : ""
									}">
										<span>${content}</span>
										<time>${time}</time>
									</li>`
							)
							.join("");
					});

					cmtListElm.innerHTML = cmtItemsHtml;
					cmtBoxElm.classList.add("show");
				});

				// FOR STUDENT LIST TAB
				this.addStudentBoxManual.initial();
				this.addStudentBoxAutomatic.initial();
				this.addStudentBoxWithExcel.initial();
				this.addStudentBoxWithLink.initial();

				// For class list information
				const addClassBtn = $(
					".tab-list__item.all-class-info .student-table__header .header__class-list .right-slide__add-class-btn",
					settingsBox
				);

				// handle add class info
				const handleAddClass = e => {
					const classInfoName = prompt(
						"Danh sách lớp sẽ được tạo bằng danh sách hiện tại được hiển thị! \n\n" +
							"Vui lòng nhập tên lớp để thêm. VD: 12A12,..."
					);

					if (classInfoName === null) return;

					if (!classInfoName) {
						const repeatInput = confirm(
							"\n\nTên lớp không thể để trống!\n\n" + "Bạn có muốn nhập lại không?"
						);

						if (repeatInput) return handleAddClass(e);
					} else {
						const allClassNameInfo = appStorageObj.classStorage.getAllClassName();

						if (allClassNameInfo.includes(classInfoName)) {
							const repeatInput = confirm(
								"\n\n\n\nTên của lớp học này đã tồn tại!\nBạn có muốn nhập lại không? "
							);

							if (repeatInput) handleAddClass(e);

							return;
						}

						// Add history to undo and redo
						classPageObj.undoAndRedoMembersList.addClass({
							classInfoName,
							studentList: [],
						});
					}
				};

				addClassBtn.addEventListener("click", handleAddClass);

				// FOR STUDENT LIST TABLE
				const studentListTableBodyElm = $(
					".settings-box__wrapper .tab-list__item.all-class-info .student-table__body"
				);

				studentListTableBodyElm.addEventListener("click", e => {
					const tableRow = (() => {
						let currentTarget = e.target;

						while (!currentTarget.className.includes("body__row")) {
							currentTarget = currentTarget.parentNode;
						}

						return currentTarget;
					})();

					const studentIndex = +tableRow.dataset.studentIndex;
					const rowAllInput = [...$$("input", tableRow)];
					const inputSelect = rowAllInput.at(-1);

					// Handle click table row
					if (e.target.tagName != "INPUT") {
						inputSelect.checked = !inputSelect.checked;

						if (inputSelect.checked) {
							this.studentsSelectedIndex.push(studentIndex);
						} else {
							for (let index = 0; index < this.studentsSelectedIndex.length; index++) {
								if (this.studentsSelectedIndex[index] === studentIndex) {
									this.studentsSelectedIndex.splice(index, 1);
									break;
								}
							}
						}

						this.resetStyleToolbarBtnStudentList();
					}
				});
				studentListTableBodyElm.addEventListener("change", e => {
					const tableRow = (() => {
						let currentTarget = e.target;

						while (!currentTarget.className.includes("body__row")) {
							currentTarget = currentTarget.parentNode;
						}

						return currentTarget;
					})();

					switch (e.target.parentNode.className) {
						case "row__index":
							handleChangeIndex.call(this);
							break;

						case "row__name":
							handleChangeNameAndMeetName.call(
								this,
								"name",
								"Bạn chưa nhập trường Họ và tên!\n\nBạn có muốn nhập lại không?"
							);
							break;

						case "row__meet-name":
							handleChangeNameAndMeetName.call(
								this,
								"googleName",
								"Bạn chưa nhập trường Tên meet!\n\nBạn có muốn nhập lại không?"
							);
							break;

						case "row__gmail":
							handleChangeGmail.call(this);
					}

					function handleChangeIndex() {
						if (settingsObj.getSettings().autoAttendance) {
							e.target.value = tableRow.dataset.studentIndex;

							return alert(
								"Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!"
							);
						}

						const oldIndex = +tableRow.dataset.studentIndex;
						const indexValue = e.target.value;
						const studentsClassInfoData = appStorageObj.classStorage.getClass().studentList;
						const studentOldArrIndex = studentsClassInfoData.findIndex(
							student => student.index === oldIndex
						);
						const studentNewArrIndex = studentsClassInfoData.findIndex(
							student => student.index === +indexValue
						);
						const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

						// Value check invalid
						function checkValue() {
							const valueArr = indexValue.split("");

							// Empty
							if (valueArr.length === 0) return false;

							// Symbol error
							const symbolError = valueArr.some(symbol => isNaN(+symbol));
							if (symbolError) return false;

							return true;
						}
						if (!checkValue.call(this)) {
							e.target.value = oldIndex;
							return;
						}

						// when index was used handle
						function indexIsUsedCheck() {
							const studentUsedIndex = studentsClassInfoData.find(
								studentInfo => studentInfo.index === +indexValue
							);

							if (studentUsedIndex?.name) {
								const replaceCofirm = confirm(
									`Số thứ tự này đã được sử dụng bởi ${studentUsedIndex.name}!\n\nBạn có muốn GHI ĐÈ lên không?`
								);

								if (replaceCofirm) {
									studentsClassInfoData[studentOldArrIndex] = {
										...studentsClassInfoData[studentOldArrIndex],
										index: +indexValue,
									};

									studentsClassInfoData.splice(studentNewArrIndex, 1);

									this.studentsSelectedIndex = this.studentsSelectedIndex.filter(
										index => index != oldIndex
									);

									// Add history to undo and redo
									classPageObj.undoAndRedoMembersList.addClass(
										currentClassInfoName,
										appStorageObj.classStorage.getAllClassInfo().map(classInfo =>
											classInfo.classInfoName === currentClassInfoName
												? {
														classInfoName: currentClassInfoName,
														studentList: studentsClassInfoData,
												  }
												: classInfo
										)
									);
								}

								return false;
							}

							return true;
						}
						if (!indexIsUsedCheck.call(this)) {
							e.target.value = oldIndex;
							return;
						}

						// Don't change handle
						if (oldIndex === indexValue) return;

						studentsClassInfoData[studentOldArrIndex] = {
							...studentsClassInfoData[studentOldArrIndex],
							index: +indexValue,
						};

						this.studentsSelectedIndex.push(indexValue);
						classPageObj.undoAndRedoMembersList.changeClass(currentClassInfoName, {
							classInfoName: currentClassInfoName,
							studentList: studentsClassInfoData,
						});
					}

					function handleChangeNameAndMeetName(checkField, errorMessage) {
						let originNameValue = appStorageObj.classStorage
							.getClass()
							.studentList.find(student => student.index === +tableRow.dataset.studentIndex);
						originNameValue =
							checkField === "name" ? originNameValue.name : originNameValue.googleName;

						if (settingsObj.getSettings().autoAttendance) {
							e.target.value = originNameValue || "error!";

							return alert(
								"Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!"
							);
						}

						const inputValue = e.target.value;
						const studentsClassInfoData = Array.from(
							appStorageObj.classStorage.getClass().studentList
						);
						const studentIndex = studentsClassInfoData.findIndex(
							student => student.index === +tableRow.dataset.studentIndex
						);

						function valueCheck() {
							if (inputValue.length === 0) {
								const repeatFillConfirm = confirm(errorMessage);

								if (repeatFillConfirm) e.target.focus();
								e.target.value = originNameValue;
								return false;
							}

							return true;
						}
						if (!valueCheck.call(this)) return;

						if (checkField === "name") {
							studentsClassInfoData[studentIndex].name = inputValue;
						} else {
							studentsClassInfoData[studentIndex].googleName = inputValue;
						}

						// Add history to undo and redo
						const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

						classPageObj.undoAndRedoMembersList.changeClass(currentClassInfoName, {
							classInfoName: currentClassInfoName,
							studentList: studentsClassInfoData,
						});
					}

					function handleChangeGmail() {
						const gmailInputValue = e.target.value;
						const classInfo = appStorageObj.classStorage.getClass();

						const { studentIndex } = tableRow.dataset;

						const { email: oldEmail } = classInfo.studentList.find(
							student => student.index == studentIndex
						);

						const emailIsUsed =
							gmailInputValue !== "" &&
							classInfo.studentList.find(student => student.email === gmailInputValue);

						if (emailIsUsed) {
							e.target.value = oldEmail;

							return alert("Email này đã được sử dụng.");
						}

						const newClassInfo = {
							...classInfo,
							studentList: classInfo.studentList.map(student => {
								const { index: studentIndex } = student;

								if (studentIndex === Number(tableRow.dataset.studentIndex)) {
									student.email = gmailInputValue;
								}

								return student;
							}),
						};

						const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

						classPageObj.undoAndRedoMembersList.changeClass(
							currentClassInfoName,
							newClassInfo
						);
					}
				});

				// FOR HISTORY ATTENDANCE INFO
				const attendanceHistoryWrapperElm = $(
					".settings-box__wrapper .tab-list__item.attendance-history .attendance-history__wrapper"
				);

				attendanceHistoryWrapperElm.addEventListener("click", e => {
					if (e.target.className === "attendance-history__wrapper") return;

					let historyAttendanceItem = e.target;
					let classNameChain = [];
					let currentNode = e.target;

					// Reset historyAttendanceItem element
					while (!historyAttendanceItem.className.includes("wrapper__item")) {
						historyAttendanceItem = historyAttendanceItem.parentNode;
					}

					while (
						!classNameChain.includes("wrapper__item") &&
						currentNode.className != "attendance-history__wrapper"
					) {
						classNameChain.push(currentNode.className);
						currentNode = currentNode.parentNode;
					}

					const attendanceId = historyAttendanceItem.dataset.attendanceId;

					const attendanceHistoryData = appStorageObj.attendanceHistoryStorage
						.getAll()
						.find(attendance => attendance.attendanceId === attendanceId);

					if (classNameChain.includes("right-slide__to-excel-btn")) {
						return attendanceHistoryObj.renderExcel(attendanceHistoryData);
					}

					if (classNameChain.includes("right-slide__to-pdf-btn")) {
						return attendanceHistoryObj.renderPdf(attendanceHistoryData);
					}

					if (classNameChain.includes("right-slide__delete-btn")) {
						const deleteConfirm = confirm(
							"Bạn có chắc chắn muốn XÓA nội dung điểm danh này không?"
						);

						if (deleteConfirm) {
							classPageObj.attendanceHistoryView.delete(attendanceId, true);
						}

						return;
					}

					attendanceHistoryObj.renderAttendancePage(attendanceHistoryData);
				});

				// Authenticate tab
				const oldRefreshToken = appStorageObj.cookieStorage.token.refreshToken.get();

				if (oldRefreshToken) {
					authenticateObj.reLoginWithGoogle(oldRefreshToken);
				}

				// FOR SETTINGS TAB
				const existPercentInputElm = $(
					".tab-list__item.settings .percent-mark__input input",
					settingsBox
				);

				existPercentInputElm.addEventListener("change", e => {
					if (!e.target.value.length) {
						const confirmInput = confirm(
							"Bạn chưa nhập dữ liệu!\n\nBạn có muốn nhập lại không?"
						);

						e.target.value = settingsObj.getSettings().timingExistPercent;

						if (confirmInput) return e.target.focus();
					}

					if (Number(e.target.value) < 1 || Number(e.target.value) > 100) {
						const confirmInput = confirm(
							"Trường này chỉ cho phép các số từ 1-100!\n\nBạn có muốn nhập lại không?"
						);
						e.target.value = settingsObj.getSettings().timingExistPercent;

						if (confirmInput) return e.target.focus();
					}

					settingsObj.setSettings({
						timingExistPercent: Number(e.target.value),
					});
				});
			}

			// Set handle navigation click
			{
				// Init translateY content tab list
				const contentTabListElm = $(".settings-box__wrapper .box__body .content__tab-list");
				const currentNavigationActiveIndex = +$(
					".settings-box__wrapper .box__body .navigation__list .list__item.active"
				).dataset.index;

				contentTabListElm.style.transform = `translateY(-${Math.trunc(
					100 * currentNavigationActiveIndex
				)}%)`;

				// Set handle event click navigation item
				const navigationItems = $$(".settings-box__wrapper .navigation__list .list__item");
				navigationItems.forEach(item => {
					item.addEventListener("click", navigationItemClickHandler);

					function navigationItemClickHandler(e) {
						const itemIndex = +item.dataset.index;
						const translateY = Math.trunc(100 * itemIndex);
						const currentActiveNavigationItem = $(".list__item.active");
						const settingsBoxTitleElm = $(".settings-box__wrapper .header__title");

						contentTabListElm.style.transform = `translateY(-${translateY}%)`;
						currentActiveNavigationItem.classList.remove("active");
						item.classList.add("active");
						settingsBoxTitleElm.textContent = $(".item__label", item).textContent;
					}
				});
			}

			// Setup status features with LocalStorage
			{
				const settings = settingsObj.getSettings();
				const autoTurnOffMediaInput = $(
					".settings-box__wrapper .tab-list__item.features .features__auto-turn-off-media .toggle-btn input"
				);
				const autoAcceptInput = $(
					".settings-box__wrapper .tab-list__item.features .features__auto-accept .toggle-btn input"
				);
				const blockAccessInvalidInput = $(
					".settings-box__wrapper .tab-list__item.features .features__authenticate .toggle-btn input"
				);
				const autoAttendanceInput = $(
					".settings-box__wrapper .tab-list__item.features .features__auto-attendance .toggle-btn input"
				);

				this.settingsBoxFeaturesResetStyle();

				autoTurnOffMediaInput.addEventListener("change", e => {
					const settings = settingsObj.getSettings();
					const newSettings = {
						...settings,
						autoTurnOffMedia: e.target.checked,
					};

					settingsObj.setSettings(newSettings);
				});

				if (settings.autoAccept) classPageObj.autoAcceptHandler.turnOn();
				autoAcceptInput.addEventListener("change", e => {
					const settings = settingsObj.getSettings();
					const newSettings = {
						...settings,
						autoAccept: e.target.checked,
					};

					settingsObj.setSettings(newSettings);

					if (e.target.checked) classPageObj.autoAcceptHandler.turnOn();
					else classPageObj.autoAcceptHandler.turnOff();
				});

				blockAccessInvalidInput.addEventListener("change", e => {
					const settings = settingsObj.getSettings();
					const newSettings = {
						...settings,
						blockAccessInvalid: e.target.checked,
					};

					settingsObj.setSettings(newSettings);
				});

				if (settings.autoAttendance) attendanceObj.turnOn();
				autoAttendanceInput.addEventListener("change", e => {
					if (e.target.checked) attendanceObj.turnOn();
					else attendanceObj.turnOff();
				});
			}
		},

		initEvent() {
			// Authenticate tab
			const loginWithGoogleBtn = $("#settings-box__authenticate-tab .ctn__sign-in-btn");
			const logoutBtn = $("#settings-box__authenticate-tab .ctn__logout-btn");

			loginWithGoogleBtn.addEventListener("click", authenticateObj.loginWithGoogle);

			logoutBtn.addEventListener("click", authenticateObj.logout);

			// Statistical tab
			// Slide 3
			const studentListElm = $(
				".settings-box__wrapper .tab-list__item.statistical .statistical__slide-3 .slide-3__student-wrapper"
			);

			studentListElm.addEventListener("change", ({ target }) => {
				if (target.getAttribute("js-elm") === "not-exist-status__select") {
					const studentIndex = +target.dataset.index;

					attendanceObj.attendanceData.some((studentInfo, index, arrayOrigin) => {
						if (studentInfo.index === studentIndex) {
							arrayOrigin[index].acceptNotExist =
								target.value == 1
									? false
									: target.value == 2
									? true
									: studentInfo.acceptNotExist;

							return true;
						}
					});
				}
			});

			// Student list tab
			const selectAllBtn = $(".settings-box__wrapper .table .left-slide__select-all");
			const unSelectAllBtn = $(".settings-box__wrapper .table .left-slide__unselect-all");
			const undoBtn = $(".settings-box__wrapper .table .right-slide__undo");
			const redoBtn = $(".settings-box__wrapper .table .right-slide__redo");
			const deleteBtn = $(".settings-box__wrapper .table .right-slide__delete");

			selectAllBtn.addEventListener("click", e => {
				const inputsNotSelect = [
					...$$(".body__row .row__select input:not(:checked)", this.settingsBoxElm),
				];

				inputsNotSelect.forEach(selectInput => {
					selectInput.checked = true;
				});

				this.studentsSelectedIndex = [
					...appStorageObj.classStorage.getClass().studentList.map(student => student.index),
				];

				this.resetStyleToolbarBtnStudentList();
			});

			unSelectAllBtn.addEventListener("click", e => {
				const inputSelected = [
					...$$(".body__row .row__select input:checked", this.settingsBoxElm),
				];

				inputSelected.forEach(selectInput => {
					selectInput.checked = false;
				});

				this.studentsSelectedIndex = [];
				this.resetStyleToolbarBtnStudentList();
			});

			undoBtn.addEventListener("click", () => {
				if (settingsObj.getSettings().autoAttendance)
					return alert("Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!");

				classPageObj.undoAndRedoMembersList.undo();
			});

			redoBtn.addEventListener("click", () => {
				if (settingsObj.getSettings().autoAttendance)
					return alert("Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!");

				classPageObj.undoAndRedoMembersList.redo();
			});

			deleteBtn.addEventListener("click", e => {
				if (settingsObj.getSettings().autoAttendance)
					return alert("Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!");

				let newMembers = [];

				const classInfo = appStorageObj.classStorage.getClass();

				const allInputChecked = [
					...$$(".settings-box__wrapper .body__row .row__select input:checked"),
				];

				const studentsIndexDelete = allInputChecked.map(
					input => +input.parentNode.parentNode.parentNode.dataset.studentIndex
				);

				if (allInputChecked.length === 0) return;

				newMembers = classInfo.studentList.filter(
					member => !studentsIndexDelete.includes(member.index)
				);

				// Add history to undo and redo
				const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

				classPageObj.undoAndRedoMembersList.changeClass(currentClassInfoName, {
					classInfoName: currentClassInfoName,
					studentList: newMembers,
				});
			});
		},

		intervalHandle() {
			this.handleIntervalFunc = setInterval(function () {
				if ($(".settings-box__wrapper.show") && $(`.list__item.active[data-index="2"]`)) {
					reRenderNotExistList();
				}

				function reRenderNotExistList() {
					const membersList = attendanceObj.attendanceData;
					const membersExistMeetName = [...$$(classSelectorsObj.MEMBER_NAME_LIST)].map(
						elm => elm.textContent
					);
					const studentNotExistInfo = membersList.filter(
						member => !membersExistMeetName.includes(member.googleName)
					);

					// Render students not exist list
					const notExistListContainer = $(".not-exist-student__box");
					const notExistListDisplayed = [...$$(".not-exist-student__box > *")];

					while (notExistListDisplayed.length > studentNotExistInfo.length) {
						notExistListDisplayed.pop().remove();
					}

					studentNotExistInfo.forEach((studentInfo, index) => {
						const attendanceSettingsState = settingsObj.getSettings().autoAttendance;

						if (index > notExistListDisplayed.length - 1) {
							const boxItem = document.createElement("div");

							boxItem.className = "box__item";
							boxItem.innerHTML = `<span class="item__index"> <p>${
								studentInfo.index
							}</p></span><span class="item__name"> <p>${
								studentInfo.name
							}</p> </span> <span class="item__online-state"><p>${
								attendanceSettingsState ? (studentInfo.acceptNotExist ? "C.P" : "K.P") : ""
							}</p></span>`;

							notExistListContainer.appendChild(boxItem);
						} else {
							const currentStudentIndexElm = ($(
								".item__index p",
								notExistListDisplayed[index]
							).textContent = studentInfo.index);

							const currentStudentNameElm = ($(
								".item__name p",
								notExistListDisplayed[index]
							).textContent = studentInfo.name);

							const currentStudentOnlineStateElm = ($(
								".item__online-state p",
								notExistListDisplayed[index]
							).textContent = attendanceSettingsState
								? studentInfo.acceptNotExist
									? "C.P"
									: "K.P"
								: "");
						}
					});
				}
			}, 1000);
		},

		settingsBoxFeaturesResetStyle() {
			const settings = settingsObj.getSettings();
			const autoTurnOffMediaInput = $(
				".settings-box__wrapper .tab-list__item.features .features__auto-turn-off-media .toggle-btn input"
			);
			const autoAcceptInput = $(
				".settings-box__wrapper .tab-list__item.features .features__auto-accept .toggle-btn input"
			);
			const blockAccessInvalidInput = $(
				".settings-box__wrapper .tab-list__item.features .features__authenticate .toggle-btn input"
			);
			const autoAttendanceInput = $(
				".settings-box__wrapper .tab-list__item.features .features__auto-attendance .toggle-btn input"
			);

			if (settings.autoTurnOffMedia) autoTurnOffMediaInput.checked = true;
			else autoTurnOffMediaInput.checked = false;

			if (settings.autoAccept) autoAcceptInput.checked = true;
			else autoAcceptInput.checked = false;

			if (settings.blockAccessInvalid) blockAccessInvalidInput.checked = true;
			else blockAccessInvalidInput.checked = false;

			if (settings.autoAttendance) autoAttendanceInput.checked = true;
			else autoAttendanceInput.checked = false;
		},

		resetStyleToolbarBtnStudentList() {
			const selectedCountElm = $(".settings-box__wrapper .table .left-slide__selected-count");
			const deleteBtn = $(".settings-box__wrapper .table .right-slide__delete");
			const selectAllBtn = $(".settings-box__wrapper .table .left-slide__select-all");
			const unSelectAllBtn = $(".settings-box__wrapper .table .left-slide__unselect-all");
			const allInput = [...$$(".settings-box__wrapper .body__row .row__select input")];
			const allInputChecked = [
				...$$(".settings-box__wrapper .body__row .row__select input:checked"),
			];

			// Select all button
			if (allInputChecked.length < allInput.length) {
				selectAllBtn.classList.remove("disabled");
			} else {
				selectAllBtn.classList.add("disabled");
			}

			// Unselect all button
			if (allInputChecked.length > 0) {
				unSelectAllBtn.classList.remove("disabled");
			} else {
				unSelectAllBtn.classList.add("disabled");
			}

			// Set selected count
			selectedCountElm.textContent = `đã chọn ${allInputChecked.length}`;

			// Delete student selected button
			if (allInput.length === 0 || allInputChecked.length === 0) {
				deleteBtn.classList.add("disabled");
			} else {
				deleteBtn.classList.remove("disabled");
			}
		},

		settingsBoxPressEventHandle(e) {
			switch (e.keyCode) {
				case 27:
					classPageObj.settingsBox.close();
					break;
			}
		},

		open() {
			const settingsBoxWrapperElm = $(".settings-box__wrapper");
			settingsBoxWrapperElm.classList.add("show");

			document.addEventListener("keydown", classPageObj.settingsBox.settingsBoxPressEventHandle);
		},

		close() {
			const settingsBoxWrapperElm = $(".settings-box__wrapper");
			settingsBoxWrapperElm.classList.remove("show");

			document.removeEventListener(
				"keydown",
				classPageObj.settingsBox.settingsBoxPressEventHandle
			);
		},

		addStudentBoxManual: {
			existState: false,

			getAddStudentBoxElm: () =>
				$(".settings-box__wrapper .tab-list__item.all-class-info .add-student"),

			initial() {
				const manualInputMethod = $(
					".settings-box__wrapper .tab-list__item.all-class-info .input-methods__manual"
				);
				manualInputMethod.addEventListener("click", e => {
					if (!this.existState) {
						this.open();
					} else {
						this.close();
					}
				});

				const addStudentBox = this.getAddStudentBoxElm();
				const indexInput = $(".index-ctn__input", addStudentBox);
				const nameInput = $(".name-ctn__input", addStudentBox);
				const googleNameInput = $(".meet-name-ctn__input", addStudentBox);
				const gmailInput = $(".gmail-ctn__input", addStudentBox);
				const submitBtn = $(".submit__submit-btn", addStudentBox);
				const errorMessageList = ["", "", ""];

				indexInput.addEventListener("focusout", handleCheckIndexValue);
				nameInput.addEventListener("focusout", handleCheckNameValue);
				googleNameInput.addEventListener("focusout", handleCheckMeetNameValue);

				submitBtn.addEventListener("click", e => {
					const { autoAttendance: autoAttendanceSettingState } = settingsObj.getSettings();

					if (autoAttendanceSettingState) {
						return alert("Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!");
					}

					const classInfo = appStorageObj.classStorage.getClass();

					const indexInputValue = Number(indexInput.value);
					const nameInputValue = nameInput.value;
					const googleNameInputValue = googleNameInput.value;
					const emailInputValue = gmailInput.value;

					const emailIsUsed =
						emailInputValue !== "" &&
						classInfo.studentList.find(student => student.email === gmailInput.value);

					if (emailIsUsed) {
						gmailInput.focus();

						return alert("Email này đã được sử dụng.");
					}

					const indexCheckResult = handleCheckIndexValue();
					const nameCheckResult = handleCheckNameValue();
					const googleNameCheckResult = handleCheckMeetNameValue();

					if (indexCheckResult && nameCheckResult && googleNameCheckResult) {
						const newClassInfo = {
							...classInfo,
							studentList: [
								...classInfo.studentList,
								{
									id: uuidv4(),
									index: indexInputValue,
									name: nameInputValue,
									googleName: googleNameInputValue,
									email: generalMethods.validateEmail(emailInputValue)
										? emailInputValue
										: (() => {
												alert(
													"\nEmail không hợp lệ.\nHệ thống sẽ không ghi nhận thông tin đó, vui lòng nhập lại."
												);
												return "";
										  })(),
								},
							],
						};

						classPageObj.undoAndRedoMembersList.changeClass(
							classInfo.classInfoName,
							newClassInfo
						);

						indexInput.value = "";
						nameInput.value = "";
						googleNameInput.value = "";
						gmailInput.value = "";
						indexInput.focus();
					}
				});

				function handleCheckIndexValue(e) {
					const membersIndex = appStorageObj.classStorage
						.getClass(appStorageObj.classStorage.getCurrentClassInfoName())
						.studentList.map(member => member.index);
					const indexValue = indexInput.value;
					const illegalSymbolArr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
					const hasInvalidSymbol = indexValue
						.split("")
						.some(symbol => !illegalSymbolArr.includes(symbol));

					indexInput.classList.add("fail");

					if (!indexValue) {
						errorMessageList[0] = "Chưa nhập Số thứ tự";
						renderErrorList();
						return false;
					}
					if (hasInvalidSymbol) {
						errorMessageList[0] = 'Trường "STT" chỉ được phép chứa số!';
						renderErrorList();
						return false;
					}
					if (membersIndex.includes(Number(indexValue))) {
						errorMessageList[0] = "STT này đã có người sử dụng!";
						renderErrorList();
						return false;
					}

					indexInput.classList.remove("fail");
					errorMessageList[0] = "";
					renderErrorList();
					return true;
				}

				function handleCheckNameValue(e) {
					const nameValue = nameInput.value;

					if (!nameValue) {
						nameInput.classList.add("fail");
						errorMessageList[1] = "Chưa nhập Họ và tên";
						renderErrorList();
						return false;
					}

					nameInput.classList.remove("fail");
					errorMessageList[1] = "";
					renderErrorList();
					return true;
				}

				function handleCheckMeetNameValue(e) {
					const googleNameValue = googleNameInput.value;

					if (!googleNameValue) {
						googleNameInput.classList.add("fail");
						errorMessageList[2] = "Chưa nhập Tên meet";
						renderErrorList();
						return false;
					}

					googleNameInput.classList.remove("fail");
					errorMessageList[2] = "";
					renderErrorList();
					return true;
				}

				function renderErrorList() {
					const messageBoxElm = $(".input__message-box", addStudentBox);
					const messageBoxContentElm = $("p", messageBoxElm);
					const errorListIsEmpty = errorMessageList.every(errMessage => !errMessage.length);

					if (errorListIsEmpty) {
						messageBoxContentElm.textContent = "";
						messageBoxElm.classList.remove("show");
					} else {
						const messageHtmls = errorMessageList
							.map(errMessage => (errMessage ? `${errMessage} || ` : ""))
							.join("")
							.slice(0, -3);

						messageBoxContentElm.innerHTML = messageHtmls;
						messageBoxElm.classList.add("show");
					}
				}
			},

			open() {
				const studentBox = this.getAddStudentBoxElm();

				studentBox.style.display = "flex";
				studentBox.style.animation = "showAddStudentBox ease 300ms forwards";

				this.existState = true;

				// Close reaming box (add with excel box v.v)
				classPageObj.settingsBox.addStudentBoxWithExcel.close();
				classPageObj.settingsBox.addStudentBoxWithLink.close();
			},

			async close() {
				const studentBox = this.getAddStudentBoxElm();

				studentBox.style.animation = "hideAddStudentBox ease 300ms forwards";
				await generalMethods.sleep(300);
				studentBox.style.display = "none";
				this.existState = false;
			},
		},

		addStudentBoxAutomatic: {
			initial() {
				const automaticInputMethod = $(
					".settings-box__wrapper .tab-list__item.all-class-info .input-methods__automatic"
				);

				automaticInputMethod.addEventListener("click", e => {
					const { autoAttendance: autoAttendanceSettingState } = settingsObj.getSettings();

					if (autoAttendanceSettingState) {
						return alert("Vui lòng tắt điểm danh tự động trước khi sửa thông tin học sinh!");
					}

					let nameAllExistMember = [
						...new Set(
							[...$$(classSelectorsObj.MEMBER_NAME_LIST)].map(elm => elm.textContent)
						),
					];

					let infoAllExistMembersHasIndex = nameAllExistMember
						.filter(memberName => parseInt(memberName))
						.map(memberName => ({
							id: uuidv4(),
							index: parseInt(memberName),
							name: memberName?.split(".")[1]?.split("-")[0].trim() || memberName,
							googleName: memberName,
							email: "",
						}));

					const indexAllExistMembersHasIndex = infoAllExistMembersHasIndex.map(
						member => member.index
					);

					const infoAllExistMembersNotHasIndex = nameAllExistMember
						.filter(memberName => !parseInt(memberName))
						.map(memberName => ({
							id: uuidv4(),
							name: memberName?.split(".")[1]?.split("-")[0].trim() || memberName,
							googleName: memberName,
							email: "",
						}));

					// move duplicate index member to "infoAllExistMembersNotHasIndex"
					infoAllExistMembersHasIndex = infoAllExistMembersHasIndex.filter((member, index) => {
						if (indexAllExistMembersHasIndex.indexOf(member.index) === index) {
							return true;
						} else {
							infoAllExistMembersNotHasIndex.push(member);
							return false;
						}
					});

					// Merge 2 list
					// ("allExistMembersHasIndexInfo", "infoAllExistMembersNotHasIndex")
					// to render
					const indexListMemberHasIndex = infoAllExistMembersHasIndex.map(
						member => member.index
					);

					let maxIndex = Math.max(...indexListMemberHasIndex);

					maxIndex = maxIndex === -Infinity ? 0 : maxIndex;

					const memberList = [...infoAllExistMembersHasIndex];

					while (infoAllExistMembersNotHasIndex.length > 0) {
						const currentNotHasIndexMember = infoAllExistMembersNotHasIndex.shift();
						memberList.push({
							...currentNotHasIndexMember,
							index: maxIndex + 1,
						});
						maxIndex++;
					}

					// Add history to undo and redo
					const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

					classPageObj.undoAndRedoMembersList.changeClass(currentClassInfoName, {
						classInfoName: currentClassInfoName,
						studentList: memberList,
					});
				});
			},
		},

		addStudentBoxWithExcel: {
			initial() {
				// Set event button to download excel form
				const excelFormDownloadBtn = $(
					".settings-box__wrapper .tab-list__item.all-class-info .import-from-excel .import-from-excel__step-1 .step-1__content button"
				);

				excelFormDownloadBtn.addEventListener("click", e => {
					const downloadUrl = `${HOST}/download/excel-form`;

					fetch(downloadUrl)
						.then(res => res.blob())
						.then(data => {
							const aTag = document.createElement("a");
							aTag.href = window.URL.createObjectURL(data);
							aTag.download = "CME - Mẫu điền thông tin.xlsx";
							aTag.click();
							window.URL.revokeObjectURL(aTag.href);
						});
				});

				// Set event input methods icon click
				const importFormExcelInput = $("#student-list-excel-file-input");
				const importFromExcelInputState = $("#import-from-excel-state");
				const importFromExcelIcon = $(
					".settings-box__wrapper .tab-list__item.all-class-info .input-methods .input-methods__from-excel"
				);
				const importFormExcelSubmitBtn = $("#student-list-excel-file-submit-btn");

				importFromExcelIcon.addEventListener("click", e => {
					if (importFromExcelInputState.checked) {
						this.close();
					} else {
						this.open();
					}
				});

				importFormExcelInput.addEventListener("change", e => {
					const inputFile = e.target.files[0];

					if (!inputFile) {
						importFormExcelSubmitBtn.disabled = true;

						return;
					}

					const fileFormat = inputFile.name.split(".").pop();
					const excelFileFormats = ["xlsx", "xlsm", "xlsb", "xltx", "xltm", "xls", "xlt"];

					if (!excelFileFormats.includes(fileFormat)) {
						e.target.value = "";
						importFormExcelSubmitBtn.disabled = true;
						alert("Vui lòng chỉ chọn file Excel!");

						return;
					}

					importFormExcelSubmitBtn.disabled = false;
				});

				importFormExcelSubmitBtn.addEventListener("click", e => {
					const inputFile = importFormExcelInput.files[0];

					const { autoAttendance: autoAttendanceSettingState } = settingsObj.getSettings();

					if (autoAttendanceSettingState) {
						return alert("Vui lòng tắt điểm danh tự động trước khi nhập thông tin mới.");
					}

					// Update date and render handle
					readXlsxFile(inputFile).then(excelData => {
						const classNameInfo = excelData.shift()[1];
						excelData.shift();

						let studentsInfoFromExcel = excelData.map(rowData => ({
							id: uuidv4(),
							index: rowData[0] || 0,
							name: rowData[1] || "",
							group: rowData[2] || 0,
							googleName: rowData[3] || "",
							email: rowData[4] || "",
						}));

						// Sort mebersInfoFromExcel by index value
						studentsInfoFromExcel.sortObject("index", 0);

						// Delete invalid members info
						studentsInfoFromExcel = studentsInfoFromExcel.filter(
							memberInfo => memberInfo.googleName
						);

						// Optimize members info
						studentsInfoFromExcel = studentsInfoFromExcel.map(memberInfo => ({
							...memberInfo,
							name: memberInfo.name ? memberInfo.name : memberInfo.googleName,
						}));

						// Get the valid index members
						let minIndex = 1;

						studentsInfoFromExcel = studentsInfoFromExcel.map(studentInfo => {
							if (studentInfo.index === minIndex) {
								minIndex++;

								return studentInfo;
							}

							if (studentInfo.index != minIndex) {
								studentInfo.index = null;

								return studentInfo;
							}
						});

						// Handle the invalid index member
						let studentsInfoInvalid = [];
						studentsInfoFromExcel = studentsInfoFromExcel.filter(studentInfo => {
							if (studentInfo.index === null) {
								studentsInfoInvalid.push(studentInfo);
								return false;
							}

							if (studentInfo.index !== null) {
								return true;
							}
						});

						studentsInfoInvalid = studentsInfoInvalid.map(studentInfo => {
							const automaticIndex = parseInt(studentInfo.name.split(".")[0]) || null;

							if (typeof automaticIndex === "number" && automaticIndex > 0) {
								const indexWasExist = studentsInfoFromExcel.some(
									student => student.index === automaticIndex
								);

								if (indexWasExist) {
									studentInfo.index = minIndex;
									minIndex++;
								} else {
									studentInfo.index = automaticIndex;
								}
							} else {
								studentInfo.index = minIndex;
								minIndex++;
							}

							return studentInfo;
						});

						// Merge invalid and valid member array
						studentsInfoFromExcel = [...studentsInfoFromExcel, ...studentsInfoInvalid];
						studentsInfoFromExcel.sortObject("index", 0);

						const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

						classPageObj.undoAndRedoMembersList.changeClass(currentClassInfoName, {
							classInfoName: currentClassInfoName,
							studentList: studentsInfoFromExcel,
						});
					});
				});
			},

			open() {
				const importFromExcelInputState = $("#import-from-excel-state");

				importFromExcelInputState.checked = true;

				classPageObj.settingsBox.addStudentBoxManual.close();
				classPageObj.settingsBox.addStudentBoxWithLink.close();
			},

			close() {
				const importFromExcelInputState = $("#import-from-excel-state");

				importFromExcelInputState.checked = false;
			},
		},

		addStudentBoxWithLink: {
			initial() {
				const inputVisibleStateBox = $("#import-with-online-form-state");

				const toggleBoxBtn = $("#toggle-online-form-box-btn");

				toggleBoxBtn.addEventListener("click", e => {
					if (!inputVisibleStateBox.checked) {
						this.open();
					} else {
						this.close();
					}
				});

				const formElm = $("#add-student-with-form");

				formElm.addEventListener("click", ({ target }) => {
					while (true) {
						switch (true) {
							case formElm === target:
								return;

							// Show form password button
							case target.getAttribute("js-elm") === "show-password-form-url-btn": {
								const inputPasswordToShow = $("input", target.parentNode);

								inputPasswordToShow.type = "text";

								return;
							}

							// Hide form password button
							case target.getAttribute("js-elm") === "hide-password-form-url-btn": {
								const inputPasswordToHide = $("input", target.parentNode);

								inputPasswordToHide.type = "password";

								return;
							}

							// Copy form password button
							case target.getAttribute("js-elm") === "copy-form-password-btn": {
								const copyPasswordIcon = target;

								const inputPasswordToCopy = $("input", copyPasswordIcon.parentNode);
								const passwordToCopy = inputPasswordToCopy.value;

								navigator.clipboard.writeText(passwordToCopy);

								// Set style
								const copyPasswordStyleBeforeChange = copyPasswordIcon.style;

								copyPasswordIcon.classList.remove("fad");
								copyPasswordIcon.classList.add("fas");

								Object.assign(copyPasswordIcon.style, {
									color: "#0055bd",
								});

								setTimeout(() => {
									copyPasswordIcon.classList.remove("fas");
									copyPasswordIcon.classList.add("fad");

									copyPasswordIcon.style = copyPasswordStyleBeforeChange;
								}, 3000);

								return;
							}

							// Copy form url button
							case target.getAttribute("js-elm") === "copy-form-url-btn": {
								const copyTextButton = target;

								const copyText = target.getAttribute("text-to-copy");

								navigator.clipboard.writeText(copyText);

								copyTextButton.classList.remove("far");
								copyTextButton.classList.add("fas");

								setTimeout(() => {
									copyTextButton.classList.remove("fas");
									copyTextButton.classList.add("far");
								}, 3000);

								return;
							}

							default:
								target = target.parentNode;
						}
					}
				});

				formElm.addEventListener("change", ({ target }) => {
					switch (true) {
						// Handle select class to render
						case target.getAttribute("js-elm") === "form-input-class": {
							const { value: classInfoNameToRender } = target;

							this.resetView(classInfoNameToRender);

							return;
						}

						case target.getAttribute("js-elm") === "form-accept-new-request-input": {
							const { classInfoId } = target.dataset;
							const classInfo = appStorageObj.classStorage.getClassById(classInfoId);
							const { classInfoName } = classInfo;

							const isAcceptNewRequest = target.checked;

							const updateNewStateOnlineFormUrl = `${HOST}/resources/class-info/update`;
							const updateNewStateOnlineFormOptions = {
								method: "PATCH",
								body: {
									classInfoNameToUpdate: classInfoName,
									newClassInfo: {
										acceptNewRequest: isAcceptNewRequest,
									},
								},
							};

							tokenObj
								.handleCallApi(updateNewStateOnlineFormUrl, updateNewStateOnlineFormOptions)
								.catch(errors => {
									target.checked = !isAcceptNewRequest;
									console.error(errors);
								});

							// Update info in storage
							appStorageObj.classStorage.setClass(classInfoName, {
								...classInfo,
								acceptNewRequest: isAcceptNewRequest,
							});

							// Class is updating by online form alert
							const updatingAlertElm = $(`[js-elm="class-info-is-updating-by-online-form"]`);

							if (isAcceptNewRequest) {
								updatingAlertElm.classList.add("show");
							} else {
								updatingAlertElm.classList.remove("show");
							}

							return;
						}

						case target.getAttribute("js-elm") === "online-form-password-input": {
							// Get online form wrapper element -> get classInfoId
							let onlineFormWraperElm = target;

							do {
								onlineFormWraperElm = onlineFormWraperElm.parentNode;
							} while (onlineFormWraperElm.getAttribute("js-elm") !== "online-form-wrapper");

							const { classInfoId } = onlineFormWraperElm.dataset;

							appStorageObj.classStorage.getClassById(classInfoId);

							const { onlineFormPassword: oldPassword } =
								appStorageObj.classStorage.getClassById(classInfoId);

							const newPassword = target.value;

							const changeOnlineFormPasswordUrl = `${HOST}/resources/class-info/change-online-form-password`;
							const changeOnlineFormPasswordOptions = {
								method: "POST",
								body: {
									oldPassword,
									newPassword,
								},
							};

							tokenObj
								.handleCallApi(changeOnlineFormPasswordUrl, changeOnlineFormPasswordOptions)
								.catch(errors => {
									console.error(errors);

									// Reset password to old password
									target.value = oldPassword;
								});

							return;
						}
					}
				});
			},

			resetView(classInfoNameToRender) {
				// Init parameters
				if (!classInfoNameToRender) {
					const inputClassSelected = $('[js-elm="form-input-class"]:checked');

					const currentClassInfoName = appStorageObj.classStorage.getCurrentClassInfoName();

					if (inputClassSelected) {
						const classInfoNameIsExist = appStorageObj.classStorage.getClass(
							inputClassSelected.value
						);

						const classInfoNameSelectedInOnlineForm = inputClassSelected.value;

						classInfoNameToRender =
							(classInfoNameIsExist && classInfoNameSelectedInOnlineForm) ||
							currentClassInfoName;
					} else {
						classInfoNameToRender = currentClassInfoName;
					}
				}

				const classInfoToRender = appStorageObj.classStorage.getClass(classInfoNameToRender);
				const allClassInfoName = appStorageObj.classStorage.getAllClassName();

				const { _id: classInfoId } = classInfoToRender;

				const formElm = $('[js-elm="online-form-wrapper"]');
				formElm.dataset.classInfoId = classInfoId;

				// Select classInfoName to render view
				const formClassDropListElm = $(".class-to-add-information > .drop-list", formElm);
				const formClassElm = $(".current > p", formClassDropListElm);
				const formListElm = $(".list", formClassDropListElm);

				formClassElm.textContent = classInfoNameToRender;

				// Clear old child
				while (formListElm.lastChild) {
					formListElm.removeChild(formListElm.lastChild);
				}

				// Add new child
				allClassInfoName.forEach(classInfoName => {
					const newClassItemSelect = document.createElement("li");

					newClassItemSelect.className = "item";
					newClassItemSelect.innerHTML = `
						<label>
							<input js-elm="form-input-class" type="radio" value="${classInfoName}" ${
						classInfoName === classInfoNameToRender ? "checked" : ""
					} name="class-to-receive-information" />
							<p>${classInfoName}</p>
							<i class="far fa-check"></i>
						</label>
					`;
					formListElm.appendChild(newClassItemSelect);
				});

				// Render view form password
				const { onlineFormPassword: formPassword } = classInfoToRender;

				const formPasswordInput = $(
					".password-to-edit > .password-handle-container > input",
					formElm
				);

				formPasswordInput.value = formPassword;

				// Render view form accept new request button
				const { acceptNewRequest, _id: classInfoToRenderId } = classInfoToRender;

				const acceptNewRequestInputState = $(".accept-new-request input");

				acceptNewRequestInputState.dataset.classInfoId = classInfoToRenderId;
				acceptNewRequestInputState.checked = acceptNewRequest;

				// Render view form url
				const { onlineFormUrl: formUrl } = classInfoToRender;

				const formUrlWrapper = $(".online-form-url-wrapper");
				const formUrlElm = $("a.online-form-url", formUrlWrapper);
				const formUrlTitleElm = $("p", formUrlElm);
				const formUrlCopyBtn = $("i.copy-btn", formUrlWrapper);

				formUrlElm.href = HOST + formUrl;
				formUrlTitleElm.textContent = formUrl;
				formUrlCopyBtn.setAttribute("text-to-copy", HOST + formUrl);

				// Class is updating by online form alert
				const updatingAlertElm = $(`[js-elm="class-info-is-updating-by-online-form"]`);

				if (acceptNewRequest) {
					updatingAlertElm.classList.add("show");
				} else {
					updatingAlertElm.classList.remove("show");
				}
			},

			open() {
				const inputVisibleStateBox = $("#import-with-online-form-state");

				this.resetView();

				inputVisibleStateBox.checked = true;

				classPageObj.settingsBox.addStudentBoxManual.close();
				classPageObj.settingsBox.addStudentBoxWithExcel.close();
			},

			close() {
				const inputVisibleStateBox = $("#import-with-online-form-state");

				inputVisibleStateBox.checked = false;
			},
		},

		loginNotify: {
			initial() {
				const background = $(
					".settings-box__wrapper .box__body .body__content .content__login-reminder"
				);
				const loginWithGoogleBtn = $(
					".settings-box__wrapper .box__body .body__content .content__login-reminder button"
				);

				background.addEventListener("click", this.hide);
				loginWithGoogleBtn.addEventListener("click", authenticateObj.loginWithGoogle);
			},

			show() {
				const settingsBoxBodyContent = $(".settings-box__wrapper .box__body .body__content");

				settingsBoxBodyContent.classList.add("logged-in");
			},

			hide() {
				const settingsBoxBodyContent = $(".settings-box__wrapper .box__body .body__content");

				settingsBoxBodyContent.classList.remove("logged-in");
			},
		},
	};

	autoAcceptHandler = {
		turnOn() {
			console.log(1);
			this.interval = setInterval(this.handleAccept.bind(this), 1000);
		},

		turnOff() {
			const settings = settingsObj.getSettings();
			const newSettings = {
				...settings,
				autoAccept: false,
			};

			settingsObj.setSettings(newSettings);
		},

		handleAccept() {
			const admitBox = $(classSelectorsObj.ADMIT_BOX);
			const settings = settingsObj.getSettings();

			// Check has enabled
			if (!settings.autoAccept) return clearInterval(this.interval);
			if (!admitBox) return;

			// Direction to single or multiple accept
			if (settings.blockAccessInvalid) {
				this.blockAccessInvalid();
			} else {
				this.noBlockAccessInvalid();
			}
		},

		noBlockAccessInvalid() {
			const acceptAdmitBtn = [...$$(classSelectorsObj.ACCEPT_AND_DENY_JOIN_REQUEST_BTN)].pop();

			if (acceptAdmitBtn) acceptAdmitBtn.click();
		},

		blockAccessInvalid() {
			const singleTitle = $(classSelectorsObj.ADMIT_BOX_SINGLE_TITLE);
			const googleNames = appStorageObj.classStorage
				.getClass()
				.studentList.map(elm => elm.googleName);

			if (singleTitle) {
				// single accept handle
				const admitUsername = $(
					classSelectorsObj.ADMIT_BOX_USERNAME_IN_SINGLE_MODE
				).textContent;

				const acceptBtn = $(classSelectorsObj.ADMIT_BOX_SINGLE_ACCEPT);

				const denyBtn = $(classSelectorsObj.ADMIT_BOX_SINGLE_DENY);

				if (googleNames.includes(admitUsername)) {
					acceptBtn.click();

					console.log("Single Accept " + admitUsername);
				} else {
					denyBtn.click();

					console.log("Single Deny " + admitUsername);
				}
			} else {
				//  ---- multiple accept handle ----
				// Show all admit

				(async function showAllAdmitRequest() {
					const firstRequest = $(classSelectorsObj.ADMIT_BOX_ADMIT_REQUEST_MULTIPLE);

					if (!firstRequest) {
						const showAllAdmitRequestBtn = $(classSelectorsObj.ADMIT_BOX_SINGLE_ACCEPT);

						showAllAdmitRequestBtn?.click();

						await generalMethods.sleep(50);
						showAllAdmitRequest();
					}
				})();

				// Handle accept
				(async function handleAccept() {
					let isTimeout = false;

					// Timeout is true when over 800ms
					setTimeout(() => {
						isTimeout = true;
					}, 800);

					const interval = setInterval(async () => {
						const firstAdmitRequest = $(classSelectorsObj.ADMIT_BOX_ADMIT_REQUEST_MULTIPLE);

						console.log(firstAdmitRequest);

						if (!firstAdmitRequest || isTimeout) return clearInterval(interval);

						const admitUsername = $(
							classSelectorsObj.ADMIT_BOX_USERNAME_REQUEST_MULTIPLE,
							firstAdmitRequest
						).textContent;

						const acceptAdmitBtn = $(
							classSelectorsObj.ADMIT_BOX_ACCEPT_REQUEST_BTN_MULTIPLE,
							firstAdmitRequest
						);
						const denyAdmitBtn = $(
							classSelectorsObj.ADMIT_BOX_DENY_REQUEST_BTN_MULTIPLE,
							firstAdmitRequest
						);

						if (googleNames.includes(admitUsername)) {
							console.log("Accept " + admitUsername);

							acceptAdmitBtn.click();
						} else {
							console.log("Deny " + admitUsername);

							denyAdmitBtn.click();
						}
					}, 210);
				})();
			}
		},
	};

	undoAndRedoMembersList = {
		history: [],
		historyMaxLength: 30,
		currentPointerIndex: null,

		initial() {
			this.resetStyleBtns();
		},

		addClass(classInfoToAdd, addInCloud = true) {
			this.handlePushNewHistory({
				classInfo: classInfoToAdd,
				classInfoAction: "add",
				classInfoNameToAction: classInfoToAdd.classInfoName,
				classInfoBeforeAction: null,
				handleInCloud: addInCloud,
			});
		},

		changeClass(
			classInfoNameToChange,
			classInfo,
			oldClassInfo = appStorageObj.classStorage.getClass(classInfoNameToChange),
			changeInCloud = true
		) {
			this.handlePushNewHistory({
				classInfo: classInfo,
				classInfoAction: "change",
				classInfoNameToAction: classInfoNameToChange,
				classInfoBeforeAction: oldClassInfo,
				handleInCloud: changeInCloud,
			});
		},

		deleteClass(
			classInfoNameToDelete,
			oldClassInfo = appStorageObj.classStorage.getClass(classInfoNameToDelete),
			deleteInCloud = true
		) {
			this.handlePushNewHistory({
				classInfo: null,
				classInfoAction: "delete",
				classInfoNameToAction: classInfoNameToDelete,
				classInfoBeforeAction: oldClassInfo,
				handleInCloud: deleteInCloud,
			});
		},

		undo() {
			if (this.currentPointerIndex === 0) return;
			this.currentPointerIndex--;
			this.renderView(true);
		},

		redo() {
			if (this.currentPointerIndex === this.history.length - 1) return;
			this.currentPointerIndex++;
			this.renderView();
		},

		renderView(isUndo = false) {
			const currentHistory = this.history[this.currentPointerIndex];

			if (!currentHistory) return;

			if (isUndo) {
				const nextHistory = this.history[this.currentPointerIndex + 1];

				const { classInfo, classInfoBeforeAction, handleInCloud } = nextHistory;
				const { classInfoName } = classInfo || {};

				switch (nextHistory.classInfoAction) {
					case "add":
						classPageObj.allClassInfoView.delete(classInfoName, true);
						break;

					case "change":
						classPageObj.allClassInfoView.update(classInfoName, classInfoBeforeAction, true);
						break;

					case "delete":
						classPageObj.allClassInfoView.add(classInfoBeforeAction, true);
						break;
				}
			} else {
				const { classInfoBeforeAction, classInfo, handleInCloud } = currentHistory;
				const { classInfoName } = classInfoBeforeAction || {};

				switch (currentHistory.classInfoAction) {
					case "add":
						classPageObj.allClassInfoView.add(classInfo, handleInCloud);
						break;

					case "change":
						classPageObj.allClassInfoView.update(classInfoName, classInfo, handleInCloud);
						break;

					case "delete":
						classPageObj.allClassInfoView.delete(classInfoName, handleInCloud);
						break;
				}
			}

			this.resetStyleBtns();

			// Reset view add student with online form
			classPageObj.settingsBox.addStudentBoxWithLink.resetView();
		},

		handlePushNewHistory(newHistory) {
			if (this.currentPointerIndex === null) {
				const classInfoBeforeAdd = appStorageObj.classStorage.getClass();

				const { classInfoName: clasInfoNameBeforeAdd } = classInfoBeforeAdd;

				this.currentPointerIndex = 0;
				this.history.push({
					classInfoAction: "change",
					classInfoNameToAction: clasInfoNameBeforeAdd,
					classInfo: classInfoBeforeAdd,
				});
			}

			if (this.currentPointerIndex < this.history.length - 1) {
				this.history.splice(
					this.currentPointerIndex + 1,
					this.history.length - (this.currentPointerIndex + 1)
				);
			}

			if (this.history.length === this.historyMaxLength) {
				this.history.shift();
				this.currentPointerIndex--;
			}

			this.history.push(newHistory);
			this.currentPointerIndex++;
			this.renderView();
		},

		resetStyleBtns() {
			const undoBtn = $(
				".settings-box__wrapper .box__body .tab-list__item.all-class-info .right-slide__undo"
			);
			const redoBtn = $(
				".settings-box__wrapper .box__body .tab-list__item.all-class-info .right-slide__redo"
			);

			if (this.history.length < 2) {
				undoBtn.classList.add("disabled");
				redoBtn.classList.add("disabled");
				return;
			}

			if (this.currentPointerIndex === 0) {
				undoBtn.classList.add("disabled");
			} else {
				undoBtn.classList.remove("disabled");
			}

			if (this.currentPointerIndex === this.history.length - 1) {
				redoBtn.classList.add("disabled");
			} else {
				redoBtn.classList.remove("disabled");
			}
		},

		reset() {
			this.history = [];
			this.historyMaxLength = 30;
			this.currentPointerIndex = null;
			this.renderView();
		},
	};
}
var classPageObj = new ClassPage();

window.addEventListener("load", mainObj.run);
