<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	// ActionData type for contact form
	type ContactActionData = {
		success?: boolean;
		error?: boolean;
		message?: string;
		issues?: Record<string, string[]>;
	};

	interface Props {
		form?: ContactActionData;
	}

	let { form }: Props = $props();
	let submitting = $state(false);

	function handleSubmit() {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}
</script>

<section id="contact" class="space-y-16 sm:space-y-20 lg:space-y-24">
	<PageHeading text="Contact" />
	<div class="grid gap-12 sm:grid-cols-2 lg:gap-16">
		<aside class="space-y-6 sm:space-y-8">
			<h2
				class="-ml-px font-display text-xl font-normal uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-4xl lg:leading-none"
			>
				Get in touch
			</h2>
			<p
				class="mt-4 max-w-xl text-base leading-relaxed tracking-wide sm:mt-6 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed text-muted-foreground"
			>
				I'm always open to new opportunities and collaborations. Feel free to reach out!
			</p>
		</aside>
		<article>
			<form method="POST" action="?/contact" use:enhance={handleSubmit} class="space-y-6">
				<div class="space-y-2">
					<label for="name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
					<Input
						type="text"
						name="name"
						id="name"
						placeholder="Your Name"
						required
						class={form?.issues?.name ? 'border-red-500' : ''}
					/>
					{#if form?.issues?.name}
						<p class="text-sm text-red-600">{form.issues.name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
					<Input
						type="email"
						name="email"
						id="email"
						placeholder="Your Email"
						required
						class={form?.issues?.email ? 'border-red-500' : ''}
					/>
					{#if form?.issues?.email}
						<p class="text-sm text-red-600">{form.issues.email[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="message" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
					<Textarea
						name="message"
						id="message"
						placeholder="Your Message"
						rows={5}
						required
						class={form?.issues?.message ? 'border-red-500' : ''}
					/>
					{#if form?.issues?.message}
						<p class="text-sm text-red-600">{form.issues.message[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full sm:w-auto" disabled={submitting}>
					{#snippet children()}
						{submitting ? 'Sending...' : 'Send Message'}
					{/snippet}
				</Button>

				{#if form?.success}
					<p class="text-green-600">Message sent successfully!</p>
				{/if}
				{#if form?.error}
					<p class="text-red-600">
						{form.message}
						{#if form.message?.includes('try again')}
							or <a href="mailto:hello@vishalk.com" class="underline">contact me directly</a>
						{/if}
					</p>
				{/if}
			</form>
		</article>
	</div>
</section>