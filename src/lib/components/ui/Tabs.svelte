<!--
  Tabs.svelte
  Simple tabs component for SvelteKit migration
-->

<script lang="ts">
	export let value: string;
	export let tabs: Array<{ value: string; label: string }>;
	export let onchange: ((event: { value: string }) => void) | undefined = undefined;

	function handleTabClick(tabValue: string) {
		value = tabValue;
		onchange?.({ value: tabValue });
	}
</script>

<div class="w-full">
	<!-- Tabs List -->
	<div class="sticky top-16 bg-background/80 backdrop-blur-sm z-10 py-2 sm:py-4">
		<div class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
			{#each tabs as tab}
				<button
					class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full {value === tab.value ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50'}"
					on:click={() => handleTabClick(tab.value)}
					type="button"
					role="tab"
					aria-selected={value === tab.value}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Tabs Content -->
	<div class="mt-4 sm:mt-6">
		<slot />
	</div>
</div>