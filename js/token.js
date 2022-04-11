class Token {
	accessTokenIsGetting = false;
	getAccessTokenPromise = null;

	refreshTokenIsGetting = false;
	getRefreshTokenPromise = null;

	getNewToken(
		options = {
			tokenTypeToGet: "accessToken",
			refreshToken: appStorageObj.cookieStorage.token.refreshToken.get(),
		}
	) {
		options.tokenTypeToGet = options.tokenTypeToGet || "accessToken";
		options.refreshToken =
			options.refreshToken || appStorageObj.cookieStorage.token.refreshToken.get();

		if (!options.refreshToken) {
			return console.error("Missing refresh token! (token is falsy).");
		}

		if (options.tokenTypeToGet === "accessToken") {
			if (this.accessTokenIsGetting === false) {
				this.accessTokenIsGetting = true;

				const getNewAccessTokenUrl = `${HOST}/token/get-new-access-token?refreshToken=${options.refreshToken}`;

				this.getAccessTokenPromise = new Promise((resolve, reject) => {
					fetch(getNewAccessTokenUrl)
						.then(res => res.json())
						.then(newAccessToken => {
							// Set new accessToken to cookie storage
							appStorageObj.cookieStorage.token.accessToken.set(newAccessToken);

							// Resolve new accessToken
							resolve(newAccessToken);
						})
						.catch(errors => {
							console.error(errors);

							reject(errors);
						})
						.finally(() => {
							// Reset for new handle
							this.getAccessTokenPromise = null;
							this.accessTokenIsGetting = false;
						});
				});

				return this.getAccessTokenPromise;
			}

			if (this.accessTokenIsGetting === true) {
				return this.getAccessTokenPromise;
			}
		} else {
			if (this.refreshTokenIsGetting === false) {
				this.refreshTokenIsGetting = true;

				const getNewRefreshTokenUrl = `${HOST}/token/get-new-refresh-token?refreshToken=${options.refreshToken}`;

				this.getRefreshTokenPromise = new Promise((resolve, reject) => {
					fetch(getNewRefreshTokenUrl)
						.then(res => res.json())
						.then(newRefreshToken => {
							// Set new accessToken to cookie storage
							appStorageObj.cookieStorage.token.refreshToken.set(newRefreshToken);

							// Resolve new accessToken
							resolve(newRefreshToken);
						})
						.catch(errors => {
							console.error(errors);

							reject(errors);
						})
						.finally(() => {
							// Reset for new handle
							this.getRefreshTokenPromise = null;
							this.refreshTokenIsGetting = false;
						});
				});

				return this.getRefreshTokenPromise;
			}

			if (this.refreshTokenIsGetting === true) {
				return this.getRefreshTokenPromise;
			}
		}
	}

	async handleCallApi(
		url,
		options = {
			method: "GET",
			body: {},
			responseType: "json",
			queryBody: {},
		},
		tokens = {
			accessToken: appStorageObj.cookieStorage.token.accessToken.get(),
			refreshToken: appStorageObj.cookieStorage.token.refreshToken.get(),
		},
		reCallApiCount = 0
	) {
		let tookNewToken = false;

		options.method = options.method.toUpperCase();

		// Auto fill object key undefined
		options.method = options.method || "GET";
		options.body = options.body || {};
		options.responseType = options.responseType || "json";
		options.queryBody = options.queryBody || {};

		tokens.accessToken =
			tokens.accessToken || appStorageObj.cookieStorage.token.accessToken.get();

		tokens.refreshToken =
			tokens.refreshToken || appStorageObj.cookieStorage.token.refreshToken.get();

		if (!tokens.accessToken) {
			if (!tokens.refreshToken) {
				return console.error("Tokens is invalid.");
			} else {
				tookNewToken = true;
				tokens.accessToken = await this.getNewToken({
					tokenTypeToGet: "accessToken",
					refreshToken: tokens.refreshToken,
				});
			}
		}

		const MAX_RECALL_API_COUNT = 5;

		reCallApiCount++;

		return new Promise(async (resolve, reject) => {
			let callApiUrl = `${url}?accessToken=${tokens.accessToken}`;

			for (const key in options.queryBody) {
				callApiUrl += `&${key}=${options.queryBody[key]}`;
			}

			const callApiOptions = {
				method: options.method,
				headers: {
					"Content-Type": "application/json",
				},
			};

			if ("PATCH POST PUT".includes(options.method)) {
				callApiOptions.body = JSON.stringify(options.body);
			}

			return await fetch(callApiUrl, callApiOptions)
				.then(res => {
					if (res.ok) {
						return res;
					}

					throw new Error(`Response is not "ok". code: ${res.status}`);
				})
				.then(res =>
					options.responseType === "json"
						? res.json()
						: options.responseType === "blob"
						? res.blob()
						: options.responseType === "formData"
						? res.formData()
						: options.responseType === "text"
						? res.text()
						: res
				)
				.then(callApiResult => resolve(callApiResult))
				.catch(async errors => {
					// If reCallApiCount >= MAX_RECALL_API_COUNT then return error
					if (reCallApiCount >= MAX_RECALL_API_COUNT) {
						console.error(errors);
						console.error("reCallApiCount is more than MAX_RECALL_API_COUNT!");

						resolve(null);

						return;
					}

					// Get new access token
					if (tookNewToken) {
						return reject(new Error(errors));
					}

					const newAccessToken = await this.getNewToken({
						refreshToken: tokens.refreshToken,
					}).then(newAccessToken => newAccessToken);

					if (newAccessToken) {
						// Sleep 100ms
						await generalMethods.sleep(100);

						// Set new access token to headers authorization
						const callApiResult = await this.handleCallApi(
							url,
							options,
							{
								accessToken: newAccessToken,
								refreshToken: tokens.refreshToken,
							},
							reCallApiCount
						).then(callApiResult => callApiResult);

						return resolve(callApiResult);
					} else {
						// if can't get new accessToken
						return reject(new Error(errors));
					}
				});
		});
	}
}
var tokenObj = new Token();
