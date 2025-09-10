<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		type?: string;
		placeholder?: string;
		required?: boolean;
		name?: string;
		id?: string;
		value?: string;
		class?: string;
		bind?: any;
	}

	let {
		type = 'text',
		placeholder = '',
		required = false,
		name,
		id,
		value = '',
		class: className,
		...restProps
	}: Props = $props();

	const inputClass = cn(
		'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<input
	class={inputClass}
	{type}
	{placeholder}
	{required}
	{name}
	{id}
	bind:value
	{...restProps}
/>