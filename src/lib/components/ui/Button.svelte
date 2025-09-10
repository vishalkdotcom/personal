<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: () => void;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className,
		type = 'button',
		disabled = false,
		onclick,
		children,
		...restProps
	}: Props = $props();

	const buttonVariants = {
		base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
		variant: {
			default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
			destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
			outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
			secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
			ghost: 'hover:bg-accent hover:text-accent-foreground',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-9 px-4 py-2',
			sm: 'h-8 rounded-md px-3 text-xs',
			lg: 'h-10 rounded-md px-8',
			icon: 'h-9 w-9'
		}
	};

	const buttonClass = cn(
		buttonVariants.base,
		buttonVariants.variant[variant],
		buttonVariants.size[size],
		className
	);
</script>

<button
	class={buttonClass}
	{type}
	{disabled}
	onclick={onclick}
	{...restProps}
>
	{@render children?.()}
</button>