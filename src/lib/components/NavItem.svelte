<script lang="ts">
	interface Props {
		href: string;
		active: boolean;
		onClick?: () => void;
	}

	let { href, active, onClick }: Props = $props();
</script>

<a
	{href}
	class={`text-sm sm:text-base transition-colors duration-200 ${
		active
			? "text-foreground font-medium"
			: "text-muted-foreground hover:text-foreground"
	}`}
	on:click={onClick}
>
	<slot />
</a>