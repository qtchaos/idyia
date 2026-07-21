<script lang="ts">
	import type { CompanySizeCode } from '$lib/server/db/schema';

	const labels: Record<CompanySizeCode, string> = {
		A: 'Self-employed',
		B: '1–10',
		C: '11–50',
		D: '51–200',
		E: '201–500',
		F: '501–1K',
		G: '1K–5K',
		H: '5K–10K',
		I: '10K+',
	};

	let { code }: { code: CompanySizeCode } = $props();
</script>

<span
	class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono border border-black/15 bg-black/[0.03] rounded"
>
	<span class="font-semibold">{code}</span>
	<span class="text-black/50">·</span>
	<span>{labels[code]}</span>
</span>
