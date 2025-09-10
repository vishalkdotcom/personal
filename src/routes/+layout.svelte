<script lang="ts">
	import '../app.postcss';
	import Navbar from '$lib/components/Navbar.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import TailwindIndicator from '$lib/components/TailwindIndicator.svelte';
</script>

<svelte:head>
	<link rel="canonical" href="https://vishalk.com" />
	<link rel="icon" href="/favicon.ico" />
	<link rel="shortcut icon" href="/favicon-16x16.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
</svelte:head>

<div class="overflow-y-scroll font-sans antialiased">
	<div class="sticky top-0 z-10">
		<Navbar />
	</div>
	<main class="container py-20">
		<slot />
	</main>
	<ScrollToTop />
	<TailwindIndicator />
</div>