<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
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
	{@render children()}
</div>