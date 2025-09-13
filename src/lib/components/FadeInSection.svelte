<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let isVisible = $state(false);
	let domRef: HTMLDivElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isVisible = true;
						// Disconnect observer after first intersection for performance
						observer.unobserve(entry.target);
					}
				});
			},
			{
				// Only trigger once when element becomes visible
				threshold: 0.1,
				rootMargin: '50px 0px -50px 0px'
			}
		);

		if (domRef) {
			observer.observe(domRef);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={domRef}
	class={`section-fade-in ${isVisible ? "visible" : ""}`}
>
	{@render children()}
</div>