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
	placeholder="Search companies…"
	{value}
	oninput={onInput}
	class="w-full sm:w-72 px-3 py-1.5 text-sm border border-black/20 rounded bg-white placeholder:text-black/30 focus:outline-none focus:border-black/60"
/>
