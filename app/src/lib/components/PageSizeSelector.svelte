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

<div class="flex items-center gap-0.5">
	{#each sizes as n}
		<button
			onclick={() => select(n)}
			class="h-6 px-2 text-[11px] font-mono border rounded transition-colors {current === n
				? 'bg-black text-white border-black'
				: 'border-black/15 text-black/50 hover:border-black/40 hover:text-black'}"
		>{n}</button>
	{/each}
</div>
