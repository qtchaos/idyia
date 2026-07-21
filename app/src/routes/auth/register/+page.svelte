<script lang="ts">
	import { createAuthClient } from 'better-auth/client';

	const client = createAuthClient();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	async function register() {
		loading = true;
		errorMsg = '';
		const { error } = await client.signUp.email({ name, email, password, callbackURL: '/' });
		if (error) {
			errorMsg = error.message ?? 'Registration failed';
			loading = false;
		}
	}
</script>

<div class="min-h-[calc(100vh-49px)] flex items-center justify-center bg-white px-4">
	<div class="w-full max-w-sm">
		<h1 class="text-xl font-semibold mb-6">Create account</h1>

		{#if errorMsg}
			<p class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
				{errorMsg}
			</p>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); register(); }} class="flex flex-col gap-3">
			<input
				type="text"
				placeholder="Display name"
				bind:value={name}
				required
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
			/>
			<input
				type="email"
				placeholder="Email"
				bind:value={email}
				required
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
			/>
			<input
				type="password"
				placeholder="Password (min 8 chars)"
				bind:value={password}
				required
				minlength="8"
				class="px-3 py-2.5 border border-black/20 rounded text-sm focus:outline-none focus:border-black/60"
			/>
			<button
				type="submit"
				disabled={loading}
				class="py-2.5 bg-black text-white text-sm rounded hover:bg-black/80 disabled:opacity-50 transition-colors"
			>
				{loading ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="mt-5 text-xs text-black/40 text-center">
			Already have an account?
			<a href="/auth/login" class="underline hover:text-black">Sign in</a>
		</p>
	</div>
</div>
