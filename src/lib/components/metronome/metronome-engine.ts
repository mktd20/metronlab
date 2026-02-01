export class MetronomeEngine {
	private audioContext: AudioContext | null = null;
	private nextNoteTime = 0;
	private timerId: number | null = null;
	private currentBeat = 0;
	private _isPlaying = false;
	private masterGain: GainNode | null = null;

	bpm = 120;
	beatsPerMeasure = 4;
	volume = 0.5; // 0 to 1
	onBeat: ((beat: number, isAccent: boolean) => void) | null = null;

	private readonly lookahead = 25; // ms
	private readonly scheduleAheadTime = 0.1; // seconds

	get isPlaying() {
		return this._isPlaying;
	}

	async initAudioContext() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			this.masterGain = this.audioContext.createGain();
			this.masterGain.connect(this.audioContext.destination);
			this.masterGain.gain.value = this.volume;
		}
		
		// Resume if suspended (browser autoplay policy)
		if (this.audioContext.state === 'suspended') {
			await this.audioContext.resume();
		}
	}

	async start() {
		if (this._isPlaying) return;
		
		await this.initAudioContext();
		
		if (!this.audioContext || !this.masterGain) return;
		
		this._isPlaying = true;
		this.currentBeat = 0;
		this.nextNoteTime = this.audioContext.currentTime + 0.05;
		this.scheduler();
	}

	stop() {
		this._isPlaying = false;
		if (this.timerId !== null) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}
		this.currentBeat = 0;
	}

	private scheduler() {
		if (!this._isPlaying || !this.audioContext) return;

		while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
			this.scheduleNote(this.nextNoteTime);
			this.advanceNote();
		}

		this.timerId = window.setTimeout(() => this.scheduler(), this.lookahead);
	}

	private scheduleNote(time: number) {
		if (!this.audioContext || !this.masterGain) return;

		const isAccent = this.currentBeat === 0;
		
		// Create click sound using oscillator with envelope
		const osc = this.audioContext.createOscillator();
		const gain = this.audioContext.createGain();

		osc.connect(gain);
		gain.connect(this.masterGain);

		// Higher frequency for accent, lower for regular beats
		osc.frequency.value = isAccent ? 880 : 440;
		osc.type = 'sine';

		// Envelope: quick attack, quick decay
		const attackTime = 0.001;
		const decayTime = 0.05;
		const sustainLevel = 0.1;
		
		gain.gain.setValueAtTime(0, time);
		gain.gain.linearRampToValueAtTime(isAccent ? 0.8 : 0.5, time + attackTime);
		gain.gain.exponentialRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
		gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

		osc.start(time);
		osc.stop(time + 0.1);

		// Fire callback on main thread
		const beat = this.currentBeat;
		const delay = Math.max(0, (time - this.audioContext.currentTime) * 1000);
		setTimeout(() => {
			this.onBeat?.(beat, isAccent);
		}, delay);
	}

	private advanceNote() {
		const secondsPerBeat = 60.0 / this.bpm;
		this.nextNoteTime += secondsPerBeat;
		this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
	}

	setVolume(volume: number) {
		this.volume = Math.max(0, Math.min(1, volume));
		if (this.masterGain) {
			this.masterGain.gain.value = this.volume;
		}
	}

	destroy() {
		this.stop();
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.masterGain = null;
	}
}
