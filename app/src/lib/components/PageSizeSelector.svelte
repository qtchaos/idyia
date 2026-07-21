<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const sizes = [10, 50, 100];
	let current = $state(Number(page.url.searchParams.get('limit') ?? '50'));

	function select(n: number) {
		current = n;
		const params = new URLSearchParams(page.url.searchParams);
		params.set('limit', String(n));
		goto(`?${params}`, { replaceState: true });
	}
</script>

<div class="flex items-center gap-1 text-sm">
	<span class="text-black/40 mr-1 text-xs">Show</span>
	{#each sizes as n}
		<button
			onclick={() => select(n)}
			class="px-2 py-1 border rounded text-xs font-mono transition-colors {current === n
				? 'bg-black text-white border-black'
				: 'border-black/20 hover:border-black/50'}"
		>{n}</button>
	{/each}
</div>
