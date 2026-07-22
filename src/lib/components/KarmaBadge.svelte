<script lang="ts">
	let { karma }: { karma: number | null } = $props();

	const score = karma ?? 0;

	const cls = $derived(
		score > 50
			? 'bg-emerald-50 border-emerald-300 text-emerald-700'
			: score > 0
				? 'bg-blue-50 border-blue-200 text-blue-700'
				: score < 0
					? 'bg-red-50 border-red-200 text-red-600'
					: 'bg-[#f5f5f5] border-[#e1e1e1] text-black/40',
	);
</script>

<span
	class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-medium border rounded {cls}"
	title="Karma score"
>
	<span class="opacity-60">✦</span>
	{score}
</span>
