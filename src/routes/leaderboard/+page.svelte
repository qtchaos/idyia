<script lang="ts">
	import type { PageData } from './$types';
	import KarmaBadge from '$lib/components/KarmaBadge.svelte';

	let { data }: { data: PageData } = $props();

	const medals = ['🥇', '🥈', '🥉'];
</script>

<a href="/" class="text-[12px] text-black/35 hover:text-black transition-colors mb-1 block">← back</a>
<div class="items-baseline gap-4 mb-8">
	<h1 class="text-2xl">Leaderboard</h1>
	<span class="text-[13px] text-black/35">The best of the best that help to keep companies accountable</span>
</div>

{#if data.leaders.length === 0}
	<div class="border border-[#e1e1e1] rounded px-4 py-12 text-center text-[13px] text-black/30">
		No contributors with positive karma yet. Be the first!
	</div>
{:else}
	<div class="border border-[#e1e1e1] rounded overflow-hidden">
		<!-- Header -->
		<div class="grid grid-cols-[40px_1fr_100px_100px] border-b-2 border-[#e1e1e1] bg-white">
			<div class="px-3 py-2 text-[11px] font-semibold text-black/45">#</div>
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45">Name</div>
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Karma</div>
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Submissions</div>
		</div>

		{#each data.leaders as leader, i}
			<div
				class="grid grid-cols-[40px_1fr_100px_100px] {i < data.leaders.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors"
			>
				<div class="px-3 h-10 flex items-center text-[13px] text-black/35">
					{#if i < 3}
						<span>{medals[i]}</span>
					{:else}
						<span class="text-black/25">{i + 1}</span>
					{/if}
				</div>
				<div class="px-4 h-10 flex items-center text-[13px] font-medium truncate">{leader.name}</div>
				<div class="px-4 h-10 flex items-center border-l border-[#e1e1e1]">
					<KarmaBadge karma={leader.karma} />
				</div>
				<div class="px-4 h-10 flex items-center text-[13px] text-black/50 border-l border-[#e1e1e1]">
					{leader.approvedSubmissions}
				</div>
			</div>
		{/each}
	</div>

	<p class="mt-4 text-[11px] text-black/25">
		Only users with positive karma are shown. Karma is earned by getting submissions and alternatives approved.
	</p>
{/if}

<!-- ── CTA ── -->
<div class="mt-8 border border-[#e1e1e1] rounded p-5">
	<p class="text-[13px] font-medium mb-0.5">Want to earn your spot?</p>
	<p class="text-[12px] text-black/40 mb-4">Submit a company or suggest an alternative to earn karma and climb the leaderboard.</p>
	<div class="grid grid-cols-2 gap-3">
		<a href="/submit"
			class="flex flex-col gap-1 px-4 py-3 border border-[#e1e1e1] rounded hover:border-black/25 hover:bg-[#f7f8fa] transition-colors group">
			<span class="text-[13px] font-medium">Submit a company</span>
			<span class="text-[11px] text-black/40">Know a company using AI to replace workers? Add it for review.</span>
		</a>
		<a href="/"
			class="flex flex-col gap-1 px-4 py-3 border border-[#e1e1e1] rounded hover:border-black/25 hover:bg-[#f7f8fa] transition-colors group">
			<span class="text-[13px] font-medium">Suggest an alternative</span>
			<span class="text-[11px] text-black/40">Browse listed companies and propose an AI-free option.</span>
		</a>
	</div>
</div>
