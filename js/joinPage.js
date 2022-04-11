class JoinPage {
	initial() {
		const settings = settingsObj.getSettings();

		if (settings.autoTurnOffMedia) {
			this.turnOffMedia();
		}

		this.listenGoToClassPage();
	}

	turnOffMedia() {
		(function turnOffVoice() {
			const MICRO_BTN_CLASS = classSelectorsObj.JOIN_PAGE_MICRO_BTN;
			const MICRO_BTN_ACTIVE_CLASS = classSelectorsObj.JOIN_PAGE_MICRO_BTN_ACTIVE;

			const END_CALL_BTN_CLASS = classSelectorsObj.END_CALL_BTN;

			return generalMethods.domHandleWithCondition(
				MICRO_BTN_CLASS,
				() => $(MICRO_BTN_ACTIVE_CLASS) || $(END_CALL_BTN_CLASS),
				100,
				element => element.click()
			);
		})();

		(function turnOffCamera() {
			const CAMERA_BTN_CLASS = classSelectorsObj.JOIN_PAGE_CAMERA_BTN;
			const CAMERA_BTN_ACTIVE_CLASS = classSelectorsObj.JOIN_PAGE_CAMERA_BTN_ACTIVE;

			const END_CALL_BTN_CLASS = classSelectorsObj.END_CALL_BTN;

			return generalMethods.domHandleWithCondition(
				CAMERA_BTN_CLASS,
				() => $(CAMERA_BTN_ACTIVE_CLASS) || $(END_CALL_BTN_CLASS),
				100,
				element => element.click()
			);
		})();
	}

	listenGoToClassPage() {
		const interval = setInterval(async () => {
			if (mainObj.currentPage != "classPage") {
				mainObj.currentPage = await navigationObj.getCurrentPage();
			} else {
				clearInterval(interval);
				mainObj.run();
			}
		}, 200);
	}
}
var joinPageObj = new JoinPage();
