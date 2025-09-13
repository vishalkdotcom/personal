<script lang="ts">
	type Picture = {
		src: string;
		sources?: { srcset: string; type: string }[];
		img: { src: string; w: number; h: number };
	};

	interface Props {
		src: string | Picture; // Can be enhanced image module or string path
		alt: string;
		width?: number | string;
		height?: number | string;
		class?: string;
		loading?: 'lazy' | 'eager';
		sizes?: string; // Optional with sensible default
	}

	let { 
		src, 
		alt, 
		width, 
		height, 
		class: className = '', 
		loading = 'lazy',
		sizes = '100vw' // Default to full viewport width
	}: Props = $props();

	// Check if this is an enhanced image module (object) or a string path
	const isEnhancedImage = typeof src === 'object' && src !== null;
</script>

{#if isEnhancedImage}
	<!-- Use enhanced:img for optimized image modules -->
	<enhanced:img 
		{src} 
		{alt} 
		{loading}
		sizes={sizes}
		class={`w-full h-auto ${className}`}
	/>
{:else}
	<!-- Use regular img for string paths -->
	<img 
		{src} 
		{alt} 
		{width} 
		{height} 
		{loading}
		{sizes}
		class={`w-full h-auto ${className}`}
	/>
{/if}