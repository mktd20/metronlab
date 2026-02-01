<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Metronome from './Metronome.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();
	let bpm = $state(120);
	let isPlaying = $state(false);
</script>

<Modal {open} {onClose} title="메트로놈">
	<div class="py-4">
		<Metronome bind:bpm bind:isPlaying />
	</div>
</Modal>
