<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = $derived(data.company);

	const companySizes = [
		{ code: 'A', label: 'Self-employed' }, { code: 'B', label: '1–10' },
		{ code: 'C', label: '11–50' },         { code: 'D', label: '51–200' },
		{ code: 'E', label: '201–500' },        { code: 'F', label: '501–1,000' },
		{ code: 'G', label: '1,001–5,000' },    { code: 'H', label: '5,001–10,000' },
		{ code: 'I', label: '10,001+' },
	];
	const companyTypes = ['restaurant','saas','government','institution','retail','finance','healthcare','media','education','other'];

	const inputCls = 'h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white w-full';
	const labelCls = 'text-[12px] font-medium text-black/50';
	const fieldCls = 'flex flex-col gap-1.5';
</script>

	<div class="flex items-baseline gap-4 mb-8">
		<h1 class="text-2xl">Edit entry</h1>
		<span class="text-[13px] text-black/35 truncate max-w-xs">{c.name}</span>
	</div>

	<form method="POST" class="flex flex-col gap-5">

		<div class={fieldCls}>
			<label for="name" class={labelCls}>Company name</label>
			<input id="name" name="name" required value={c.name} class={inputCls} />
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class={fieldCls}>
				<label for="registeredName" class={labelCls}>Registered name</label>
				<input id="registeredName" name="registeredName" value={c.registeredName ?? ''} class={inputCls} />
			</div>
			<div class={fieldCls}>
				<label for="registryUrl" class={labelCls}>Registry URL</label>
				<input id="registryUrl" name="registryUrl" type="url" value={c.registryUrl ?? ''} class={inputCls} />
			</div>
		</div>

		<div class={fieldCls}>
			<label for="website" class={labelCls}>Website</label>
			<input id="website" name="website" type="url" required value={c.website} class={inputCls} />
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class={fieldCls}>
				<label for="companyType" class={labelCls}>Type</label>
				<select id="companyType" name="companyType" required
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white">
					{#each companyTypes as t}
						<option value={t} selected={c.companyType === t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
					{/each}
				</select>
			</div>
			<div class={fieldCls}>
				<label for="companySize" class={labelCls}>Size</label>
				<select id="companySize" name="companySize" required
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white">
					{#each companySizes as s}
						<option value={s.code} selected={c.companySize === s.code}>{s.code} — {s.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class={fieldCls}>
			<label for="description" class={labelCls}>Description</label>
			<textarea id="description" name="description" required rows="3"
				class="px-3 py-2.5 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 resize-none bg-white"
			>{c.description}</textarea>
		</div>

		<div class={fieldCls}>
			<label for="imageOrigin" class={labelCls}>Source URL</label>
			<input id="imageOrigin" name="imageOrigin" type="url" value={c.imageOrigin ?? ''} class={inputCls} />
		</div>

		<div class={fieldCls}>
			<label for="status" class={labelCls}>Status</label>
			<select id="status" name="status"
				class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white">
				{#each ['pending', 'approved', 'rejected'] as s}
					<option value={s} selected={c.status === s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
				{/each}
			</select>
		</div>

		<div class="flex gap-2 pt-1">
			<button type="submit"
				class="h-9 flex-1 bg-black text-white text-[13px] rounded hover:bg-black/80 transition-colors">
				Save changes
			</button>
			<a href="/admin/pending"
				class="h-9 px-4 flex items-center text-[13px] border border-[#e1e1e1] rounded hover:bg-[#f7f8fa] transition-colors">
				Cancel
			</a>
		</div>
	</form>
