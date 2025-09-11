<script lang="ts">
	interface Props {
		href: string;
		active: boolean;
		onClick?: () => void;
		children: import('svelte').Snippet;
	}

	let { href, active, onClick, children }: Props = $props();
</script>

<a
	{href}
	class={`text-sm sm:text-base transition-colors duration-200 ${
		active
			? "text-foreground font-medium"
			: "text-muted-foreground hover:text-foreground"
	}`}
	onclick={onClick}
>
	{@render children()}
</a>