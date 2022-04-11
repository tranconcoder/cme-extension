class Authenticate {
	loginWithGoogle() {
		const loginWithGoogleWrapper = $("#settings-box__authenticate-tab .authenticate__ctn");
		const avatarElm = $("#settings-box__authenticate-tab .authenticate__ctn > img");
		const googleNameElm = $(
			"#settings-box__authenticate-tab .authenticate__ctn .info__name .name__content"
		);
		const gmailElm = $(
			"#settings-box__authenticate-tab .authenticate__ctn .info__gmail .gmail__content"
		);
		const newWindow = window.open(`${HOST}/auth/google/re-login`, "pop", "width=600, height=500");

		const denyTimeout = setTimeout(handleLoginFail, 30000);

		window.addEventListener("message", handleLogin, false);

		async function handleLogin(e) {
			if (e.origin.includes(HOST) && !e.data.message) {
				// Cleanup
				newWindow.close();
				window.removeEventListener("message", handleLogin);
				clearTimeout(denyTimeout);

				// Set user info
				appStorageObj.userInfo.set({
					googleId: e.data.googleId,
					googleName: e.data.googleName,
					name: e.data.name,
					email: e.data.email,
					avatar: e.data.avatar,
				});

				// Update new token handle
				appStorageObj.cookieStorage.token.refreshToken.set(e.data.refreshToken);

				await tokenObj.getNewToken();

				appStorageObj.handleUpdateToken();

				// Connect to socket server
				socketObj.connect();

				appStorageObj.initAllStorage();

				// Set style ui to logged
				loginWithGoogleWrapper.className = "authenticate__ctn logged-in";
				avatarElm.src = e.data.avatar;
				googleNameElm.textContent = e.data.name;
				gmailElm.textContent = e.data.email;
			}
		}

		function handleLoginFail(e) {
			newWindow.close();

			window.removeEventListener("message", handleLogin);

			loginWithGoogleWrapper.className = "authenticate__ctn";

			avatarElm.src = getLink("img/avatar.png");
		}
	}

	reLoginWithGoogle(refreshToken) {
		const loginWithGoogleWrapper = $("#settings-box__authenticate-tab .authenticate__ctn");

		tokenObj
			// Get new refresh token
			.getNewToken({
				tokenTypeToGet: "refreshToken",
				refreshToken,
			})
			.then(async newRefreshToken => {
				// Set style loading to authenticate tab
				loginWithGoogleWrapper.className = "authenticate__ctn logged-in";

				return newRefreshToken;
			})
			// Get new access token
			.then(refreshToken => tokenObj.getNewToken({ refreshToken }))
			.then(newAccessToken => {
				// Connect to socket server
				socketObj.connect();

				// Decode jwt -> get user profile
				return jwt_decode(newAccessToken);
			})
			// Render and update profile
			.then(profileInfo => {
				// Update new profile to localStorage
				appStorageObj.userInfo.set(profileInfo);

				// Set style logged in to authenticate tab
				const avatarElm = $("#settings-box__authenticate-tab .authenticate__ctn > img");
				const googleNameElm = $(
					"#settings-box__authenticate-tab .authenticate__ctn .info__name .name__content"
				);
				const gmailElm = $(
					"#settings-box__authenticate-tab .authenticate__ctn .info__gmail .gmail__content"
				);

				avatarElm.src = profileInfo.avatar;
				googleNameElm.textContent = profileInfo.name;
				gmailElm.textContent = profileInfo.email;
			})
			// Set handle refresh tokens
			.then(() => {
				// Set interval refresh token
				appStorageObj.handleUpdateToken();

				// Init storage
				appStorageObj.initAllStorage();
			})
			.catch(errors => {
				console.error(errors);

				loginWithGoogleWrapper.className = "authenticate__ctn";
			});
	}

	logout() {
		const loginWithGoogleWrapper = $("#settings-box__authenticate-tab .authenticate__ctn");
		const avatarElm = $("#settings-box__authenticate-tab .authenticate__ctn > img");
		const refreshToken = appStorageObj.cookieStorage.token.refreshToken.get();

		loginWithGoogleWrapper.className = "authenticate__ctn loading";
		avatarElm.src = getLink("img/avatar.png");

		const newWindow = window.open(
			`${HOST}/auth/logout?refreshToken=${refreshToken}`,
			"pop",
			"width=600, height=500"
		);

		window.addEventListener("message", handleLogout, false);

		const failTimeout = setTimeout(handleLogoutFail, 20000);

		function handleLogout(e) {
			if (e.origin.includes(HOST) && e.data.message) {
				newWindow.close();
				window.removeEventListener("message", handleLogout);
				clearTimeout(failTimeout);
				clearInterval(appStorageObj.getNewAccessTokenInterval);

				// Turn off attendance
				const { autoAttendance: isTurnOnAutoAttendance } = settingsObj.getSettings();
				if (isTurnOnAutoAttendance) attendanceObj.turnOff();

				// Disconnect to socket
				socketObj.disconnect();

				// Delete authenticate cookie
				appStorageObj.cookieStorage.token.refreshToken.delete();
				appStorageObj.cookieStorage.token.accessToken.delete();

				// Reset memberStorage
				appStorageObj.classStorage.reset();

				// Reset userStorage
				appStorageObj.userInfo.reset();

				// Reset groupStorage
				classPageObj.groupListView.clear();
				appStorageObj.groupsStorage.reset();
				classPageObj.groupListView.render();

				// Reset undo and redo student list
				classPageObj.undoAndRedoMembersList.reset();

				// Set attendance data to empty
				appStorageObj.attendanceHistoryStorage.reset();
				classPageObj.attendanceHistoryView.render();

				// Set style
				loginWithGoogleWrapper.className = "authenticate__ctn";
			}
		}

		function handleLogoutFail(e) {
			newWindow.close();
			window.removeEventListener("message", handleLogout);
			alert("Đăng xuất thất bại, vui lòng thử lại...");
		}
	}
}
var authenticateObj = new Authenticate();
