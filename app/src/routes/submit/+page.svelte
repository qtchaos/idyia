<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/state';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type SearchResult = { id: string; name: string; website: string; description: string; imageOrigin: string | null };

	let nameQuery     = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let showDropdown  = $state(false);
	let selected      = $state<SearchResult | null>(null);
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

	let amendDescription = $state('');
	let amendSource      = $state('');

	function pick(company: SearchResult) {
		selected          = company;
		nameQuery         = company.name;
		showDropdown      = false;
		amendDescription  = company.description;
		amendSource       = company.imageOrigin ?? '';
	}

	function clearSelection() {
		selected = null; nameQuery = ''; amendDescription = ''; amendSource = '';
	}

	const companySizes = [
		{ code: 'A', label: 'Self-employed' }, { code: 'B', label: '1–10' },
		{ code: 'C', label: '11–50' },         { code: 'D', label: '51–200' },
		{ code: 'E', label: '201–500' },        { code: 'F', label: '501–1,000' },
		{ code: 'G', label: '1,001–5,000' },    { code: 'H', label: '5,001–10,000' },
		{ code: 'I', label: '10,001+' },
	];
	const companyTypes = ['restaurant','saas','government','institution','retail','finance','healthcare','media','education','other'];

	const submitted = $derived(page.url.searchParams.get('submitted') === '1');

	const inputCls = 'h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white w-full';
	const labelCls = 'text-[12px] font-medium text-black/50';
	const fieldCls = 'flex flex-col gap-1.5';
</script>

<div class="max-w-lg mx-auto px-4 py-10">
	<div class="flex items-center gap-4 mb-8">
		<a href="/" class="text-[13px] text-black/35 hover:text-black transition-colors">← back</a>
		<h1 class="text-2xl">{selected ? 'Amend entry' : 'Submit a company'}</h1>
	</div>

	{#if submitted}
		<div class="mb-6 px-4 py-3 border border-[#e1e1e1] rounded bg-[#f7f8fa] text-[13px] text-black/60">
			Submitted — your entry is pending moderation.
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 px-4 py-3 border border-red-200 bg-red-50 rounded text-[13px] text-red-700">{form.error}</div>
	{/if}

	<!-- Company name search — always visible -->
	<div class="{fieldCls} relative mb-6">
		<label for="nameSearch" class={labelCls}>Company name</label>
		<input id="nameSearch" type="text" autocomplete="off" value={nameQuery} oninput={onNameInput}
			onfocus={() => { if (searchResults.length) showDropdown = true; }}
			onblur={() => setTimeout(() => showDropdown = false, 150)}
			placeholder="Type to search existing or add new…"
			class={inputCls} />

		{#if showDropdown}
			<div class="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-[#e1e1e1] rounded shadow-lg overflow-hidden">
				{#each searchResults as c}
					<button type="button" onmousedown={() => pick(c)}
						class="w-full text-left px-3 py-2.5 hover:bg-[#f7f8fa] border-b border-[#e1e1e1] last:border-0">
						<div class="text-[13px] font-medium">{c.name}</div>
						<div class="text-[11px] text-black/35 truncate">{c.website}</div>
					</button>
				{/each}
				<div class="px-3 py-2 text-[11px] text-black/30 border-t border-[#e1e1e1] bg-[#fafafa]">
					Not found? Fill the form below to add a new entry.
				</div>
			</div>
		{/if}
	</div>

	<!-- ── AMEND ─────────────────────────────────────────────────────────── -->
	{#if selected}
		<div class="mb-6 flex items-center justify-between px-3 py-2.5 border border-[#e1e1e1] rounded bg-[#fafafa] text-[13px]">
			<div class="min-w-0">
				<span class="font-medium">{selected.name}</span>
				<a href={selected.website} target="_blank" rel="noopener noreferrer"
					class="ml-2 text-[11px] text-black/35 hover:text-black underline">{selected.website}</a>
			</div>
			<button type="button" onclick={clearSelection} class="ml-4 text-[11px] text-black/35 hover:text-black shrink-0">✕ clear</button>
		</div>

		<form method="POST" action="?/amend" class="flex flex-col gap-5">
			<input type="hidden" name="companyId" value={selected.id} />

			<div class={fieldCls}>
				<label for="amendDesc" class={labelCls}>
					Description
					<span class="font-normal text-black/30 ml-1">— leave blank to keep current</span>
				</label>
				<div class="px-3 py-2.5 border border-[#e1e1e1] rounded bg-[#fafafa] text-[12px] text-black/45 leading-relaxed mb-1">
					{selected.description}
				</div>
				<textarea id="amendDesc" name="description" rows="3" bind:value={amendDescription}
					placeholder="Proposed new description…"
					class="px-3 py-2.5 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 resize-none bg-white"></textarea>
			</div>

			<div class={fieldCls}>
				<label for="amendSrc" class={labelCls}>
					Source URL
					<span class="font-normal text-black/30 ml-1">— leave blank to keep current</span>
				</label>
				{#if selected.imageOrigin}
					<div class="px-3 py-2 border border-[#e1e1e1] rounded bg-[#fafafa] text-[12px] text-black/45 truncate mb-1">{selected.imageOrigin}</div>
				{/if}
				<input id="amendSrc" name="imageOrigin" type="url" bind:value={amendSource}
					placeholder="https://…" class={inputCls} />
			</div>

			<button type="submit" class="h-9 bg-black text-white text-[13px] rounded hover:bg-black/80 transition-colors">
				Submit amendment
			</button>
		</form>

	<!-- ── CREATE ────────────────────────────────────────────────────────── -->
	{:else}
		<form method="POST" action="?/create" class="flex flex-col gap-5">
			<input type="hidden" name="name" value={nameQuery} />

			<div class="grid grid-cols-2 gap-3">
				<div class={fieldCls}>
					<label for="registeredName" class={labelCls}>Registered name</label>
					<input id="registeredName" name="registeredName" placeholder="Acme OÜ" class={inputCls} />
				</div>
				<div class={fieldCls}>
					<label for="registryUrl" class={labelCls}>Registry URL</label>
					<input id="registryUrl" name="registryUrl" type="url" placeholder="https://…" class={inputCls} />
				</div>
			</div>

			<div class={fieldCls}>
				<label for="website" class={labelCls}>Website</label>
				<input id="website" name="website" type="url" required placeholder="https://example.com" class={inputCls} />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class={fieldCls}>
					<label for="companyType" class={labelCls}>Type</label>
					<select id="companyType" name="companyType" required
						class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white">
						<option value="">Select…</option>
						{#each companyTypes as t}
							<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
						{/each}
					</select>
				</div>
				<div class={fieldCls}>
					<label for="companySize" class={labelCls}>Size</label>
					<select id="companySize" name="companySize" required
						class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white">
						<option value="">Select…</option>
						{#each companySizes as s}
							<option value={s.code}>{s.code} — {s.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class={fieldCls}>
				<label for="description" class={labelCls}>Description</label>
				<textarea id="description" name="description" required rows="3"
					placeholder="e.g. Used AI for generating marketing posters"
					class="px-3 py-2.5 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 resize-none bg-white"></textarea>
			</div>

			<div class={fieldCls}>
				<label for="imageOrigin" class={labelCls}>Source URL</label>
				<input id="imageOrigin" name="imageOrigin" type="url"
					placeholder="https://x.com/… , blog post, archive…" class={inputCls} />
			</div>

			<button type="submit" class="h-9 bg-black text-white text-[13px] rounded hover:bg-black/80 transition-colors">
				Submit for review
			</button>
		</form>
	{/if}
</div>
