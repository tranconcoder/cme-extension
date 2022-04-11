class AttendanceHistory {
	renderExcel(attendanceInfo) {
		const renderTableData = document.createElement("table");
		const totalTimeLearningConverted = generalMethods.convertTimeSecond(
			attendanceInfo.totalTimeLearning
		);
		const timeStart = attendanceInfo.startAttendanceAt;
		const timeEnd = attendanceInfo.endAttendanceAt;

		addTableRows(
			renderTableData,
			[`Thông tin điểm danh của lớp ${attendanceInfo.classInfoName}`],
			["Tổng số học sinh", attendanceInfo.attendanceData.length],
			["Bắt đầu điểm danh", generalMethods.getTimeStr(true, true, true, timeStart)],
			["Kết thúc điểm danh", generalMethods.getTimeStr(true, true, true, timeEnd)],
			["Thời gian", generalMethods.getTimeStr(true, false, false, totalTimeLearningConverted)],
			[""],
			[""],
			["STT", "Họ và tên", "Tên trong Google meet", "Thời gian"],
			...attendanceInfo.attendanceData.map(studentInfo => [
				studentInfo.index,
				studentInfo.name,
				studentInfo.googleName,
				(() => {
					const timeLearningConverted = generalMethods.convertTimeSecond(
						studentInfo.timeLearning
					);

					return generalMethods.getTimeStr(true, false, false, timeLearningConverted);
				})(),
			])
		);

		function addTableRows(table, ...dataArrayArguments) {
			dataArrayArguments.forEach(dataArray => {
				const row = document.createElement("tr");

				dataArray.forEach(data => {
					const rowColumn = document.createElement("td");

					rowColumn.textContent = data;
					row.appendChild(rowColumn);
				});

				table.appendChild(row);
			});
		}
		function html_table_to_excel(dataTableELm) {
			const type = "xlsx";
			const data = dataTableELm;
			const file = XLSX.utils.table_to_book(data, {
				sheet: "sheet1",
			});

			XLSX.write(file, {
				bookType: type,
				bookSST: true,
				type: "base64",
			});

			XLSX.writeFile(
				file,
				`${attendanceInfo.classInfoName} - Điểm danh lúc ${generalMethods.getTimeStr(
					true,
					true,
					true,
					timeStart
				)}.${type}`
			);
		}
		html_table_to_excel(renderTableData);
	}

	async renderAttendancePage(attendanceData) {
		const totalTimeLearningConverted = generalMethods.convertTimeSecond(
			attendanceData.totalTimeLearning
		);
		const settings = settingsObj.getSettings();
		const studentsExistCount = attendanceData.attendanceData.reduce(
			(previousCount, studentInfo) =>
				Math.floor((studentInfo.timeLearning / attendanceData.totalTimeLearning) * 100) >=
				settings.timingExistPercent
					? previousCount + 1
					: previousCount,
			0
		);

		this.currentWindow?.close();
		this.currentWindow = window.open("");

		const cssStyleFilePath = chrome.runtime.getURL("css/attendancePage.css");
		const windowTitle = `${appStorageObj.classStorage.getCurrentClassInfoName()} - Điểm danh lúc ${generalMethods.getTimeStr(
			true,
			true,
			true,
			attendanceData.startAttendanceAt
		)}`;

		this.currentWindow.document.write(`
			<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta http-equiv="X-UA-Compatible" content="IE=edge" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<link rel="stylesheet" href="${cssStyleFilePath}" />
						<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" />
						<title>${windowTitle}</title>
					</head>
					<body onblur="self.focus();">
						<div class="cmt-box-wrapper">
							<div class="cmt-box-wrapper__background"></div>
							<div class="cmt-box-wrapper__box">
								<header class="box__header">
									<p>Lịch sử tin nhắn</p>
									<p></p>
								</header>

								<div class="box__body">
									<ul class="body__cmt-list"></ul>
								</div>
							</div>
						</div>

						<div class="attendance-page">
								<button class="attendance-page__print-btn">
									<img src="${getLink("img/printIcon.png")}" alt=""/>
									<p>Lưu lại</p>
								</button>
								<div class="attendance-page__state-message"><img src="${getLink(
									"img/toggleIcon.png"
								)}" alt=""/> <span>Bắt đầu điểm danh lúc ${generalMethods.getTimeStr(
			true,
			true,
			true,
			attendanceData.startAttendanceAt
		)}</span></div>
								<div class="attendance-page__slide-1">
									<div class="slide-1__class-info-name">
										<h2 class="class-info-name__class-name">${attendanceData.classInfoName}</h2>
										<span class="class-info-name__label">Lớp hiện tại</span>
									</div>
									<div class="slide-1__time-learning">
										<h2 class="time-learning__time">${totalTimeLearningConverted.hours}:${
			totalTimeLearningConverted.minutes
		}:${totalTimeLearningConverted.seconds}</h2>
										<span class="time-learning__label">Thời gian</span>
									</div>
									<div class="slide-1__student-exist-count">
										<h2 class="student-exist-count__count">${studentsExistCount} HS</h2>
										<span class="student-exist-count__label">Đi học đủ</span>
									</div>
								</div>
								<div class="attendance-page__slide-2">
									<div class="slide-2__not-exist-student">
										<h2 class="not-exist-student__caption">HS vắng trong buổi học (${
											attendanceData.attendanceData.length - studentsExistCount
										})</h2>
										<div class="not-exist-student__box"></div>
									</div>
								</div>
								<div class="attendance-page__slide-3">
									<h2 class="slide-3__caption">Thống kê chi tiết</h2>
									<div class="slide-3__header">
										<div class="header__index">
												<span class="index__title">STT</span>
												<label class="index__sort" data-sort-type="0">
													<input type="radio" name="sort-column" value="index" checked />
													<i class="fas fa-sort-alpha-down"></i>
													<i class="fas fa-sort-alpha-down-alt"></i>
												</label>
										</div>
										<div class="header__name"><span class="name__title">Họ và tên</span></div>
										<div class="header__exist-bar">
											<span class="exist-bar__title">Phần trăm có mặt</span>
										</div>
										<div class="header__join-and-exit-timers"><span class="join-and-exit-timers__title">Vào học lúc</span></div>
										<div class="header__time-learning">
												<span class="time-learning__title">Thời gian</span>
												<label class="time-learning__sort" data-sort-type="0">
													<input type="radio" name="sort-column" value="timeLearning" />
													<i class="fas fa-sort-alpha-down"></i>
													<i class="fas fa-sort-alpha-down-alt"></i>
												</label>
										</div>
										<div class="header__not-exist-status">
											<span>Điểm danh</span>
										</div>
									</div>
									<ul class="slide-3__student-wrapper"></ul>
								</div>
								<div class="attendance-page__slide-4">
									<div class="slide-4__chat-img"><img src="${getLink("img/chat-thumb.svg")}" alt=""/></div>
									<div class="slide-4__chat-ctn">
										<div class="chat-ctn__head"><p>Tin nhắn trong lớp học</p></div>
										<div class="chat-ctn__body">
												<ul class="body__chat-ctn">
													${attendanceData.chats
														.map(
															chatInfo => `
													<li class="chat-ctn__chat-item">
														<div class="chat-item__info"><span class="name">${chatInfo.name}</span><time>${
																chatInfo.time
															}</time></div>
														<div class="chat-item__content-list">
																${chatInfo.content
																	.map(
																		chatContent => `
																<p class="content-list__content">${chatContent}</p>
																`
																	)
																	.join("")}
														</div>
													</li>
													`
														)
														.join("")}
												</ul>
										</div>
									</div>
								</div>

								<div class="attendance-page__slide-5">
									<div class="slide-5__interactive-ctn">
										<header class="interactive-ctn__head">
											<p>Thống kê tương tác</p>
										</header>
						
										<div class="interactive-ctn__body">
											<ul class="body__interactive-list">
												${attendanceData.attendanceData
													.map(
														member => `
													<li class="interactive-list__item">
														<div class="item__img-ctn">
															<img src="${getLink("img/student.png")}" alt="" class="item__avatar" />
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
															<div class="info-ctn__comment" data-name="${member.name}">
																<p style="display: none">${JSON.stringify(member.chats)}</p>
																<i class="far fa-comments-alt"></i>
																<span>
																	Chat: <b>${member.chats.reduce(
																		(accumanlator, currentValue) =>
																			accumanlator +
																			currentValue.contents.length,
																		0
																	)}</b> lần - Nội dung
																	<i class="fas fa-arrow-alt-right" style="margin-right: 3px"></i>
																</span>
															</div>
														</div>
													</li>	`
													)
													.join("")}
											</ul>
										</div>
									</div>
								</div>
						</div>
					</body>
				</html>		
		`);

		// Set event cmt box wrapper
		const interactiveCtn = $(
			".attendance-page__slide-5 .slide-5__interactive-ctn",
			this.currentWindow.document
		);
		const cmtBoxBackgroundElm = $(".cmt-box-wrapper__background", this.currentWindow.document);
		const cmtBoxElm = $(".cmt-box-wrapper", this.currentWindow.document);

		cmtBoxBackgroundElm.addEventListener("click", e => {
			cmtBoxElm.classList.remove("show");
		});

		interactiveCtn.addEventListener("click", e => {
			let target = e.target;

			while (
				target.classList.contains("info-ctn__comment")
					? false
					: target.classList.contains("slide-5__interactive-ctn")
					? false
					: true
			) {
				target = target.parentNode;
			}

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

		const notExistStudentsBox = $(".not-exist-student__box", this.currentWindow.document);
		const notExistStudentsInfo = attendanceData.attendanceData.filter(
			studentInfo => studentInfo.learningPercent < settings.timingExistPercent
		);

		notExistStudentsInfo.forEach(studentInfo => {
			const newStudentInfoElm = document.createElement("div");

			newStudentInfoElm.className = "box__item";
			newStudentInfoElm.innerHTML = `<span class="item__index"> <p>${studentInfo.index}</p></span><span class="item__name"> <p>${studentInfo.name}</p></span>`;

			notExistStudentsBox.appendChild(newStudentInfoElm);
		});

		// Set event print button
		const printBtn = $(".attendance-page__print-btn", this.currentWindow.document);

		printBtn.addEventListener("click", () => {
			this.currentWindow.print();
		});

		// Render attendance info
		const attendanceListWrapper = $(".slide-3__student-wrapper", this.currentWindow.document);

		// Sort the attendance list
		const indexSortBtn = $(
			".attendance-page__slide-3 .slide-3__header .index__sort",
			this.currentWindow.document
		);
		const timeLearningSortBtn = $(
			".attendance-page__slide-3 .slide-3__header .time-learning__sort",
			this.currentWindow.document
		);

		indexSortBtn.addEventListener("click", handleClickSortBtns.bind(this));
		timeLearningSortBtn.addEventListener("click", handleClickSortBtns.bind(this));

		function handleClickSortBtns(e) {
			e.preventDefault();
			let currentBtn = e.target;

			while (currentBtn.tagName != "LABEL") {
				currentBtn = currentBtn.parentNode;
			}

			const sortInput = $(`input[type="radio"]`, currentBtn);
			const allSortWrapper = Array.from(
				$$(".attendance-page__slide-3 .slide-3__header label", this.currentWindow.document)
			);

			allSortWrapper
				.filter(labelElm => {
					const inputSortInCurrentLabel = $(`input[type="radio"]`, labelElm);

					return !(sortInput === inputSortInCurrentLabel);
				})
				.forEach(labelElm => {
					labelElm.dataset.sortType = 0;
				});

			if (sortInput.checked) {
				currentBtn.dataset.sortType = currentBtn.dataset.sortType == 0 ? 1 : 0;
			} else {
				sortInput.checked = true;
			}

			handleSort.call(this);
		}

		handleSort.call(this);
		function handleSort() {
			const allSortWrapper = [
				...$$(
					".attendance-page__slide-3 .slide-3__header label[data-sort-type]",
					this.currentWindow.document
				),
			];
			let sortField;
			let sortType;

			allSortWrapper.some(wrapperElm => {
				const inputSort = $(`input[type="radio"]`, wrapperElm);

				if (inputSort.checked) {
					sortField = inputSort.value;
					sortType = +wrapperElm.dataset.sortType;

					return true;
				}

				return false;
			});

			attendanceListWrapper.innerHTML = "";

			attendanceData.attendanceData.sortObject(sortField, sortType).forEach(studentInfo => {
				const newStudentAttendanceItem = document.createElement("li");
				const timeLearningConverted = generalMethods.convertTimeSecond(
					studentInfo.timeLearning
				);
				const learningPercent = Math.floor(
					(studentInfo.timeLearning / attendanceData.totalTimeLearning) * 100
				);

				newStudentAttendanceItem.className = `student-wrapper__student${
					learningPercent < settings.timingExistPercent ? " mark" : ""
				}`;
				newStudentAttendanceItem.innerHTML = `<span class="student__index">${
					studentInfo.index
				}</span><span class="student__name">${
					studentInfo.name
				}</span><span class="student__exist-bar"><div class="exist-bar__main-bar"><span class="main-bar__left"></span><div class="main-bar__current" style="width: ${learningPercent}%"><span class="current__percent">${learningPercent}%</span></div><span class="main-bar__right"></span></div></span><span class="student__join-and-exit-timers"><span class="join-and-exit-timers__first"><p>${
					studentInfo.joinAndExitTimers.length
						? generalMethods.getTimeStr(
								true,
								false,
								false,
								studentInfo.joinAndExitTimers[0].time
						  )
						: "Chưa vào"
				}</p><i class="far fa-angle-down"></i></span><ul class="join-and-exit-timers__list">${studentInfo.joinAndExitTimers
					.map(
						joinAndExitTimer =>
							`<li class="list__timers ${
								joinAndExitTimer.type ? "join" : "exit"
							}"><p>${generalMethods.getTimeStr(
								true,
								false,
								false,
								joinAndExitTimer.time
							)}</p><i class="${
								joinAndExitTimer.type ? "fas fa-sign-in-alt" : "fas fa-sign-out-alt"
							}"></i></li>`
					)
					.join(
						""
					)}</ul></span><span class="student__time-learning"><p>${generalMethods.getTimeStr(
					true,
					false,
					false,
					timeLearningConverted
				)}</p></span><span class="student__not-exist-status"><p>${
					studentInfo.notExistStatus === 0
						? "Có mặt"
						: studentInfo.notExistStatus === 1
						? "Không phép"
						: "Có phép"
				}</p></span>`;

				attendanceListWrapper.appendChild(newStudentAttendanceItem);
			});
		}

		await generalMethods.sleep(1000);

		this.currentWindow.addEventListener("beforeprint", e => {
			// Set margin top to next page if elm over current page
			// Slide 3
			const studentListElm = $$(
				".slide-3__student-wrapper > .student-wrapper__student",
				this.currentWindow.document
			);

			studentListElm.forEach(studentItemElm => {
				const studentItemElmOffsetTop = studentItemElm.offsetTop % 1200;
				const studentItemElmHeight = studentItemElm.clientHeight;

				if (studentItemElmOffsetTop + studentItemElmHeight > 1200) {
					studentItemElm.style.marginTop = `${1200 + 2 - studentItemElmOffsetTop}px`;
				}
			});

			// Slide 4
			const allMessageContentElm = $$(
				".chat-ctn__chat-item p.content-list__content",
				this.currentWindow.document
			);

			allMessageContentElm.forEach(messageContentElm => {
				const messageContentElmOffsetTop = messageContentElm.offsetTop % 1200;
				const messageContentElmClientHeight = messageContentElm.clientHeight;

				if (messageContentElmOffsetTop + messageContentElmClientHeight > 1190) {
					messageContentElm.style.marginTop = `${100}px !important`;
				}
			});
		});
		this.currentWindow.addEventListener("afterprint", e => {
			const studentListElm = $$(
				".slide-3__student-wrapper > .student-wrapper__student",
				this.currentWindow.document
			);

			printBtn.style.display = "flex";
			studentListElm.forEach(studemtItemElm => (studemtItemElm.style.marginTop = "0px"));
		});

		return this.currentWindow;
	}

	async renderPdf(attendanceData) {
		const attendanceWindow = await this.renderAttendancePage(attendanceData);

		attendanceWindow.print();
	}
}
var attendanceHistoryObj = new AttendanceHistory();
