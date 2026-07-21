<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/state';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
		<h1 class="text-xl font-semibold">Submit a company</h1>
	</div>

	{#if submitted}
		<div class="mb-6 bg-green-50 border border-green-200 rounded px-4 py-3 text-sm text-green-800">
			Submitted! Your entry is pending moderation.
		</div>
	{/if}

	{#if form?.error}
		<p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
			{form.error}
		</p>
	{/if}

	<form method="POST" class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="name"
				>Company name *</label
			>
			<input
				id="name"
				name="name"
				required
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registeredName"
					>Registered name</label
				>
				<input
					id="registeredName"
					name="registeredName"
					placeholder="Acme OÜ"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="registryUrl"
					>Registry URL</label
				>
				<input
					id="registryUrl"
					name="registryUrl"
					type="url"
					placeholder="https://…"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="website"
				>Website *</label
			>
			<input
				id="website"
				name="website"
				type="url"
				required
				placeholder="https://example.com"
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companyType"
				>Company type *</label
			>
			<select
				id="companyType"
				name="companyType"
				required
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white"
			>
				<option value="">Select…</option>
				{#each companyTypes as t}
					<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="companySize"
				>Company size *</label
			>
			<select
				id="companySize"
				name="companySize"
				required
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 bg-white"
			>
				<option value="">Select…</option>
				{#each companySizes as s}
					<option value={s.code}>{s.code} — {s.label}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="description"
				>Description *</label
			>
			<textarea
				id="description"
				name="description"
				required
				rows="3"
				placeholder="e.g. Used AI for generating marketing posters"
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60 resize-none"
			></textarea>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="imageUrl"
					>Image URL</label
				>
				<input
					id="imageUrl"
					name="imageUrl"
					type="url"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium uppercase tracking-wide text-black/50" for="imageOrigin"
					>Image origin</label
				>
				<input
					id="imageOrigin"
					name="imageOrigin"
					placeholder="X post, blog, archive…"
					class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
				/>
			</div>
		</div>

		<button
			type="submit"
			class="mt-2 py-2.5 bg-black text-white text-sm rounded hover:bg-black/80 transition-colors"
		>
			Submit for review
		</button>
	</form>
</main>
