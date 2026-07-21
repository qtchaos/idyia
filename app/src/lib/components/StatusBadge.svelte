<script lang="ts">
	let { status }: { status: 'pending' | 'approved' | 'rejected' } = $props();

	const cls = {
		pending: 'bg-yellow-50 border-yellow-300 text-yellow-800',
		approved: 'bg-green-50 border-green-300 text-green-800',
		rejected: 'bg-red-50 border-red-300 text-red-800',
	};
</script>

<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded capitalize {cls[status]}">
	{status}
</span>
