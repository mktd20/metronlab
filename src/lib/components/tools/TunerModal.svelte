<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Tuner from './Tuner.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();
</script>

<Modal {open} {onClose} title="조율기">
	<div class="py-4">
		<Tuner />
	</div>
</Modal>
