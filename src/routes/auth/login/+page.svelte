<script lang="ts">
	import { onMount } from 'svelte';
	import { createAuthClient } from 'better-auth/client';
	import { env } from '$env/dynamic/public';
		const PUBLIC_TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY;

	const client = createAuthClient();

	let email = $state('');
	let password = $state('');
	let err = $state('');
	let loading = $state(false);
	let turnstileToken = $state('');

	// Button is enabled immediately when Turnstile is not configured (dev mode),
	// or once the widget verifies the user.
	const canSubmit = $derived(!PUBLIC_TURNSTILE_SITE_KEY || !!turnstileToken);

	onMount(() => {
		(window as any).__tsCallback = (t: string) => { turnstileToken = t; };
		(window as any).__tsExpired = () => { turnstileToken = ''; };
	});

	async function login() {
		loading = true; err = '';
		const { error } = await client.signIn.email({
			email,
			password,
			callbackURL: '/',
			fetchOptions: PUBLIC_TURNSTILE_SITE_KEY
				? { headers: { 'x-captcha-response': turnstileToken } }
				: undefined,
		});
		if (error) { err = error.message ?? 'Login failed'; loading = false; }
	}

	async function loginDiscord() {
		await client.signIn.social({ provider: 'discord', callbackURL: '/' });
	}
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<div class="py-20 flex justify-center">
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

			{#if PUBLIC_TURNSTILE_SITE_KEY}
				<div class="cf-turnstile"
					data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}
					data-theme="light"
					data-callback="__tsCallback"
					data-expired-callback="__tsExpired">
				</div>
			{/if}

			<button type="submit" disabled={loading || !canSubmit}
				class="mt-1 h-9 bg-black text-white text-[13px] rounded hover:bg-black/80 disabled:opacity-40 transition-colors">
				{loading ? 'Signing in…' : !canSubmit ? 'Verifying…' : 'Sign in'}
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
				<path fill-rule="evenodd" d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
			</svg>
			Continue with Discord
		</button>

		<p class="mt-6 text-center text-[12px] text-black/35">
			No account? <a href="/auth/register" class="text-black hover:underline">Register</a>
		</p>
	</div>
</div>
