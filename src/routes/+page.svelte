<script lang="ts">
	import type { PageData } from './$types';
	import FadeInSection from '$lib/components/FadeInSection.svelte';
	import Intro from '$lib/components/home/Intro.svelte';
	import SocialLinks from '$lib/components/home/SocialLinks.svelte';
	import Expertise from '$lib/components/home/Expertise.svelte';
	import ProfessionIntro from '$lib/components/home/ProfessionIntro.svelte';
	import WorkSection from '$lib/components/home/WorkSection.svelte';
	import ContactSection from '$lib/components/home/ContactSection.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.siteConfig.name}</title>
	<meta name="description" content={data.siteConfig.description} />
	<meta name="keywords" content={data.siteConfig.keywords.join(', ')} />
	<meta name="author" content="Vishal Kumar" />
	<meta name="creator" content="Vishal Kumar" />
	
	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_IN" />
	<meta property="og:url" content={data.siteConfig.url} />
	<meta property="og:title" content={data.siteConfig.name} />
	<meta property="og:description" content={data.siteConfig.description} />
	<meta property="og:site_name" content={data.siteConfig.name} />
	<meta property="og:image" content={data.siteConfig.ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={data.siteConfig.name} />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.siteConfig.name} />
	<meta name="twitter:description" content={data.siteConfig.description} />
	<meta name="twitter:image" content={data.siteConfig.ogImage} />
	<meta name="twitter:creator" content="@vishalkdotcom" />
</svelte:head>

<article class="space-y-16 sm:space-y-24 lg:space-y-32">
	<FadeInSection>
		<section id="intro" class="space-y-12 sm:space-y-16 lg:space-y-20">
			<div>
				<Intro />
				<SocialLinks className="mt-6 sm:mt-8 lg:mt-10" />
			</div>
			<Expertise />
			<ProfessionIntro />
		</section>
	</FadeInSection>

	<FadeInSection>
		<section
			id="work"
			class="pt-16 sm:pt-24 lg:pt-32 border-t border-gray-100"
		>
			<WorkSection />
		</section>
	</FadeInSection>

	<FadeInSection>
		<section
			id="contact"
			class="pt-16 sm:pt-24 lg:pt-32 border-t border-gray-100"
		>
			<ContactSection />
		</section>
	</FadeInSection>
</article>