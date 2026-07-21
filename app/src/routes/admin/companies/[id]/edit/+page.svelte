<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = $derived(data.company);

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
</script>

<main class="max-w-xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin/pending" class="text-sm text-black/40 hover:text-black transition-colors">← Back</a>
		<h1 class="text-xl font-semibold">Edit company</h1>
	</div>

	<form method="POST" class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="name">Company name *</label>
			<input id="name" name="name" required value={c.name}
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registeredName">Registered name</label>
				<input id="registeredName" name="registeredName" value={c.registeredName ?? ''}
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registryUrl">Registry URL</label>
				<input id="registryUrl" name="registryUrl" type="url" value={c.registryUrl ?? ''}
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="website">Website *</label>
			<input id="website" name="website" type="url" required value={c.website}
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companyType">Company type *</label>
				<select id="companyType" name="companyType" required
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white">
					{#each companyTypes as t}
						<option value={t} selected={c.companyType === t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companySize">Company size *</label>
				<select id="companySize" name="companySize" required
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white">
					{#each companySizes as s}
						<option value={s.code} selected={c.companySize === s.code}>{s.code} — {s.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="description">Description *</label>
			<textarea id="description" name="description" required rows="3"
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 resize-none"
			>{c.description}</textarea>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="imageOrigin">Source URL</label>
			<input id="imageOrigin" name="imageOrigin" type="url" value={c.imageOrigin ?? ''}
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60" />
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="status">Status</label>
			<select id="status" name="status"
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white">
				{#each ['pending', 'approved', 'rejected'] as s}
					<option value={s} selected={c.status === s}>{s}</option>
				{/each}
			</select>
		</div>

		<div class="flex gap-3 mt-2">
			<button type="submit"
				class="flex-1 py-2.5 bg-black text-white text-sm rounded hover:bg-black/80 transition-colors">
				Save changes
			</button>
			<a href="/admin/pending"
				class="px-4 py-2.5 border border-black/20 rounded text-sm hover:bg-black/5 transition-colors">
				Cancel
			</a>
		</div>
	</form>
</main>
