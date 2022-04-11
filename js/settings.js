class Settings {
	defaultSettingsInfo = {
		class: "12A12",
		autoTurnOffMedia: true,
		autoAttendance: false,
		autoAccept: false,
		blockAccessInvalid: false,
		timingExistPercent: 80,
	};

	initial() {
		const settingsJson = localStorage.getItem(appStorageObj.storageKeys.settings);

		if (!settingsJson) {
			localStorage.setItem(
				appStorageObj.storageKeys.settings,
				JSON.stringify(this.defaultSettingsInfo)
			);
		}
	}

	getSettings() {
		const settingsJson = localStorage.getItem(appStorageObj.storageKeys.settings);

		if (settingsJson) {
			const settingsJs = {
				...JSON.parse(settingsJson),
			};
			return settingsJs;
		}

		localStorage.setItem(
			appStorageObj.storageKeys.settings,
			JSON.stringify(this.defaultSettingsInfo)
		);

		return this.defaultSettingsInfo;
	}

	setSettings(newSettings) {
		const currentSettings = this.getSettings();

		localStorage.setItem(
			appStorageObj.storageKeys.settings,
			JSON.stringify({
				...currentSettings,
				...newSettings,
			})
		);

		classPageObj.settingsBox.settingsBoxFeaturesResetStyle();
	}
}
var settingsObj = new Settings();
settingsObj.initial();
