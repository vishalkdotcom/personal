<!--
  ProjectCarousel.svelte
  Migrated from components/work/project-carousel.tsx
  Displays a carousel of project images with navigation controls
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	type Picture = {
		src: string;
		sources?: { srcset: string; type: string }[];
		img: { src: string; w: number; h: number };
	};

	export let currentIndex: number = 0;
	export let images: (string | Picture)[];
	export let onImageClick: ((index: number) => void) | undefined = undefined;
	export let title: string;

	let carouselContainer: HTMLDivElement;
	let currentSlide = currentIndex;

	// Update currentSlide when currentIndex prop changes
	$: currentSlide = currentIndex;

	function scrollToPrev() {
		currentSlide = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
		scrollToSlide(currentSlide);
	}

	function scrollToNext() {
		currentSlide = currentSlide === images.length - 1 ? 0 : currentSlide + 1;
		scrollToSlide(currentSlide);
	}

	function scrollToSlide(index: number) {
		if (carouselContainer) {
			const slideWidth = carouselContainer.querySelector('.carousel-item')?.clientWidth || 0;
			const gap = 16; // 1rem gap between slides
			carouselContainer.scrollTo({
				left: index * (slideWidth + gap),
				behavior: 'smooth'
			});
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			scrollToPrev();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			scrollToNext();
		}
	}

	function handleImageClick(index: number) {
		onImageClick?.(index);
	}

	onMount(() => {
		scrollToSlide(currentSlide);
	});
</script>

<div
	class="relative group"
	on:keydown={handleKeyDown}
	{...$$restProps}
>
	<!-- Carousel Container -->
	<div 
		class="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
		bind:this={carouselContainer}
		style="scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none;"
	>
		<div class="flex gap-4">
			{#each images as image, index}
				<div class="carousel-item flex-none w-full sm:w-1/2 lg:w-1/3 snap-start">
					<div class="bg-card border rounded-lg overflow-hidden shadow-sm">
						<button
							class="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 block cursor-pointer hover:opacity-90 transition-opacity"
							on:click={() => handleImageClick(index)}
							aria-label="View larger image {index + 1} of project {title}"
						>
							<div class="relative h-48 sm:h-64">
								<OptimizedImage
									src={image}
									alt="{title} screenshot {index + 1}"
									class="w-full h-full object-cover"
									width="400"
									height="300"
								/>
							</div>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Navigation Buttons -->
	<button
		class="absolute left-4 sm:-left-12 top-1/2 -translate-y-1/2 bg-background border shadow-md rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		on:click={scrollToPrev}
		aria-label="Previous image"
	>
		<!-- Chevron Left Icon -->
		<svg
			class="w-4 h-4"
			width="15"
			height="15"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
				fill="currentColor"
				fill-rule="evenodd"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	<button
		class="absolute right-4 sm:-right-12 top-1/2 -translate-y-1/2 bg-background border shadow-md rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		on:click={scrollToNext}
		aria-label="Next image"
	>
		<!-- Chevron Right Icon -->
		<svg
			class="w-4 h-4"
			width="15"
			height="15"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
				fill="currentColor"
				fill-rule="evenodd"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</div>

<style>
	.scrollbar-hide {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>