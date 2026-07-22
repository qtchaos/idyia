<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let value = $state(page.url.searchParams.get('q') ?? '');
	let timer: ReturnType<typeof setTimeout>;

	function onInput(e: Event) {
		value = (e.target as HTMLInputElement).value;
		clearTimeout(timer);
		timer = setTimeout(() => {
			const params = new URLSearchParams(page.url.searchParams);
			if (value) params.set('q', value);
			else params.delete('q');
			goto(`?${params}`, { replaceState: true, keepFocus: true });
		}, 300);
	}
</script>

<input
	type="search"
	placeholder="Search…"
	{value}
	oninput={onInput}
	class="h-6 w-48 px-2 text-[12px] border border-black/15 rounded bg-white placeholder:text-black/25 focus:outline-none focus:border-black/40"
/>
