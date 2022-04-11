class Main {
	currentPage;

	async run() {
		this.currentPage = await navigationObj.getCurrentPage();

		switch (this.currentPage) {
			case "startPage":
				break;
			case "joinPage":
				joinPageObj.initial();
				break;
			case "classPage":
				classPageObj.initial();
				break;
			default: {
			}
		}
	}
}
var mainObj = new Main();
