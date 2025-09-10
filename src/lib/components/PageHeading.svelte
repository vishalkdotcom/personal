<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
</script>

<h1 class="-ml-1 font-display text-4xl font-normal tracking-wide sm:-ml-2 sm:text-6xl lg:text-8xl">
	{text}
</h1>