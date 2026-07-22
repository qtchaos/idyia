<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import SizeBadge from '$lib/components/SizeBadge.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { CompanySizeCode } from '$lib/server/db/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const company = $derived(data.company);
	const user    = $derived(page.data.user);
	const role    = $derived(page.data.role as string | null);

	// ── SEO ─────────────────────────────────────────────────────────────────
	const descriptionSnippet = $derived(
		company.description.length > 160
			? company.description.slice(0, 157) + '...'
			: company.description
	);
	const pageTitle = $derived(`${company.name} - idyia`);

	// ── Helpers ──────────────────────────────────────────────────────────────
	function hostname(url: string) {
		try { return new URL(url).hostname.replace(/^www\./, ''); }
		catch { return url; }
	}

	function faviconSrc(url: string) {
		try {
			const origin = new URL(url).origin;
			return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(origin) + '&sz=32';
		} catch { return null; }
	}

	// ── Alternatives ─────────────────────────────────────────────────────────
	let faviconLoaded  = $state<Record<string, boolean>>({});
	let faviconErrored = $state<Record<string, boolean>>({});

	const alts = $derived(data.alternatives);

	// Inline edit state
	let editingId = $state<string | null>(null);
	let editUrl   = $state('');
	let editName  = $state('');

	function startEdit(alt: (typeof alts)[number]) {
		editingId = alt.id;
		editUrl   = alt.url;
		editName  = alt.name ?? '';
	}
	function cancelEdit() { editingId = null; }

	// Suggestion state (for non-owners suggesting edits/removal)
	let suggestingId   = $state<string | null>(null);
	let suggestType    = $state<'edit' | 'remove' | null>(null);
	let suggestUrl     = $state('');
	let suggestName    = $state('');
	let suggestNote    = $state('');

	function startSuggestEdit(alt: (typeof alts)[number]) {
		suggestingId = alt.id;
		suggestType  = 'edit';
		suggestUrl   = alt.url;
		suggestName  = alt.name ?? '';
		suggestNote  = '';
	}
	function startSuggestRemove(alt: (typeof alts)[number]) {
		suggestingId = alt.id;
		suggestType  = 'remove';
		suggestNote  = '';
	}
	function cancelSuggest() { suggestingId = null; suggestType = null; }

	// Add form
	let altUrl     = $state('');
	let altName    = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (form?.altSuccess) { altUrl = ''; altName = ''; editingId = null; suggestingId = null; suggestType = null; }
	});

	function canManage() {
		return user && (role === 'moderator' || role === 'admin');
	}

	// ── Copy link ────────────────────────────────────────────────────────────
	let copied = $state(false);
	function copyLink() {
		navigator.clipboard.writeText(window.location.href).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={descriptionSnippet} />
	<meta property="og:type"        content="website" />
	<meta property="og:title"       content={pageTitle} />
	<meta property="og:description" content={descriptionSnippet} />
	{#if company.website}
		<meta property="og:url" content={company.website} />
	{/if}
	<meta name="twitter:card"        content="summary" />
	<meta name="twitter:title"       content={pageTitle} />
	<meta name="twitter:description" content={descriptionSnippet} />
</svelte:head>

<div class="space-y-4 pb-6">

	<a href="/" class="text-[12px] text-black/35 hover:text-black transition-colors">← all companies</a>

	<div class="flex items-start gap-4">
		{#if company.imageUrl}
			<img src={company.imageUrl} alt="{company.name} logo"
				class="w-14 h-14 rounded-lg object-contain border border-[#e1e1e1] bg-white p-1.5 shrink-0" />
		{/if}
		<div class="min-w-0">
			<h1 class="text-2xl font-semibold text-black leading-tight">{company.name}</h1>
			{#if company.registeredName && company.registeredName !== company.name}
				<p class="text-[12px] text-black/40 mt-1">
					Legally registered as
					{#if company.registryUrl}
						<a href={company.registryUrl} target="_blank" rel="noopener noreferrer"
							class="underline underline-offset-2 hover:text-black transition-colors">{company.registeredName}</a>
					{:else}
						<span>{company.registeredName}</span>
					{/if}
				</p>
			{/if}
		</div>
	</div>

	<p class="text-[14px] text-black/70 leading-relaxed">{company.description}</p>

	<div class="flex flex-col gap-2 text-[13px]">
		<div class="flex gap-3 items-center">
			<span class="w-28 shrink-0 text-black/35">Website</span>
			<a href={company.website} target="_blank" rel="noopener noreferrer"
				class="text-black/70 underline underline-offset-2 hover:text-black transition-colors truncate">
				{hostname(company.website)}
			</a>
		</div>

		<div class="flex gap-3 items-center">
			<span class="w-28 shrink-0 text-black/35">Industry</span>
			<TypeBadge type={company.companyType} />
		</div>

		<div class="flex gap-3 items-center">
			<span class="w-28 shrink-0 text-black/35">Employees</span>
			<SizeBadge code={company.companySize as CompanySizeCode} />
		</div>

		{#if company.country}
			<div class="flex gap-3 items-center">
				<span class="w-28 shrink-0 text-black/35">Country</span>
				<span class="text-black/70">{company.country}</span>
			</div>
		{/if}

		{#if company.imageOrigin}
			<div class="flex gap-3 items-baseline">
				<span class="w-28 shrink-0 text-black/35">Evidence</span>
				<a href={company.imageOrigin} target="_blank" rel="noopener noreferrer"
					class="text-black/70 underline underline-offset-2 hover:text-black transition-colors truncate">
					{company.imageOrigin}
				</a>
			</div>
		{/if}
	</div>

	<!-- ── Alternatives ─────────────────────────────────────────────────── -->
	<div>
		<div class="flex items-baseline justify-between mb-2">
			<h2 class="text-[13px] font-semibold text-black">Alternatives</h2>
			<span class="text-[11px] text-black/30">AI-free options in the same space</span>
		</div>

		{#if alts.length === 0}
			<p class="text-[13px] text-black/35 py-3">No alternatives listed yet.</p>
		{:else}
			<div class="border border-[#e8e8e8] rounded-lg overflow-hidden divide-y divide-[#f0f0f0]">
				{#each alts as alt (alt.id)}
					{@const fav = faviconSrc(alt.url)}
					{@const pending = alt.status === 'pending'}

					{#if suggestingId === alt.id && suggestType === 'edit'}
						<!-- ── Suggest edit inline form ────────────────────── -->
						<form
							method="POST"
							action="?/suggestEdit"
							use:enhance={() => {
								submitting = true;
								return async ({ update }) => { await update(); submitting = false; };
							}}
							class="flex flex-col gap-2 px-3 py-2.5 bg-[#fafafa] border-b border-[#e8e8e8]"
						>
							<input type="hidden" name="id" value={alt.id} />
							<div class="flex items-center gap-2">
								<input
									name="name"
									bind:value={suggestName}
									placeholder="Name (optional)"
									class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white w-32 shrink-0"
								/>
								<input
									name="url"
									bind:value={suggestUrl}
									type="url"
									required
									class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white flex-1 min-w-0"
								/>
							</div>
							<div class="flex items-center gap-2">
								<input
									name="note"
									bind:value={suggestNote}
									placeholder="Reason for this change (required)"
									required
									class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white flex-1 min-w-0"
								/>
								<button type="submit" disabled={submitting}
									class="h-7 px-2.5 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors shrink-0 disabled:opacity-50">
									Submit
								</button>
								<button type="button" onclick={cancelSuggest}
									class="h-7 px-2.5 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors shrink-0 text-black/50">
									Cancel
								</button>
							</div>
						</form>
					{:else if suggestingId === alt.id && suggestType === 'remove'}
						<!-- ── Suggest removal inline form ─────────────────── -->
						<form
							method="POST"
							action="?/suggestRemove"
							use:enhance={() => {
								submitting = true;
								return async ({ update }) => { await update(); submitting = false; };
							}}
							class="flex items-center gap-2 px-3 py-2.5 bg-red-50/50 border-b border-red-100"
						>
							<input type="hidden" name="id" value={alt.id} />
							<span class="text-[12px] text-black/50 shrink-0">Reason:</span>
							<input
								name="note"
								bind:value={suggestNote}
								placeholder="Why should this alternative be removed? (required)"
								required
								class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white flex-1 min-w-0"
							/>
							<button type="submit" disabled={submitting}
								class="h-7 px-2.5 text-[11px] bg-red-500 text-white rounded hover:bg-red-600 transition-colors shrink-0 disabled:opacity-50">
								Submit
							</button>
							<button type="button" onclick={cancelSuggest}
								class="h-7 px-2.5 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors shrink-0 text-black/50">
								Cancel
							</button>
						</form>
					{:else if editingId === alt.id}
						<!-- ── Inline edit row ─────────────────────────────── -->
						<form
							method="POST"
							action="?/editAlternative"
							use:enhance={() => {
								submitting = true;
								return async ({ update }) => { await update(); submitting = false; };
							}}
							class="flex items-center gap-2 px-3 py-2"
						>
							<input type="hidden" name="id" value={alt.id} />
							<input
								name="name"
								bind:value={editName}
								placeholder="Name (optional)"
								class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white w-32 shrink-0"
							/>
							<input
								name="url"
								bind:value={editUrl}
								type="url"
								required
								class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white flex-1 min-w-0"
							/>
							<button type="submit" disabled={submitting}
								class="h-7 px-2.5 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors shrink-0 disabled:opacity-50">
								Save
							</button>
							<button type="button" onclick={cancelEdit}
								class="h-7 px-2.5 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors shrink-0 text-black/50">
								Cancel
							</button>
						</form>
					{:else}
						<!-- ── Normal row ──────────────────────────────────── -->
						<div class="flex items-center gap-3 px-3 py-2.5 group" class:opacity-50={pending}>
							<!-- Favicon -->
							<span class="w-5 h-5 shrink-0 flex items-center justify-center">
								{#if fav}
									<img src={fav} alt="" width="16" height="16" class="rounded-sm"
										class:hidden={!faviconLoaded[alt.id] || faviconErrored[alt.id]}
										onload={() => { faviconLoaded[alt.id] = true; }}
										onerror={() => { faviconErrored[alt.id] = true; }}
									/>
									{#if !faviconLoaded[alt.id] || faviconErrored[alt.id]}
										<span class="w-4 h-4 rounded-sm bg-[#e8e8e8]"></span>
									{/if}
								{:else}
									<span class="w-4 h-4 rounded-sm bg-[#e8e8e8]"></span>
								{/if}
							</span>

							<!-- Name / URL — clicking opens the link -->
							<a href={alt.url} target="_blank" rel="noopener noreferrer"
								class="min-w-0 flex-1 hover:underline underline-offset-2">
								{#if alt.name}
									<span class="block text-[13px] font-medium text-black truncate">{alt.name}</span>
									<span class="block text-[11px] text-black/40 truncate">{hostname(alt.url)}</span>
								{:else}
									<span class="block text-[13px] text-black/70 truncate">{hostname(alt.url)}</span>
								{/if}
							</a>

							<!-- Pending badge -->
							{#if pending}
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium shrink-0">
									pending
								</span>
							{/if}

							<!-- Edit / Delete (mod/admin only) -->
							{#if canManage()}
								<div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
									<button type="button" onclick={() => startEdit(alt)}
										class="h-6 px-2 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors text-black/50">
										edit
									</button>
									<form method="POST" action="?/deleteAlternative"
										use:enhance={() => {
											submitting = true;
											return async ({ update }) => { await update(); submitting = false; };
										}}
										onsubmit={(e) => { if (!confirm('Remove this alternative?')) e.preventDefault(); }}
									>
										<input type="hidden" name="id" value={alt.id} />
										<button type="submit"
											class="h-6 px-2 text-[11px] border border-red-200 rounded hover:bg-red-50 transition-colors text-red-500">
											×
										</button>
									</form>
								</div>
							{:else if user}
								<!-- Suggest edit / remove (logged-in non-owners) -->
								<div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
									<button type="button" onclick={() => startSuggestEdit(alt)}
										class="h-6 px-2 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors text-black/50">
										suggest edit
									</button>
									<button type="button" onclick={() => startSuggestRemove(alt)}
										class="h-6 px-2 text-[11px] border border-red-200 rounded hover:bg-red-50 transition-colors text-red-400">
										suggest ×
									</button>
								</div>
							{:else}
								<span class="text-[11px] text-black/20 group-hover:text-black/40 transition-colors shrink-0">↗</span>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- Add alternative form -->
		{#if user}
			<form
				method="POST"
				action="?/addAlternative"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => { await update(); submitting = false; };
				}}
				class="mt-3 flex gap-2"
			>
				<input name="name" bind:value={altName} placeholder="Name (optional)"
					class="h-8 px-2.5 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white w-36 shrink-0" />
				<input name="url" bind:value={altUrl} placeholder="https://alternative.com"
					type="url" required
					class="h-8 px-2.5 text-[12px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white flex-1 min-w-0" />
				<button type="submit" disabled={submitting}
					class="h-8 px-3 text-[12px] bg-black text-white rounded hover:bg-black/75 transition-colors shrink-0 disabled:opacity-50">
					Add
				</button>
			</form>
			{#if form?.altError}
				<p class="mt-1.5 text-[12px] text-red-600">{form.altError}</p>
			{/if}
		{:else}
			<p class="mt-3 text-[12px] text-black/35">
				<a href="/auth/login" class="underline underline-offset-2 hover:text-black transition-colors">Sign in</a>
				to suggest an alternative.
			</p>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class="border border-[#e8e8e8] rounded-lg px-4 py-3">
			<p class="text-[13px] font-semibold text-black">Avoid {company.name}</p>
			<p class="text-[12px] text-black/45 mt-1 mb-3 leading-relaxed">
				Delete your accounts or share with your friends to spread the message.
			</p>
			<div class="flex items-center gap-2">
				<button onclick={copyLink}
					class="h-7 px-3 text-[11px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors text-black/60">
					{copied ? '✓ copied' : 'share'}
				</button>
			</div>
		</div>

		<div class="border border-[#e8e8e8] rounded-lg px-4 py-3">
			<p class="text-[13px] font-semibold text-black">Something wrong?</p>
			<p class="text-[12px] text-black/45 mt-1 mb-3 leading-relaxed">
				Correct the description, add a source, or submit a new company.
			</p>
			<a href="/submit?company={company.id}"
				class="inline-flex h-7 px-3 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors items-center">
				{user ? 'Amend entry' : 'Contribute'}
			</a>
		</div>
	</div>

</div>
