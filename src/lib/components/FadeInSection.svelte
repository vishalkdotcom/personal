<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = $state(false);
	let domRef: HTMLDivElement;

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => isVisible = entry.isIntersecting);
		});

		if (domRef) {
			observer.observe(domRef);
		}

		return () => {
			if (domRef) {
				observer.unobserve(domRef);
			}
		};
	});
</script>

<div
	bind:this={domRef}
	class={`section-fade-in ${isVisible ? "visible" : ""}`}
>
	<slot />
</div>