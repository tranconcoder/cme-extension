class Navigation {
	joinPageElm = () => $(classSelectorsObj.JOIN_PAGE_SIGNAL_ELM);
	classPageElm = () => $(classSelectorsObj.CLASS_PAGE_SIGNAL_ELM);
	startPageElm = () => $(classSelectorsObj.START_PAGE_SIGNAL_ELM);

	async getCurrentPage() {
		if (this.joinPageElm()) return "joinPage";
		if (this.classPageElm()) return "classPage";
		if (this.startPageElm()) return "startPage";

		await generalMethods.sleep(100);
		return this.getCurrentPage();
	}
}
var navigationObj = new Navigation();
