<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = $state(false);

	function toggleVisibility() {
		isVisible = window.scrollY > 300;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	onMount(() => {
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	});
</script>

{#if isVisible}
	<button
		onclick={scrollToTop}
		class="fixed bottom-4 right-4 rounded-full p-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
		aria-label="Scroll to top"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
		</svg>
	</button>
{/if}