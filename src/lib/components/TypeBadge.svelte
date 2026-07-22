<script lang="ts">
	const palette: Record<string, string> = {
		restaurant:  'bg-amber-100  text-amber-800',
		saas:        'bg-blue-100   text-blue-800',
		government:  'bg-teal-100   text-teal-800',
		institution: 'bg-purple-100 text-purple-800',
		retail:      'bg-yellow-100 text-yellow-800',
		finance:     'bg-indigo-100 text-indigo-800',
		healthcare:  'bg-red-100    text-red-800',
		media:       'bg-pink-100   text-pink-800',
		education:   'bg-cyan-100   text-cyan-800',
		other:       'bg-gray-100   text-gray-600',
	};

	let { type }: { type: string } = $props();

	const cls = $derived(palette[type.toLowerCase()] ?? palette.other);
</script>

<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-none whitespace-nowrap capitalize {cls}">
	{type}
</span>
