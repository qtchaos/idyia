<script lang="ts">
	import { createAuthClient } from 'better-auth/client';

	const client = createAuthClient();

	let name     = $state('');
	let email    = $state('');
	let password = $state('');
	let err      = $state('');
	let loading  = $state(false);

	async function register() {
		loading = true; err = '';
		const { error } = await client.signUp.email({ name, email, password, callbackURL: '/' });
		if (error) { err = error.message ?? 'Registration failed'; loading = false; }
	}
</script>

<div class="py-20 flex justify-center">
	<div class="w-full max-w-sm">
		<h1 class="text-2xl mb-1">Create account</h1>
		<p class="text-[13px] text-black/40 mb-8">Start contributing now, the power to shape the future of accountability is in your hands.</p>

		{#if err}
			<div class="mb-5 px-3 py-2.5 border border-red-200 bg-red-50 rounded text-[13px] text-red-700">{err}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); register(); }} class="flex flex-col gap-3">
			<div class="flex flex-col gap-1.5">
				<label for="name" class="text-[12px] font-medium text-black/50">Display name</label>
				<input id="name" type="text" bind:value={name} required autocomplete="name"
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="email" class="text-[12px] font-medium text-black/50">Email</label>
				<input id="email" type="email" bind:value={email} required autocomplete="email"
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="password" class="text-[12px] font-medium text-black/50">Password</label>
				<input id="password" type="password" bind:value={password} required minlength="8" autocomplete="new-password"
					class="h-9 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white" />
				<span class="text-[11px] text-black/30">Minimum 8 characters</span>
			</div>
			<button type="submit" disabled={loading}
				class="mt-1 h-9 bg-black text-white text-[13px] rounded hover:bg-black/80 disabled:opacity-40 transition-colors">
				{loading ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="mt-6 text-center text-[12px] text-black/35">
			Already have an account? <a href="/auth/login" class="text-black hover:underline">Sign in</a>
		</p>
	</div>

</div>
