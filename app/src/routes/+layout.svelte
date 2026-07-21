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

<div class="flex flex-col" style="height:100dvh">
	<!-- Slim top bar -->
	<header class="flex items-center justify-between px-4 h-9 shrink-0 border-b border-[#e1e1e1] bg-white pt-1">
		<a href="/" class="text-2xl tracking-tight leading-none font-vg">idyia</a>

		<div class="flex items-center gap-3 text-sm">
			{#if data.user}
				{#if data.role === 'moderator' || data.role === 'admin'}
					<a href="/admin" class="text-black/50 hover:text-black transition-colors">admin</a>
				{/if}
				<a href="/submit" class="text-black/50 hover:text-black transition-colors">submit</a>
				<button onclick={logout} class="text-black/35 hover:text-black transition-colors">sign out</button>
			{:else}
				<a href="/auth/register" class="text-black/50 hover:text-black transition-colors">register</a>
				<a href="/auth/login" class="px-2.5 py-1 bg-black text-white rounded hover:bg-black/80 transition-colors">sign in</a>
			{/if}
		</div>
	</header>

	<!-- Page content fills remaining height -->
	<div class="flex-1 flex flex-col overflow-hidden">
		{@render children()}
	</div>
</div>
