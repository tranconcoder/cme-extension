class GeneralMethods {
	sleep(time) {
		return new Promise(resolve => {
			setTimeout(resolve, time);
		});
	}

	secondToMinute(second) {
		const minutes = Number.parseInt(second / 60);
		const seconds = second % 60;

		return `${minutes}p${seconds}s`;
	}

	convertTimeSecond(second) {
		let hoursLearning = Math.floor(second / 3600);
		let minutesLearning = Math.floor((second % 3600) / 60);
		let secondsLearning = parseInt(Math.floor(second % 60));

		hoursLearning = `${hoursLearning}`.length < 2 ? `0${hoursLearning}` : `${hoursLearning}`;
		minutesLearning =
			`${minutesLearning}`.length < 2 ? `0${minutesLearning}` : `${minutesLearning}`;
		secondsLearning =
			`${secondsLearning}`.length < 2 ? `0${secondsLearning}` : `${secondsLearning}`;

		return {
			hours: hoursLearning,
			minutes: minutesLearning,
			seconds: secondsLearning,
		};
	}

	getLocalTime(type = 1) {
		const timeObj = this.getCurrentTime();

		if (type === 1) {
			return `${timeObj.hours}:${timeObj.minutes}:${timeObj.seconds}: - ${timeObj.weekDays} ${timeObj.dates}/${timeObj.months}/${timeObj.years}`;
		} else {
			return `${timeObj.hours}h${timeObj.minutes}m${timeObj.seconds}s - ${timeObj.weekDays} ${timeObj.dates}/${timeObj.months}/${timeObj.years}`;
		}
	}

	getCurrentTime() {
		const localTime = new Date(Date.now());
		let localSecond = localTime.getSeconds();
		let localMinutes = localTime.getMinutes();
		let localHours = localTime.getHours();
		let localDate = localTime.getDate();
		let localMonth = localTime.getMonth() + 1;
		let localYear = localTime.getFullYear();
		let localDayOfWeek;

		if (localTime.getDay() === 0) {
			localDayOfWeek = 8;
		} else {
			localDayOfWeek = localTime.getDay() + 1;
		}

		return {
			seconds: `${localSecond}`.length < 2 ? `0${localSecond}` : `${localSecond}`,
			minutes: `${localMinutes}`.length < 2 ? `0${localMinutes}` : `${localMinutes}`,
			hours: `${localHours}`.length < 2 ? `0${localHours}` : `${localHours}`,
			dates: `${localDate}`.length < 2 ? `0${localDate}` : `${localDate}`,
			months: `${localMonth}`.length < 2 ? `0${localMonth}` : `${localMonth}`,
			years: `${localYear}`.length < 2 ? `0${localYear}` : `${localYear}`,
			weekDays: `0${localDayOfWeek}`,
		};
	}

	getTimeStringLocal(date) {
		const localUtcTime = new Date(date);
		localUtcTime.setMinutes(localUtcTime.getMinutes() - localUtcTime.getTimezoneOffset());

		return localUtcTime.toLocaleString("vn-VN", {
			timeZone: "Asia/Ho_Chi_Minh",
			hour12: false,
		});
	}

	getTimeStr(hasTime, hasWeekDays, hasDates, timeObj) {
		if (timeObj) {
			return getString(timeObj);
		} else {
			return getString(this.getCurrentTime());
		}

		function getString(timeInfoObj) {
			const timeStr = hasTime
				? `${timeInfoObj.hours}:${timeInfoObj.minutes}:${timeInfoObj.seconds} `
				: "";
			const weekDaysStr = hasWeekDays
				? `- ${+timeObj.weekDays === 8 ? "CN" : `T${+timeObj.weekDays}`}`
				: "";
			const datesStr = hasDates
				? hasWeekDays
					? ` ${timeInfoObj.dates}/${timeInfoObj.months}/${timeInfoObj.years}`
					: `- ${timeInfoObj.dates}/${timeInfoObj.months}/${timeInfoObj.years}`
				: "";

			return timeStr + weekDaysStr + datesStr;
		}
	}

	async domHandleWithCondition(
		domSelector = "",
		stopCondition = function () {},
		duration = 100,
		callbackHandle = async function () {}
	) {
		return new Promise(resolve => {
			let interval = setInterval(async () => {
				const stopConditionResult = stopCondition();
				if (stopConditionResult) {
					clearInterval(interval);
					resolve();
					return;
				}

				const domElement = $(domSelector);
				if (domElement) {
					callbackHandle(domElement);
				}
			}, duration);
		});
	}

	async getDom(classNameElm, multiple = false, duration = 50) {
		return new Promise(resolve => {
			const interval = setInterval(() => {
				if (multiple ? $$(classNameElm) : $(classNameElm)) {
					resolve(multiple ? $$(classNameElm) : $(classNameElm));
					clearInterval(interval);
				}
			}, duration);
		});
	}

	triggerEvent(element, eventName) {
		var event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, false, true);
		element.dispatchEvent(event);
	}

	validateEmail(email) {
		var re =
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email.trim());
	}
}
var generalMethods = new GeneralMethods();
