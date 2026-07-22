<script lang="ts">
	import type { PageData } from './$types';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();

	const total = $derived(data.pending.length + data.amendments.length);
</script>


	<!-- Header -->
	<a href="/admin" class="text-[12px] text-black/35 hover:text-black transition-colors mb-1 block">← back</a>
	<div class="flex items-baseline gap-4 mb-8">
<h1 class="text-2xl">Pending</h1>
		{#if total > 0}
			<span class="text-[13px] text-black/35">{total} item{total === 1 ? '' : 's'}</span>
		{/if}
	</div>

	{#if total === 0}
		<div class="border border-[#e1e1e1] rounded px-4 py-12 text-center text-[13px] text-black/30">
			Nothing pending.
		</div>
	{/if}

	<!-- New submissions -->
	{#if data.pending.length > 0}
		<div class="mb-10">
			<div class="flex items-center gap-3 mb-3">
				<h2 class="text-[13px] font-semibold text-black/50">New submissions</h2>
				<span class="text-[11px] text-black/25">{data.pending.length}</span>
			</div>

			<div class="border border-[#e1e1e1] rounded overflow-hidden">
				{#each data.pending as company, i}
					<div class="px-4 py-4 {i < data.pending.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2 mb-2">
									<span class="text-[13px] font-medium">{company.name}</span>
									<TypeBadge type={company.companyType} />
									<StatusBadge status={company.status} />
								</div>
								<p class="text-[13px] text-black/55 leading-relaxed mb-2">{company.description}</p>
								<a href={company.website} target="_blank" rel="noopener noreferrer"
									class="text-[12px] text-black/35 hover:text-black underline underline-offset-2"
								>{company.website}</a>
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<a href="/admin/companies/{company.id}/edit"
									class="h-7 px-3 flex items-center text-[12px] border border-[#e1e1e1] rounded hover:bg-[#f0f0f0] transition-colors">
									Edit
								</a>
								<form method="POST" action="?/rejectCompany">
									<input type="hidden" name="id" value={company.id} />
									<button type="submit"
										class="h-7 px-3 text-[12px] border border-[#e1e1e1] rounded hover:bg-[#f0f0f0] transition-colors">
										Reject
									</button>
								</form>
								<form method="POST" action="?/approveCompany">
									<input type="hidden" name="id" value={company.id} />
									<button type="submit"
										class="h-7 px-3 text-[12px] bg-black text-white rounded hover:bg-black/80 transition-colors">
										Approve
									</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Amendments -->
	{#if data.amendments.length > 0}
		<div>
			<div class="flex items-center gap-3 mb-3">
				<h2 class="text-[13px] font-semibold text-black/50">Amendments</h2>
				<span class="text-[11px] text-black/25">{data.amendments.length}</span>
			</div>

			<div class="flex flex-col gap-3">
				{#each data.amendments as row}
					{@const a = row.amendment}
					<div class="border border-[#e1e1e1] rounded overflow-hidden">

						<!-- Amendment header -->
						<div class="flex items-center justify-between px-4 py-3 border-b border-[#e1e1e1] bg-[#fafafa]">
							<div class="flex items-center gap-2 min-w-0">
								<span class="text-[13px] font-medium">{row.companyName}</span>
								<a href={row.companyWebsite} target="_blank" rel="noopener noreferrer"
									class="text-[11px] text-black/30 hover:text-black underline shrink-0">{row.companyWebsite}</a>
								{#if row.submitterName}
									<span class="text-[11px] text-black/25">· by {row.submitterName}</span>
								{/if}
							</div>
							<div class="flex items-center gap-2 shrink-0 ml-4">
								<form method="POST" action="?/rejectAmendment">
									<input type="hidden" name="id" value={a.id} />
									<button type="submit"
										class="h-7 px-3 text-[12px] border border-[#e1e1e1] rounded hover:bg-[#f0f0f0] transition-colors">
										Reject
									</button>
								</form>
								<form method="POST" action="?/approveAmendment">
									<input type="hidden" name="id" value={a.id} />
									<button type="submit"
										class="h-7 px-3 text-[12px] bg-black text-white rounded hover:bg-black/80 transition-colors">
										Approve
									</button>
								</form>
							</div>
						</div>

						<!-- Before / after diff -->
						{#if a.descriptionAfter !== null}
							<div class="grid grid-cols-2 divide-x divide-[#e1e1e1]">
								<p class="text-[11px] text-black/30 mb-2">Before</p>
								<p class="text-[13px] text-black/55 leading-relaxed">{a.descriptionBefore}</p>
							</div>
							<div class="px-4 py-3 bg-[#f6fdf7]">
								<p class="text-[11px] text-black/30 mb-2">After</p>
								<p class="text-[13px] text-black/80 leading-relaxed">{a.descriptionAfter}</p>
							</div>
						{/if}

						{#if a.imageOriginAfter !== null}
							<div class="grid grid-cols-2 divide-x divide-[#e1e1e1] border-t border-[#e1e1e1]">
								<p class="text-[11px] text-black/30 mb-2">Source - before</p>
								{#if a.imageOriginBefore}
									<a href={a.imageOriginBefore} target="_blank" rel="noopener noreferrer"
										class="text-[13px] text-black/45 underline underline-offset-2 hover:text-black break-all"
									>{a.imageOriginBefore}</a>
								{:else}
									<span class="text-[13px] text-black/20">-</span>
								{/if}
							</div>
							<div class="px-4 py-3 bg-[#f6fdf7]">
								<p class="text-[11px] text-black/30 mb-2">Source - after</p>
								<a href={a.imageOriginAfter} target="_blank" rel="noopener noreferrer"
									class="text-[13px] text-black/70 underline underline-offset-2 hover:text-black break-all"
								>{a.imageOriginAfter}</a>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
