<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import { createAuthClient } from 'better-auth/client';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const client = createAuthClient();

	async function logout() {
		await client.signOut({
			fetchOptions: { onSuccess: () => { window.location.href = '/'; } },
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>idyia</title>
</svelte:head>

<nav class="border-b border-black/10 px-4 sm:px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
	<a href="/" class="font-bold text-sm tracking-tight">idyia</a>
	<div class="flex items-center gap-4 text-sm">
		{#if data.user}
			{#if data.role === 'moderator' || data.role === 'admin'}
				<a href="/admin" class="text-black/50 hover:text-black transition-colors text-xs">Admin</a>
			{/if}
			<a href="/submit" class="text-black/50 hover:text-black transition-colors text-xs">Submit</a>
			<span class="text-black/25 text-xs hidden sm:inline">{data.user.name}</span>
			<button onclick={logout} class="text-black/35 hover:text-black transition-colors text-xs">
				Sign out
			</button>
		{:else}
			<a href="/auth/login" class="text-black/50 hover:text-black transition-colors text-xs">Sign in</a>
			<a
				href="/auth/register"
				class="px-3 py-1.5 bg-black text-white rounded text-xs hover:bg-black/80 transition-colors"
			>Register</a>
		{/if}
	</div>
</nav>

{@render children()}
