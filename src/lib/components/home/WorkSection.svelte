<script lang="ts">
	import { projects, concepts } from '$lib/data/projects';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import ProjectList from '$lib/components/work/ProjectList.svelte';

	let activeTab = 'projects';

	const tabs = [
		{ value: 'projects', label: 'Projects' },
		{ value: 'concepts', label: 'Concepts' }
	];

	function handleTabChange(event: { value: string }) {
		activeTab = event.value;
	}
</script>

<div class="space-y-6 sm:space-y-8 lg:space-y-12">
	<PageHeading text="Work" />

	<Tabs value={activeTab} {tabs} onchange={handleTabChange}>
		{#if activeTab === 'projects'}
			<ProjectList {projects} />
		{:else if activeTab === 'concepts'}
			<ProjectList projects={concepts} />
		{/if}
	</Tabs>
</div>