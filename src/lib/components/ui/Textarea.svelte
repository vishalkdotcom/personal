<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		placeholder?: string;
		required?: boolean;
		name?: string;
		id?: string;
		value?: string;
		rows?: number;
		class?: string;
		disabled?: boolean;
		readonly?: boolean;
	}

	let {
		placeholder = '',
		required = false,
		name,
		id,
		value = '',
		rows = 3,
		class: className,
		disabled = false,
		readonly = false,
		...restProps
	}: Props = $props();

	const textareaClass = cn(
		'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<textarea
	class={textareaClass}
	{placeholder}
	{required}
	{name}
	{id}
	{rows}
	{disabled}
	{readonly}
	bind:value
	{...restProps}
></textarea>