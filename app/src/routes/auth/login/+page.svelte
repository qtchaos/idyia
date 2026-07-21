<script lang="ts">
	import { createAuthClient } from 'better-auth/client';
	import { goto } from '$app/navigation';

	const client = createAuthClient();

	let email    = $state('');
	let password = $state('');
	let err      = $state('');
	let loading  = $state(false);

	async function login() {
		loading = true; err = '';
		const { error } = await client.signIn.email({ email, password, callbackURL: '/' });
		if (error) { err = error.message ?? 'Login failed'; loading = false; }
	}

	async function loginDiscord() {
		await client.signIn.social({ provider: 'discord', callbackURL: '/' });
	}
</script>

<div class="flex-1 flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<h1 class="text-2xl mb-1">Sign in</h1>
		<p class="text-[13px] text-black/40 mb-8">Welcome back to idyia</p>

		{#if err}
			<div class="mb-5 px-3 py-2.5 border border-red-200 bg-red-50 rounded text-[13px] text-red-700">{err}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); login(); }} class="flex flex-col gap-3">
			<div class="flex flex-col gap-1.5">
				<label for="email" class="text-[12px] font-medium text-black/50">Email</label>
				<input id="email" type="email" bind:value={email} required autocomplete="email"
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="password" class="text-[12px] font-medium text-black/50">Password</label>
				<input id="password" type="password" bind:value={password} required autocomplete="current-password"
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white" />
			</div>
			<button type="submit" disabled={loading}
				class="mt-1 h-9 bg-black text-white text-[13px] rounded hover:bg-black/80 disabled:opacity-40 transition-colors">
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>

		<div class="my-5 flex items-center gap-3">
			<div class="flex-1 border-t border-[#e1e1e1]"></div>
			<span class="text-[11px] text-black/25">or</span>
			<div class="flex-1 border-t border-[#e1e1e1]"></div>
		</div>

		<button onclick={loginDiscord}
			class="w-full h-9 flex items-center justify-center gap-2 border border-[#e1e1e1] rounded text-[13px] hover:bg-[#f7f8fa] transition-colors">
			<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
			</svg>
			Continue with Discord
		</button>

		<p class="mt-6 text-center text-[12px] text-black/35">
			No account? <a href="/auth/register" class="text-black hover:underline">Register</a>
		</p>
	</div>
</div>
