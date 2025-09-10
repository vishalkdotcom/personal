<!--
  ProjectList.svelte
  Migrated from components/work/project-list.tsx
  Displays a list of projects with image carousels and modal functionality
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ProjectInfo } from '$lib/data/projects';
	import ProjectDetails from './ProjectDetails.svelte';
	import ProjectCarousel from './ProjectCarousel.svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	export let projects: ProjectInfo[];

	type OpenProjectImageOption = {
		imageIndex: number;
		projectIndex: number;
	};

	let openImageOptions: OpenProjectImageOption | null = null;
	let modalDialog: HTMLDialogElement;

	$: modalOpen = openImageOptions != null;
	$: currentProject = openImageOptions ? projects[openImageOptions.projectIndex] : null;

	function handlePrevImage() {
		if (openImageOptions && currentProject) {
			const newIndex = openImageOptions.imageIndex === 0
				? currentProject.images.length - 1
				: openImageOptions.imageIndex - 1;
			
			openImageOptions = {
				...openImageOptions,
				imageIndex: newIndex
			};
		}
	}

	function handleNextImage() {
		if (openImageOptions && currentProject) {
			const newIndex = openImageOptions.imageIndex === currentProject.images.length - 1
				? 0
				: openImageOptions.imageIndex + 1;

			openImageOptions = {
				...openImageOptions,
				imageIndex: newIndex
			};
		}
	}

	function setModalOpen(open: boolean) {
		if (!open) {
			openImageOptions = null;
			if (modalDialog) {
				modalDialog.close();
			}
		} else if (modalDialog) {
			modalDialog.showModal();
		}
	}

	function handleImageClick(projectIndex: number, imageIndex: number) {
		openImageOptions = { projectIndex, imageIndex };
		setModalOpen(true);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (modalOpen) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				handlePrevImage();
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				handleNextImage();
			} else if (event.key === 'Escape') {
				event.preventDefault();
				setModalOpen(false);
			}
		}
	}

	function handleModalClick(event: MouseEvent) {
		// Close modal when clicking outside the content area
		if (event.target === modalDialog) {
			setModalOpen(false);
		}
	}

	// Watch for modal state changes
	$: if (modalOpen && modalDialog) {
		modalDialog.showModal();
	} else if (!modalOpen && modalDialog) {
		modalDialog.close();
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});
</script>

<section {...$$restProps}>
	<div class="flex flex-col gap-y-16 sm:gap-y-20">
		{#each projects as project, projectIndex}
			<ProjectDetails
				title={project.title}
				description={project.description}
				link={project.link}
			>
				<ProjectCarousel
					currentIndex={openImageOptions?.projectIndex === projectIndex ? openImageOptions.imageIndex : 0}
					class="mt-6 sm:mt-8"
					images={project.images}
					onImageClick={(imageIndex) => handleImageClick(projectIndex, imageIndex)}
					title={project.title}
				/>
			</ProjectDetails>
		{/each}
	</div>

	<!-- Modal Dialog -->
	<dialog
		bind:this={modalDialog}
		class="max-w-4xl max-h-[90vh] w-full bg-background border rounded-lg shadow-xl backdrop:bg-black backdrop:bg-opacity-50 p-0 overflow-hidden"
		on:click={handleModalClick}
	>
		{#if currentProject && openImageOptions}
			<!-- Header -->
			<div class="sticky top-0 bg-background z-20 p-6 pb-4 shadow-md flex justify-between items-center border-b">
				<h3 class="text-lg font-semibold">{currentProject.title}</h3>
				<button
					class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
					on:click={() => setModalOpen(false)}
					aria-label="Close"
				>
					<!-- Cross Icon -->
					<svg
						class="h-4 w-4"
						width="15"
						height="15"
						viewBox="0 0 15 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
							fill="currentColor"
							fill-rule="evenodd"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 pt-2 relative overflow-y-auto">
				<div class="relative overflow-hidden mt-4">
					<OptimizedImage
						alt="{currentProject.title} screenshot"
						class="w-full h-auto"
						src={currentProject.images[openImageOptions.imageIndex]}
						width="1200"
						height="675"
					/>
				</div>

				<!-- Navigation Buttons -->
				<div class="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-none">
					<button
						class="bg-black/50 p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity duration-300 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
						on:click={handlePrevImage}
						aria-label="Previous image"
					>
						<!-- Chevron Left Icon -->
						<svg class="w-6 h-6 text-white" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
						</svg>
					</button>
					<button
						class="bg-black/50 p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity duration-300 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
						on:click={handleNextImage}
						aria-label="Next image"
					>
						<!-- Chevron Right Icon -->
						<svg class="w-6 h-6 text-white" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</dialog>
</section>