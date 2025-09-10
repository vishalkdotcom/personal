<script lang="ts">
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Contact - Vishal Kumar</title>
	<meta name="description" content="Get in touch with Vishal Kumar for opportunities and collaborations." />
</svelte:head>

<main class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
	<ContactSection {form} actionPath="/?/contact" />
</main>