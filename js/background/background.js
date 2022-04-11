const hostList = ["http://localhost:3000", "https://cons-meeting-education.herokuapp.com"];
const hostIndex = 0;
const host = hostList[hostIndex];

chrome.runtime.onMessage.addListener(request => {
	switch (request.type) {
		case "UPLOAD_ATTENDANCE":
			const uploadAttendanceUrl = `${host}/resources/attendance-history/add`;
			const uploadAttendanceOptions = {
				method: "POST",
				body: {
					googleId: request.googleId,
					attendanceData: request.data,
				},
			};

			tokenObj
				.handleCallApi(uploadAttendanceUrl, uploadAttendanceOptions)
				.catch(errors => console.error(errors));

			break;

		// case "RELOAD_EXTENSION":
		// 	chrome.runtime.reload();

		// 	break;
	}
});
