<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

	<a href="/" class="text-[12px] text-black/35 hover:text-black transition-colors mb-3 inline-block">← back</a>
<h1 class="text-2xl mb-1">Admin</h1>
	<p class="text-[13px] text-black/40 mb-8">Manage submissions, amendments, and users</p>

	<div class="border border-[#e1e1e1] rounded overflow-hidden">
		<a href="/admin/pending"
			class="flex items-center justify-between px-4 py-3 border-b border-[#e1e1e1] hover:bg-[#f7f8fa] transition-colors group">
			<div>
				<div class="text-[13px] font-medium">Pending submissions</div>
				<div class="text-[12px] text-black/40 mt-0.5">Review new company entries and amendments</div>
			</div>
			<span class="text-black/20 group-hover:text-black transition-colors text-lg">→</span>
		</a>
		<a href="/admin/users"
			class="flex items-center justify-between px-4 py-3 hover:bg-[#f7f8fa] transition-colors group">
			<div>
				<div class="text-[13px] font-medium">Users</div>
				<div class="text-[12px] text-black/40 mt-0.5">Assign roles and manage contributor permissions</div>
			</div>
			<span class="text-black/20 group-hover:text-black transition-colors text-lg">→</span>
		</a>
	</div>
