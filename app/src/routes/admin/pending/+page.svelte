<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';

	let { data }: { data: PageData } = $props();
</script>

<main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center gap-3 mb-8">
		<a href="/admin" class="text-sm text-black/40 hover:text-black transition-colors">← Admin</a>
		<h1 class="text-xl font-semibold">Pending</h1>
		<span class="ml-auto text-sm text-black/30">
			{data.pending.length} new · {data.amendments.length} amendments
		</span>
	</div>

	<!-- ── New submissions ──────────────────────────────────────────────────── -->
	{#if data.pending.length > 0}
		<h2 class="text-xs font-semibold uppercase tracking-wide text-black/40 mb-3">New submissions</h2>
		<div class="flex flex-col gap-3 mb-10">
			{#each data.pending as company}
				<div class="border border-black/10 rounded-lg p-4">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2 mb-1.5">
								<span class="font-medium">{company.name}</span>
								<TypeBadge type={company.companyType} />
								<StatusBadge status={company.status} />
							</div>
							<p class="text-sm text-black/60 mb-2">{company.description}</p>
							<a href={company.website} target="_blank" rel="noopener noreferrer"
								class="text-xs text-black/40 hover:text-black underline underline-offset-2"
							>{company.website}</a>
						</div>
						<div class="flex gap-2 shrink-0">
							<form method="POST" action="?/approveCompany">
								<input type="hidden" name="id" value={company.id} />
								<button type="submit" class="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-black/80 transition-colors">Approve</button>
							</form>
							<form method="POST" action="?/rejectCompany">
								<input type="hidden" name="id" value={company.id} />
								<button type="submit" class="px-3 py-1.5 text-xs border border-black/20 rounded hover:bg-black/5 transition-colors">Reject</button>
							</form>
							<a href="/admin/companies/{company.id}/edit"
								class="px-3 py-1.5 text-xs border border-black/20 rounded hover:bg-black/5 transition-colors">Edit</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- ── Amendments ──────────────────────────────────────────────────────── -->
	{#if data.amendments.length > 0}
		<h2 class="text-xs font-semibold uppercase tracking-wide text-black/40 mb-3">Amendments</h2>
		<div class="flex flex-col gap-3">
			{#each data.amendments as row}
				{@const a = row.amendment}
				<div class="border border-black/10 rounded-lg overflow-hidden">
					<!-- Header -->
					<div class="flex items-center justify-between px-4 py-2.5 bg-black/[0.02] border-b border-black/[0.07]">
						<div class="flex items-center gap-2">
							<span class="text-sm font-medium">{row.companyName}</span>
							<a href={row.companyWebsite} target="_blank" rel="noopener noreferrer"
								class="text-xs text-black/35 hover:text-black underline">{row.companyWebsite}</a>
						</div>
						<div class="flex items-center gap-3">
							{#if row.submitterName}
								<span class="text-xs text-black/30">by {row.submitterName}</span>
							{/if}
							<div class="flex gap-2">
								<form method="POST" action="?/approveAmendment">
									<input type="hidden" name="id" value={a.id} />
									<button type="submit" class="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-black/80 transition-colors">Approve</button>
								</form>
								<form method="POST" action="?/rejectAmendment">
									<input type="hidden" name="id" value={a.id} />
									<button type="submit" class="px-3 py-1.5 text-xs border border-black/20 rounded hover:bg-black/5 transition-colors">Reject</button>
								</form>
							</div>
						</div>
					</div>

					<!-- Before / After diff -->
					<div class="divide-y divide-black/[0.06]">
						{#if a.descriptionAfter !== null}
							<div class="grid grid-cols-2 divide-x divide-black/[0.06]">
								<div class="px-4 py-3">
									<p class="text-[10px] text-black/30 uppercase tracking-wide mb-1.5">Description — before</p>
									<p class="text-[13px] text-black/60 leading-relaxed">{a.descriptionBefore}</p>
								</div>
								<div class="px-4 py-3 bg-green-50/60">
									<p class="text-[10px] text-green-700/60 uppercase tracking-wide mb-1.5">Description — after</p>
									<p class="text-[13px] text-black/80 leading-relaxed">{a.descriptionAfter}</p>
								</div>
							</div>
						{/if}

						{#if a.imageOriginAfter !== null}
							<div class="grid grid-cols-2 divide-x divide-black/[0.06]">
								<div class="px-4 py-3">
									<p class="text-[10px] text-black/30 uppercase tracking-wide mb-1.5">Source — before</p>
									{#if a.imageOriginBefore}
										<a href={a.imageOriginBefore} target="_blank" rel="noopener noreferrer"
											class="text-[13px] text-black/50 underline underline-offset-2 hover:text-black break-all"
										>{a.imageOriginBefore}</a>
									{:else}
										<span class="text-[13px] text-black/20">—</span>
									{/if}
								</div>
								<div class="px-4 py-3 bg-green-50/60">
									<p class="text-[10px] text-green-700/60 uppercase tracking-wide mb-1.5">Source — after</p>
									<a href={a.imageOriginAfter} target="_blank" rel="noopener noreferrer"
										class="text-[13px] text-black/70 underline underline-offset-2 hover:text-black break-all"
									>{a.imageOriginAfter}</a>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if data.pending.length === 0 && data.amendments.length === 0}
		<p class="text-sm text-black/30 py-8 text-center">Nothing pending.</p>
	{/if}
</main>
