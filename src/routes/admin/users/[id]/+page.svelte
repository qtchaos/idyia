<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import KarmaBadge from '$lib/components/KarmaBadge.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const p = $derived(data.profile);

	const roles = ['contributor', 'trusted_contributor', 'moderator', 'admin'] as const;
	type Role = (typeof roles)[number];
	const roleLabels: Record<Role, string> = {
		contributor: 'Contributor',
		trusted_contributor: 'Trusted contributor',
		moderator: 'Moderator',
		admin: 'Admin',
	};

	const reasonLabels: Record<string, string> = {
		company_approved: 'Company approved',
		company_rejected: 'Company rejected',
		alternative_approved: 'Alternative approved',
		alternative_rejected: 'Alternative rejected',
		admin_adjustment: 'Admin adjustment',
	};

	const reasonCls: Record<string, string> = {
		company_approved: 'text-emerald-600',
		company_rejected: 'text-red-500',
		alternative_approved: 'text-blue-600',
		alternative_rejected: 'text-orange-500',
		admin_adjustment: 'text-purple-600',
	};

	function fmtDate(d: Date | null | undefined) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function fmtDateTime(d: Date | null | undefined) {
		if (!d) return '—';
		return new Date(d).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	let editingProfile = $state(false);
	let editName = $derived(data.profile.name);
	let editEmail = $derived(data.profile.email);

	$effect(() => {
		if ((form as any)?.success && editingProfile) {
			editingProfile = false;
		}
	});

	let karmaAmount = $state('');
	let karmaNote = $state('');

	function resetKarmaForm() {
		karmaAmount = '';
		karmaNote = '';
	}
</script>

<a href="/admin/users" class="text-[12px] text-black/35 hover:text-black transition-colors mb-1 block">← back to users</a>

<!-- ── User header ── -->
<div class="mb-8">
	<h1 class="text-2xl mb-1">{p.name}</h1>
	<div class="flex items-center gap-3 text-[13px] text-black/45">
		<span>{p.email}</span>
		<span class="text-black/20">·</span>
		<span>joined {fmtDate(p.createdAt)}</span>
		<span class="text-black/20">·</span>
		<span>{roleLabels[(p.role as Role) ?? 'contributor']}</span>
	</div>
</div>

<!-- ── Flash ── -->
{#if (form as any)?.success}
	<div class="mb-6 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] rounded">
		{(form as any).success}
	</div>
{/if}
{#if (form as any)?.error}
	<div class="mb-6 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-[13px] rounded">
		{(form as any).error}
	</div>
{/if}

<!-- ── Edit profile ── -->
<section class="mb-8">
	<div class="flex items-center justify-between mb-3">
		<h2 class="text-[13px] font-semibold text-black/50">Profile</h2>
		<button
			onclick={() => { editingProfile = !editingProfile; }}
			class="text-[12px] text-black/35 hover:text-black transition-colors"
		>
			{editingProfile ? 'cancel' : 'edit'}
		</button>
	</div>

	{#if editingProfile}
		<form method="POST" action="?/editProfile" use:enhance class="border border-[#e1e1e1] rounded p-4 space-y-3">
			<div>
				<label for="edit-name" class="block text-[11px] text-black/45 mb-1">Name</label>
				<input id="edit-name" name="name" type="text" bind:value={editName} required
					class="w-full h-8 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40" />
			</div>
			<div>
				<label for="edit-email" class="block text-[11px] text-black/45 mb-1">Email</label>
				<input id="edit-email" name="email" type="email" bind:value={editEmail} required
					class="w-full h-8 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40" />
			</div>
			<div class="pt-1">
				<button type="submit" class="h-7 px-3 text-[12px] bg-black text-white rounded hover:bg-black/80 transition-colors">
					Save changes
				</button>
			</div>
		</form>
	{:else}
		<div class="border border-[#e1e1e1] rounded overflow-hidden">
			<div class="grid grid-cols-[120px_1fr] border-b border-[#e1e1e1]">
				<div class="px-4 py-2.5 text-[11px] text-black/40 bg-[#fafafa] flex items-center">Name</div>
				<div class="px-4 py-2.5 text-[13px]">{p.name}</div>
			</div>
			<div class="grid grid-cols-[120px_1fr] border-b border-[#e1e1e1]">
				<div class="px-4 py-2.5 text-[11px] text-black/40 bg-[#fafafa] flex items-center">Email</div>
				<div class="px-4 py-2.5 text-[13px]">{p.email}</div>
			</div>
			<div class="grid grid-cols-[120px_1fr]">
				<div class="px-4 py-2.5 text-[11px] text-black/40 bg-[#fafafa] flex items-center">Role</div>
				<div class="px-3 py-2 flex items-center">
					<form method="POST" action="?/setRole" use:enhance>
						<select name="role" value={p.role ?? 'contributor'}
							onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
							class="h-7 px-2 text-[12px] border border-[#e1e1e1] rounded bg-white focus:outline-none focus:border-black/40">
							{#each roles as r}
								<option value={r}>{roleLabels[r]}</option>
							{/each}
						</select>
					</form>
				</div>
			</div>
		</div>
	{/if}
</section>

<!-- ── Karma ── -->
<section class="mb-8">
	<div class="flex items-baseline gap-3 mb-3">
		<h2 class="text-[13px] font-semibold text-black/50">Karma</h2>
		<KarmaBadge karma={p.karma ?? 0} />
	</div>

	<!-- Add adjustment -->
	<form method="POST" action="?/addKarma"
		use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') resetKarmaForm(); }}
		class="border border-[#e1e1e1] rounded p-4 mb-4"
	>
		<p class="text-[11px] text-black/40 mb-3">Manual karma adjustment</p>
		<div class="flex items-end gap-2">
			<div class="shrink-0">
				<label for="karma-amount" class="block text-[11px] text-black/40 mb-1">Amount (±)</label>
				<input id="karma-amount" name="amount" type="number" placeholder="-20 or +15"
					bind:value={karmaAmount} required
					class="w-28 h-8 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40" />
			</div>
			<div class="flex-1">
				<label for="karma-note" class="block text-[11px] text-black/40 mb-1">Note (optional)</label>
				<input id="karma-note" name="note" type="text" placeholder="Reason for adjustment…"
					bind:value={karmaNote} maxlength="200"
					class="w-full h-8 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40" />
			</div>
			<button type="submit" class="shrink-0 h-8 px-3 text-[12px] bg-black text-white rounded hover:bg-black/80 transition-colors">
				Apply
			</button>
		</div>
	</form>

	<!-- Transaction history -->
	{#if p.transactions.length === 0}
		<div class="border border-[#e1e1e1] rounded px-4 py-12 text-center text-[13px] text-black/30">
			No karma transactions yet.
		</div>
	{:else}
		<div class="border border-[#e1e1e1] rounded overflow-hidden">
			<div class="grid grid-cols-[150px_160px_70px_1fr_36px] border-b-2 border-[#e1e1e1] bg-white">
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45">Date</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Reason</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Amount</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Note / Reference</div>
				<div class="border-l border-[#e1e1e1]"></div>
			</div>
			{#each p.transactions as tx, i}
				<div class="grid grid-cols-[150px_160px_70px_1fr_36px] {i < p.transactions.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
					<div class="px-3 py-2.5 flex items-center text-[11px] text-black/40 leading-snug">{fmtDateTime(tx.createdAt)}</div>
					<div class="px-3 py-2.5 flex items-center text-[12px] border-l border-[#e1e1e1] {reasonCls[tx.reason]}">
						{reasonLabels[tx.reason] ?? tx.reason}
					</div>
					<div class="px-3 py-2.5 flex items-center text-[13px] font-medium border-l border-[#e1e1e1] {tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}">
						{tx.amount > 0 ? '+' : ''}{tx.amount}
					</div>
					<div class="px-3 py-2.5 flex items-center min-w-0 border-l border-[#e1e1e1]">
						{#if tx.note}
							<span class="text-[12px] text-black/50 italic truncate">{tx.note}</span>
						{:else if tx.referenceId}
							<span class="font-mono text-[11px] text-black/35 truncate">{tx.referenceId}</span>
						{:else}
							<span class="text-[12px] text-black/20">—</span>
						{/if}
					</div>
					<div class="flex items-center justify-center border-l border-[#e1e1e1]">
						<form method="POST" action="?/deleteTx" use:enhance
							onsubmit={(e) => { if (!confirm('Delete this karma transaction? The running total will be adjusted.')) e.preventDefault(); }}>
							<input type="hidden" name="txId" value={tx.id} />
							<button type="submit" class="px-2 py-2 text-[12px] text-black/20 hover:text-red-500 transition-colors" title="Delete">✕</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- ── Submissions ── -->
<section class="mb-8">
	<div class="flex items-baseline gap-3 mb-3">
		<h2 class="text-[13px] font-semibold text-black/50">Submissions</h2>
		<span class="text-[11px] text-black/25">{p.submissions.length}</span>
	</div>

	{#if p.submissions.length === 0}
		<div class="border border-[#e1e1e1] rounded px-4 py-12 text-center text-[13px] text-black/30">
			No submissions.
		</div>
	{:else}
		<div class="border border-[#e1e1e1] rounded overflow-hidden">
			<!-- header -->
			<div class="grid grid-cols-[1fr_110px_95px_110px] border-b-2 border-[#e1e1e1] bg-white">
				<div class="px-4 py-2 text-[11px] font-semibold text-black/45">Company</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Type</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Status</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Submitted</div>
			</div>
			{#each p.submissions as s, i}
				<div class="grid grid-cols-[1fr_110px_95px_110px] {i < p.submissions.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
					<div class="px-4 py-2.5 min-w-0 overflow-hidden flex items-center">
						<a href="/admin/companies/{s.id}/edit" class="text-[13px] font-medium truncate hover:underline">{s.name}</a>
					</div>
					<div class="px-3 py-2.5 flex items-center border-l border-[#e1e1e1]">
						<TypeBadge type={s.companyType} />
					</div>
					<div class="px-3 py-2.5 flex items-center border-l border-[#e1e1e1]">
						<StatusBadge status={s.status} />
					</div>
					<div class="px-3 py-2.5 flex items-center text-[12px] text-black/40 border-l border-[#e1e1e1]">
						{fmtDate(s.createdAt)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- ── Alternatives ── -->
<section>
	<div class="flex items-baseline gap-3 mb-3">
		<h2 class="text-[13px] font-semibold text-black/50">Alternatives</h2>
		<span class="text-[11px] text-black/25">{p.alts.length}</span>
	</div>

	{#if p.alts.length === 0}
		<div class="border border-[#e1e1e1] rounded px-4 py-12 text-center text-[13px] text-black/30">
			No alternatives submitted.
		</div>
	{:else}
		<div class="border border-[#e1e1e1] rounded overflow-hidden">
			<!-- header -->
			<div class="grid grid-cols-[180px_1fr_95px_110px] border-b-2 border-[#e1e1e1] bg-white">
				<div class="px-4 py-2 text-[11px] font-semibold text-black/45">Company</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">URL</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Status</div>
				<div class="px-3 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Submitted</div>
			</div>
			{#each p.alts as a, i}
				<div class="grid grid-cols-[180px_1fr_95px_110px] {i < p.alts.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
					<div class="px-4 py-2.5 min-w-0 overflow-hidden flex items-center">
						{#if a.companyId}
							<a href="/companies/{a.companyId}" class="text-[13px] font-medium truncate hover:underline">
								{a.companyName ?? a.companyId}
							</a>
						{:else}
							<span class="text-[13px] text-black/30">—</span>
						{/if}
					</div>
					<div class="px-3 py-2.5 min-w-0 overflow-hidden flex items-center border-l border-[#e1e1e1]">
						<a href={a.url} target="_blank" rel="noopener noreferrer"
							class="text-[12px] text-black/50 hover:text-black underline underline-offset-2 truncate">
							{a.url}
						</a>
					</div>
					<div class="px-3 py-2.5 flex items-center border-l border-[#e1e1e1]">
						<StatusBadge status={a.status} />
					</div>
					<div class="px-3 py-2.5 flex items-center text-[12px] text-black/40 border-l border-[#e1e1e1]">
						{fmtDate(a.createdAt)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
