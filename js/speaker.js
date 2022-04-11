class Speaker {
	initial() {
		const speakerInputState = $("#speaker-input");

		speakerInputState.addEventListener("change", (e) => {
			if (e.target.checked) this.on();
			else this.off();
		});
	}

	on() {
		clearInterval(this.funcInterval);

		const allAudioElm = $$("audio");

		allAudioElm.forEach((audioElm) => (audioElm.muted = false));
	}

	off() {
		mute();

		this.funcInterval = setInterval(mute, 100);

		function mute() {
			const allAudioElm = $$("audio");

			allAudioElm.forEach((audioElm) => (audioElm.muted = true));
		}
	}
}
var speakerObj = new Speaker();
