<script lang="ts">
	let { size = 'sm' }: { size?: 'sm' | 'md' } = $props();
</script>

{#if size === 'md'}
	<span class="inline-flex items-center gap-1.5 select-none">
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect width="6" height="6" fill="currentColor" />
			<rect x="8" y="8" width="6" height="6" fill="currentColor" opacity="0.3" />
		</svg>
		<span style="font-family:'Instrument Sans Variable',sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:1rem;">idyia</span>
	</span>
{:else}
	<span class="inline-flex items-center gap-1 select-none">
		<svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect width="6" height="6" fill="currentColor" />
			<rect x="8" y="8" width="6" height="6" fill="currentColor" opacity="0.3" />
		</svg>
		<span style="font-family:'Instrument Sans Variable',sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:0.875rem;">idyia</span>
	</span>
{/if}
