<script lang="ts">
	import Logo from './Logo.svelte';
</script>

<footer class="w-full border-t border-[#e1e1e1] px-4 py-3 flex items-center justify-between">
	<a href="/"><Logo /></a>
	<div class="flex items-center gap-4 text-[11px] text-black/30">
		<span>built by humans.</span>
		<span class="text-black/15">·</span>
		<a href="/auth/register" class="hover:text-black transition-colors">join us</a>
	</div>
</footer>
