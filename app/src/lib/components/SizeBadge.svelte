<script lang="ts">
	import type { CompanySizeCode } from '$lib/server/db/schema';

	const palette: Record<CompanySizeCode, string> = {
		A: 'bg-gray-100   text-gray-600',
		B: 'bg-sky-100    text-sky-700',
		C: 'bg-blue-100   text-blue-700',
		D: 'bg-indigo-100 text-indigo-700',
		E: 'bg-violet-100 text-violet-700',
		F: 'bg-purple-100 text-purple-700',
		G: 'bg-fuchsia-100 text-fuchsia-700',
		H: 'bg-rose-100   text-rose-700',
		I: 'bg-red-100    text-red-700',
	};

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

<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none whitespace-nowrap {palette[code]}">
	{code} · {labels[code]}
</span>
