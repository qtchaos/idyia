<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/state';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// ── search / amend state ──────────────────────────────────────────────────
	type SearchResult = { id: string; name: string; website: string; description: string; imageOrigin: string | null };

	let nameQuery      = $state('');
	let searchResults  = $state<SearchResult[]>([]);
	let showDropdown   = $state(false);
	let selected       = $state<SearchResult | null>(null);
	let searchTimer: ReturnType<typeof setTimeout>;

	function onNameInput(e: Event) {
		nameQuery = (e.target as HTMLInputElement).value;
		selected  = null;
		clearTimeout(searchTimer);
		if (nameQuery.length < 2) { searchResults = []; showDropdown = false; return; }
		searchTimer = setTimeout(async () => {
			const res = await fetch(`/api/companies/search?q=${encodeURIComponent(nameQuery)}`);
			const json = await res.json();
			searchResults = json.companies;
			showDropdown  = searchResults.length > 0;
		}, 300);
	}

	function pick(company: SearchResult) {
		selected     = company;
		nameQuery    = company.name;
		showDropdown = false;
		// pre-fill amend fields with existing values
		amendDescription = company.description;
		amendSource      = company.imageOrigin ?? '';
	}

	function clearSelection() {
		selected          = null;
		nameQuery         = '';
		amendDescription  = '';
		amendSource       = '';
	}

	// amend form fields
	let amendDescription = $state('');
	let amendSource      = $state('');

	// ── new company form ──────────────────────────────────────────────────────
	const companySizes = [
		{ code: 'A', label: 'Self-employed' },
		{ code: 'B', label: '1–10 employees' },
		{ code: 'C', label: '11–50 employees' },
		{ code: 'D', label: '51–200 employees' },
		{ code: 'E', label: '201–500 employees' },
		{ code: 'F', label: '501–1,000 employees' },
		{ code: 'G', label: '1,001–5,000 employees' },
		{ code: 'H', label: '5,001–10,000 employees' },
		{ code: 'I', label: '10,001+ employees' },
	];
	const companyTypes = [
		'restaurant', 'saas', 'government', 'institution',
		'retail', 'finance', 'healthcare', 'media', 'education', 'other',
	];

	const submitted = $derived(page.url.searchParams.get('submitted') === '1');
</script>

<main class="max-w-xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center gap-3 mb-6">
		<a href="/" class="text-sm text-black/40 hover:text-black transition-colors">← Back</a>
		<h1 class="text-xl font-semibold">{selected ? 'Amend company' : 'Submit a company'}</h1>
	</div>

	{#if submitted}
		<div class="mb-6 bg-green-50 border border-green-200 rounded px-4 py-3 text-sm text-green-800">
			Submitted! Your entry is pending moderation.
		</div>
	{/if}

	{#if form?.error}
		<p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{form.error}</p>
	{/if}

	<!-- Company name search -->
	<div class="flex flex-col gap-1 mb-4 relative">
		<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="nameSearch">
			Company name *
		</label>
		<input
			id="nameSearch"
			type="text"
			autocomplete="off"
			value={nameQuery}
			oninput={onNameInput}
			onfocus={() => { if (searchResults.length) showDropdown = true; }}
			onblur={() => setTimeout(() => showDropdown = false, 150)}
			placeholder="Start typing to search or create…"
			class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
		/>

		{#if showDropdown}
			<div class="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-black/15 rounded shadow-lg overflow-hidden">
				{#each searchResults as company}
					<button
						type="button"
						onmousedown={() => pick(company)}
						class="w-full text-left px-3 py-2.5 hover:bg-black/[0.03] border-b border-black/[0.06] last:border-0"
					>
						<div class="text-sm font-medium">{company.name}</div>
						<div class="text-xs text-black/40 truncate">{company.website}</div>
					</button>
				{/each}
				<div class="px-3 py-2 text-xs text-black/30 border-t border-black/[0.06]">
					Not what you're looking for? Fill in the form below to add a new entry.
				</div>
			</div>
		{/if}
	</div>

	<!-- ── AMEND MODE ───────────────────────────────────────────────────────── -->
	{#if selected}
		<div class="mb-4 flex items-center justify-between px-3 py-2 bg-black/[0.03] border border-black/10 rounded text-sm">
			<div>
				Amending <span class="font-medium">{selected.name}</span>
				<a href={selected.website} target="_blank" rel="noopener noreferrer" class="ml-2 text-xs text-black/40 hover:text-black underline">{selected.website}</a>
			</div>
			<button type="button" onclick={clearSelection} class="text-xs text-black/40 hover:text-black ml-4">✕ clear</button>
		</div>

		<form method="POST" action="?/amend" class="flex flex-col gap-4">
			<input type="hidden" name="companyId" value={selected.id} />

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="amendDescription">
					Description
					<span class="normal-case text-black/30 ml-1">(leave blank to keep current)</span>
				</label>
				<div class="text-xs text-black/35 mb-1 px-1">Current: {selected.description}</div>
				<textarea
					id="amendDescription"
					name="description"
					rows="3"
					bind:value={amendDescription}
					placeholder="Proposed new description…"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 resize-none"
				></textarea>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="amendSource">
					Source URL
					<span class="normal-case text-black/30 ml-1">(leave blank to keep current)</span>
				</label>
				{#if selected.imageOrigin}
					<div class="text-xs text-black/35 mb-1 px-1 truncate">Current: {selected.imageOrigin}</div>
				{/if}
				<input
					id="amendSource"
					name="imageOrigin"
					type="url"
					bind:value={amendSource}
					placeholder="https://…"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
				/>
			</div>

			<button type="submit" class="mt-2 py-2.5 bg-black text-white text-sm rounded hover:bg-black/80 transition-colors">
				Submit amendment
			</button>
		</form>

	<!-- ── CREATE MODE ──────────────────────────────────────────────────────── -->
	{:else}
		<form method="POST" action="?/create" class="flex flex-col gap-4">
			<!-- name hidden field so server gets it -->
			<input type="hidden" name="name" value={nameQuery} />

			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registeredName">Registered name</label>
					<input id="registeredName" name="registeredName" placeholder="Acme OÜ"
						class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registryUrl">Registry URL</label>
					<input id="registryUrl" name="registryUrl" type="url" placeholder="https://…"
						class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="website">Website *</label>
				<input id="website" name="website" type="url" required placeholder="https://example.com"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companyType">Type *</label>
					<select id="companyType" name="companyType" required
						class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white">
						<option value="">Select…</option>
						{#each companyTypes as t}
							<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companySize">Size *</label>
					<select id="companySize" name="companySize" required
						class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white">
						<option value="">Select…</option>
						{#each companySizes as s}
							<option value={s.code}>{s.code} — {s.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="description">Description *</label>
				<textarea id="description" name="description" required rows="3"
					placeholder="e.g. Used AI for generating marketing posters"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 resize-none"
				></textarea>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="imageOrigin">Source URL</label>
				<input id="imageOrigin" name="imageOrigin" type="url" placeholder="https://x.com/…, blog post, archive…"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
			</div>

			<button type="submit" class="mt-2 py-2.5 bg-black text-white text-sm rounded hover:bg-black/80 transition-colors">
				Submit for review
			</button>
		</form>
	{/if}
</main>
