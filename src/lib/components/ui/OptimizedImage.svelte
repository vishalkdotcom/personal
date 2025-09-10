<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		class?: string;
		loading?: 'lazy' | 'eager';
	}

	let { src, alt, width, height, class: className = '', loading = 'lazy' }: Props = $props();

	// Extract filename without extension for optimized versions
	const filename = src.split('/').pop()?.split('.')[0] || '';
	const optimizedBase = `/images/optimized/${filename}`;

	// Generate srcset for different sizes and formats
	const sizes = [400, 800, 1200, 1600];
	
	function generateSrcSet(format: string): string {
		return sizes
			.map(size => `${optimizedBase}-${size}.${format} ${size}w`)
			.join(', ');
	}
</script>

<picture class={className}>
	<!-- Modern formats for better compression -->
	<source 
		srcset={generateSrcSet('avif')} 
		type="image/avif" 
		sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1440px) 1200px, 1600px"
	/>
	<source 
		srcset={generateSrcSet('webp')} 
		type="image/webp" 
		sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1440px) 1200px, 1600px"
	/>
	<source 
		srcset={generateSrcSet('jpeg')} 
		type="image/jpeg" 
		sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1440px) 1200px, 1600px"
	/>
	
	<!-- Fallback image -->
	<img 
		{src} 
		{alt} 
		{width} 
		{height} 
		{loading}
		class="w-full h-auto"
	/>
</picture>